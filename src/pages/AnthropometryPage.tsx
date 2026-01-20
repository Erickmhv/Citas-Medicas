import { useEffect, useMemo, useState } from "react";
import { EditIcon, TrashIcon } from "../components/Icons";
import PatientPicker from "../components/PatientPicker";
import type { AnthropometricRecord, Patient } from "../lib/types";
import {
  activityFactors,
  calculateAge,
  calculateAnthropometry,
  calculateRee,
  calculateTmb,
  createAnthropometry,
  deactivateAnthropometry,
  fetchAnthropometry,
  updateAnthropometry,
} from "../lib/anthropometry";
import { useToast } from "../components/ToastProvider";

const getTodayDate = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
};

type Draft = {
  recorded_at: string;
  weight_kg: string;
  height_cm: string;
  waist_cm: string;
  hip_cm: string;
  body_fat_pct: string;
  lean_mass_pct: string;
  arm_circumference_cm: string;
  observations: string;
};

const emptyDraft: Draft = {
  recorded_at: getTodayDate(),
  weight_kg: "",
  height_cm: "",
  waist_cm: "",
  hip_cm: "",
  body_fat_pct: "",
  lean_mass_pct: "",
  arm_circumference_cm: "",
  observations: "",
};

function toNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

type AnthropometryPageProps = {
  patient?: Patient;
};

