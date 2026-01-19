import { useEffect, useMemo, useState } from "react";
import { EditIcon, TrashIcon } from "../components/Icons";
import PatientPicker from "../components/PatientPicker";
import type { AnthropometricRecord, Patient } from "../lib/types";
import {
  calculateAnthropometry,
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
};

const emptyDraft: Draft = {
  recorded_at: getTodayDate(),
  weight_kg: "",
  height_cm: "",
  waist_cm: "",
  hip_cm: "",
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
  });
  const { addToast } = useToast();

  const previewMetrics = useMemo(() => {
    return calculateAnthropometry({
      recorded_at: draft.recorded_at,
      weight_kg: toNumber(draft.weight_kg),
      height_cm: toNumber(draft.height_cm),
      waist_cm: toNumber(draft.waist_cm),
      hip_cm: toNumber(draft.hip_cm),
    });
  }, [draft]);

  const formatMetric = (value: number | null) => (value === null ? "-" : value.toFixed(2));

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
    setFieldErrors({ recorded_at: "", weight_kg: "", height_cm: "", waist_cm: "", hip_cm: "" });

    if (!selectedPatient?.id) {
      setError("Selecciona un paciente primero.");
      return;
    }

    let hasErrors = false;
    const nextErrors = { recorded_at: "", weight_kg: "", height_cm: "", waist_cm: "", hip_cm: "" };

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