export default function AnthropometryPage({ patient }: AnthropometryPageProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient ?? null);
  const [records, setRecords] = useState<AnthropometricRecord[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    recorded_at: "",
    weight_kg: "",
    height_cm: "",
    waist_cm: "",
    hip_cm: "",
    body_fat_pct: "",
    lean_mass_pct: "",
    arm_circumference_cm: "",
    observations: "",
  });
  const { addToast } = useToast();

  const previewMetrics = useMemo(() => {
    return calculateAnthropometry({
      recorded_at: draft.recorded_at,
      weight_kg: toNumber(draft.weight_kg),
      height_cm: toNumber(draft.height_cm),
      waist_cm: toNumber(draft.waist_cm),
      hip_cm: toNumber(draft.hip_cm),
      body_fat_pct: toNumber(draft.body_fat_pct),
      lean_mass_pct: toNumber(draft.lean_mass_pct),
      arm_circumference_cm: toNumber(draft.arm_circumference_cm),
      observations: draft.observations.trim() || null,
    });
  }, [draft]);

  const formatMetric = (value: number | null) => (value === null ? "-" : value.toFixed(2));

  // Calculo de TMB y REE basado en el registro mas reciente y datos del paciente
  const energyMetrics = useMemo(() => {
    const latestRecord = records[0];
    if (!selectedPatient || !latestRecord) {
      return { tmb: null, ree: null, canCalculate: false, missingFields: [] as string[] };
    }

    const missingFields: string[] = [];

    if (!latestRecord.weight_kg) missingFields.push("peso");
    if (!latestRecord.height_cm) missingFields.push("altura");
    if (!selectedPatient.date_of_birth) missingFields.push("fecha de nacimiento");
    if (!selectedPatient.sex) missingFields.push("sexo");
    if (!selectedPatient.activity_level) missingFields.push("nivel de actividad");

    if (missingFields.length > 0) {
      return { tmb: null, ree: null, canCalculate: false, missingFields };
    }

    const age = calculateAge(selectedPatient.date_of_birth!);
    if (!age) {
      return { tmb: null, ree: null, canCalculate: false, missingFields: ["edad valida"] };
    }

    const tmb = calculateTmb({
      weightKg: latestRecord.weight_kg!,
      heightCm: latestRecord.height_cm!,
      ageYears: age,
      sex: selectedPatient.sex!,
    });

    const ree = calculateRee({
      weightKg: latestRecord.weight_kg!,
      heightCm: latestRecord.height_cm!,
      ageYears: age,
      sex: selectedPatient.sex!,
      activityLevel: selectedPatient.activity_level!,
    });

    return { tmb, ree, canCalculate: true, missingFields: [] };
  }, [records, selectedPatient]);

  const loadRecords = async (patientId: string) => {
    setLoading(true);
    const { data, error: fetchError } = await fetchAnthropometry(patientId);
    if (fetchError) {
      setError(fetchError);
      addToast(fetchError, "error");
      setRecords([]);
    } else {
      setRecords(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (patient) {
      setSelectedPatient(patient);
    }
  }, [patient]);

  useEffect(() => {
    if (!selectedPatient?.id) {
      setRecords([]);
      return;
    }

    loadRecords(selectedPatient.id);
  }, [selectedPatient]);

  const resetForm = () => {
    setDraft({ ...emptyDraft, recorded_at: getTodayDate() });
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({ recorded_at: "", weight_kg: "", height_cm: "", waist_cm: "", hip_cm: "", body_fat_pct: "", lean_mass_pct: "", arm_circumference_cm: "", observations: "" });

    if (!selectedPatient?.id) {
      setError("Selecciona un paciente primero.");
      return;
    }

    let hasErrors = false;
    const nextErrors = { recorded_at: "", weight_kg: "", height_cm: "", waist_cm: "", hip_cm: "", body_fat_pct: "", lean_mass_pct: "", arm_circumference_cm: "", observations: "" };

    if (!draft.recorded_at) {
      nextErrors.recorded_at = "La fecha del registro es obligatoria.";
      hasErrors = true;
    }

    if (!draft.weight_kg.trim()) {
      nextErrors.weight_kg = "El peso es obligatorio.";
      hasErrors = true;
    }

    if (!draft.height_cm.trim()) {
      nextErrors.height_cm = "La altura es obligatoria.";
      hasErrors = true;
    }

    if (!draft.waist_cm.trim()) {
      nextErrors.waist_cm = "La cintura es obligatoria.";
      hasErrors = true;
    }

    if (!draft.hip_cm.trim()) {
      nextErrors.hip_cm = "La cadera es obligatoria.";
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(nextErrors);
      setError("Revisa los campos marcados.");
      return;
    }

    setSaving(true);

    const payload = {
      recorded_at: draft.recorded_at,
      weight_kg: toNumber(draft.weight_kg),
      height_cm: toNumber(draft.height_cm),
      waist_cm: toNumber(draft.waist_cm),
      hip_cm: toNumber(draft.hip_cm),
      body_fat_pct: toNumber(draft.body_fat_pct),
      lean_mass_pct: toNumber(draft.lean_mass_pct),
      arm_circumference_cm: toNumber(draft.arm_circumference_cm),
      observations: draft.observations.trim() || null,
    };

    const { error: actionError } = editingId
      ? await updateAnthropometry(editingId, payload)
      : await createAnthropometry(selectedPatient.id, payload);

    if (actionError) {
      setError(actionError);
      addToast(actionError, "error");
      setSaving(false);
      return;
    }

    resetForm();
    await loadRecords(selectedPatient.id);
    addToast(editingId ? "Registro actualizado." : "Registro guardado.", "success");
    setSaving(false);
  };

  const startEdit = (record: AnthropometricRecord) => {
    setDraft({
      recorded_at: record.recorded_at,
      weight_kg: record.weight_kg?.toString() ?? "",
      height_cm: record.height_cm?.toString() ?? "",
      waist_cm: record.waist_cm?.toString() ?? "",
      hip_cm: record.hip_cm?.toString() ?? "",
      body_fat_pct: record.body_fat_pct?.toString() ?? "",
      lean_mass_pct: record.lean_mass_pct?.toString() ?? "",
      arm_circumference_cm: record.arm_circumference_cm?.toString() ?? "",
      observations: record.observations ?? "",
    });
    setEditingId(record.id);
  };

  const handleDeactivate = async (record: AnthropometricRecord) => {
    const confirm = window.confirm("Deseas desactivar este registro?");
    if (!confirm) return;

    setSaving(true);
    const { error: deactivateError } = await deactivateAnthropometry(record.id);
    if (deactivateError) {
      setError(deactivateError);
      addToast(deactivateError, "error");
    } else if (selectedPatient?.id) {
      await loadRecords(selectedPatient.id);
      addToast("Registro desactivado.", "success");
    }
    setSaving(false);
  };

  return (
    <section className="stack">
      <div className="card">
        <h2>Antropometria</h2>
        <p className="muted">Registra medidas y calcula indicadores automaticamente.</p>
        {!patient ? (
          <PatientPicker
            label="Paciente"
            selectedPatient={selectedPatient}
            onSelect={(nextPatient) => {
              setSelectedPatient(nextPatient);
              resetForm();
            }}
          />
        ) : null}
        {!selectedPatient?.id ? (
          <p className="help">Selecciona un paciente para habilitar el formulario.</p>
        ) : null}
      </div>

      <div className="card">
        <h3>{editingId ? "Editar registro" : "Nuevo registro"}</h3>
        {!selectedPatient?.id ? (
          <div className="alert alert-warning">
            <strong>Paciente no seleccionado</strong>
            <p>Selecciona un paciente en la seccion superior para registrar mediciones antropometricas.</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            <span className="label-text required">Fecha de registro</span>
            <input
              type="date"
              value={draft.recorded_at}
              onChange={(event) => setDraft((current) => ({ ...current, recorded_at: event.target.value }))}
              className={fieldErrors.recorded_at ? "input-error" : ""}
            />
            <span className="help">Por defecto se usa la fecha de hoy.</span>
            {fieldErrors.recorded_at ? (
              <span className="field-error">{fieldErrors.recorded_at}</span>
            ) : null}
          </label>
          <label>
            <span className="label-text required">Peso (kg)</span>
            <input
              type="number"
              step="0.1"
              value={draft.weight_kg}
              onChange={(event) => setDraft((current) => ({ ...current, weight_kg: event.target.value }))}
              className={fieldErrors.weight_kg ? "input-error" : ""}
            />
            <span className="help">Ej: 70.5</span>
            {fieldErrors.weight_kg ? <span className="field-error">{fieldErrors.weight_kg}</span> : null}
          </label>
          <label>
            <span className="label-text required">Altura (cm)</span>
            <input
              type="number"
              step="0.1"
              value={draft.height_cm}
              onChange={(event) => setDraft((current) => ({ ...current, height_cm: event.target.value }))}
              className={fieldErrors.height_cm ? "input-error" : ""}
            />
            <span className="help">Ej: 170</span>
            {fieldErrors.height_cm ? <span className="field-error">{fieldErrors.height_cm}</span> : null}
          </label>
          <label>
            <span className="label-text required">Cintura (cm)</span>
            <input
              type="number"
              step="0.1"
              value={draft.waist_cm}
              onChange={(event) => setDraft((current) => ({ ...current, waist_cm: event.target.value }))}
              className={fieldErrors.waist_cm ? "input-error" : ""}
            />
            <span className="help">Ej: 80</span>
            {fieldErrors.waist_cm ? <span className="field-error">{fieldErrors.waist_cm}</span> : null}
          </label>
          <label>
            <span className="label-text required">Cadera (cm)</span>
            <input
              type="number"
              step="0.1"
              value={draft.hip_cm}
              onChange={(event) => setDraft((current) => ({ ...current, hip_cm: event.target.value }))}
              className={fieldErrors.hip_cm ? "input-error" : ""}
            />
            <span className="help">Ej: 92</span>
            {fieldErrors.hip_cm ? <span className="field-error">{fieldErrors.hip_cm}</span> : null}
          </label>
          <label>
            <span className="label-text">Circunferencia braquial (cm)</span>
            <input
              type="number"
              step="0.1"
              value={draft.arm_circumference_cm}
              onChange={(event) => setDraft((current) => ({ ...current, arm_circumference_cm: event.target.value }))}
              className={fieldErrors.arm_circumference_cm ? "input-error" : ""}
            />
            <span className="help">Ej: 30</span>
            {fieldErrors.arm_circumference_cm ? <span className="field-error">{fieldErrors.arm_circumference_cm}</span> : null}
          </label>
          <label>
            <span className="label-text">% Grasa corporal</span>
            <input
              type="number"
              step="0.1"
              value={draft.body_fat_pct}
              onChange={(event) => setDraft((current) => ({ ...current, body_fat_pct: event.target.value }))}
              className={fieldErrors.body_fat_pct ? "input-error" : ""}
            />
            <span className="help">Ej: 25.5</span>
            {fieldErrors.body_fat_pct ? <span className="field-error">{fieldErrors.body_fat_pct}</span> : null}
          </label>
          <label>
            <span className="label-text">% Masa magra</span>
            <input
              type="number"
              step="0.1"
              value={draft.lean_mass_pct}
              onChange={(event) => setDraft((current) => ({ ...current, lean_mass_pct: event.target.value }))}
              className={fieldErrors.lean_mass_pct ? "input-error" : ""}
            />
            <span className="help">Ej: 74.5</span>
            {fieldErrors.lean_mass_pct ? <span className="field-error">{fieldErrors.lean_mass_pct}</span> : null}
          </label>
          <label className="full-width">
            <span className="label-text">Observaciones</span>
            <textarea
              rows={2}
              value={draft.observations}
              onChange={(event) => setDraft((current) => ({ ...current, observations: event.target.value }))}
              placeholder="Notas adicionales sobre las mediciones..."
              className={fieldErrors.observations ? "input-error" : ""}
            />
            <span className="help">Contexto o comentarios sobre las mediciones.</span>
            {fieldErrors.observations ? <span className="field-error">{fieldErrors.observations}</span> : null}
          </label>
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Guardando..." : editingId ? "Actualizar" : "Guardar"}
            </button>
            {editingId ? (
              <button type="button" onClick={resetForm} disabled={saving}>
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
        )}
        {selectedPatient?.id ? (
          <>
            <div className="divider" />
            <div className="metrics-header">
              <h4>Calculos automaticos</h4>
              <span className="muted">Se actualizan al escribir</span>
            </div>
            <div className="metrics">
              {previewMetrics.map((metric) => (
                <div key={metric.key} className="metric-card">
                  <span className="muted">{metric.label}</span>
                  <strong>
                    {formatMetric(metric.value)} {metric.unit}
                  </strong>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="metrics-header">
              <h4>Requerimiento Energetico</h4>
              <span className="muted">Formula Mifflin-St Jeor</span>
            </div>
            {energyMetrics.canCalculate ? (
              <div className="metrics">
                <div className="metric-card">
                  <span className="muted">TMB (Tasa Metabolica Basal)</span>
                  <strong>{energyMetrics.tmb?.toFixed(0) ?? "-"} kcal/dia</strong>
                </div>
                <div className="metric-card">
                  <span className="muted">
                    REE ({activityFactors[selectedPatient.activity_level!]?.label})
                  </span>
                  <strong>{energyMetrics.ree?.toFixed(0) ?? "-"} kcal/dia</strong>
                </div>
              </div>
            ) : records.length === 0 ? (
              <p className="muted">Agrega un registro antropometrico para calcular el requerimiento energetico.</p>
            ) : (
              <p className="muted">
                Faltan datos del paciente para calcular: {energyMetrics.missingFields.join(", ")}.
                Edita el perfil del paciente para completarlos.
              </p>
            )}
          </>
        ) : null}

        {error ? <p className="error">{error}</p> : null}
      </div>

      <div className="card">
        <div className="section-header">
          <h3>Registros</h3>
          <button
            type="button"
            className="btn-icon"
            onClick={() => selectedPatient?.id && loadRecords(selectedPatient.id)}
            disabled={!selectedPatient?.id || loading}
            aria-label="Actualizar"
            title="Actualizar"
          >
            ↻
          </button>
        </div>
        <div className="section-divider">
          <span>Listado</span>
        </div>
        {!selectedPatient?.id ? (
          <p className="muted">Selecciona un paciente para ver sus registros.</p>
        ) : records.length === 0 ? (
          <p className="muted">Sin registros de antropometria.</p>
        ) : (
          <div className="table table-anthro">
            <div className="table-row table-header">
              <span>Fecha</span>
              <span>Peso</span>
              <span>Altura</span>
              <span>Cintura</span>
              <span>Cadera</span>
              <span>Braquial</span>
              <span>% Grasa</span>
              <span>% Magra</span>
              <span>IMC</span>
              <span>RC/CC</span>
              <span>RC/Alt</span>
              <span>Acciones</span>
            </div>
            {records.map((record) => {
              const metrics = calculateAnthropometry({
                recorded_at: record.recorded_at,
                weight_kg: record.weight_kg,
                height_cm: record.height_cm,
                waist_cm: record.waist_cm,
                hip_cm: record.hip_cm,
                body_fat_pct: record.body_fat_pct,
                lean_mass_pct: record.lean_mass_pct,
                arm_circumference_cm: record.arm_circumference_cm,
                observations: record.observations,
              });
              const bmi = metrics.find((metric) => metric.key === "bmi")?.value ?? null;
              const waistHip =
                metrics.find((metric) => metric.key === "waist_hip_ratio")?.value ?? null;
              const waistHeight =
                metrics.find((metric) => metric.key === "waist_height_ratio")?.value ?? null;

              return (
                <div className="table-row" key={record.id}>
                  <span data-label="Fecha">
                    {new Date(record.recorded_at).toLocaleDateString()}
                  </span>
                  <span data-label="Peso">{record.weight_kg ?? "-"}</span>
                  <span data-label="Altura">{record.height_cm ?? "-"}</span>
                  <span data-label="Cintura">{record.waist_cm ?? "-"}</span>
                  <span data-label="Cadera">{record.hip_cm ?? "-"}</span>
                  <span data-label="Braquial">{record.arm_circumference_cm ?? "-"}</span>
                  <span data-label="% Grasa">{record.body_fat_pct ?? "-"}</span>
                  <span data-label="% Magra">{record.lean_mass_pct ?? "-"}</span>
                  <span data-label="IMC">{formatMetric(bmi)}</span>
                  <span data-label="RC/CC">{formatMetric(waistHip)}</span>
                  <span data-label="RC/Alt">{formatMetric(waistHeight)}</span>
                  <span className="table-actions" data-label="Acciones">
                    <button
                      type="button"
                      className="btn-success btn-action"
                      onClick={() => startEdit(record)}
                      disabled={saving}
                    >
                      <EditIcon />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn-danger btn-action"
                      onClick={() => handleDeactivate(record)}
                      disabled={saving}
                    >
                      <TrashIcon />
                      Eliminar
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
