import { useEffect, useState } from "react";
import type { LabResult, LabResultData, Patient } from "../lib/types";
import { EditIcon, TrashIcon } from "../components/Icons";
import PatientPicker from "../components/PatientPicker";
import { useToast } from "../components/ToastProvider";
import {
  calculateHomaIr,
  createLabResult,
  deactivateLabResult,
  fetchLabResults,
  labFieldGroups,
  updateLabResult,
} from "../lib/labResults";

const getTodayDate = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
};

type Draft = {
  result_date: string;
  notes: string;
  result_data: LabResultData;
};

const emptyResultData: LabResultData = {
  glucosa_ayunas: null,
  hba1c: null,
  insulina: null,
  colesterol_total: null,
  hdl: null,
  ldl: null,
  trigliceridos: null,
  tgp: null,
  tgo: null,
  tsh: null,
  t3: null,
  t4: null,
  vitamina_d: null,
  vitamina_b12: null,
  acido_folico: null,
  ferritina: null,
  hierro_serico: null,
  pcr: null,
};

const emptyDraft: Draft = {
  result_date: getTodayDate(),
  notes: "",
  result_data: emptyResultData,
};

function toNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

type LabResultsPageProps = {
  patient?: Patient;
};

export default function LabResultsPage({ patient }: LabResultsPageProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient ?? null);
  const [results, setResults] = useState<LabResult[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({ result_date: "" });
  const { addToast } = useToast();

  const homaIr = calculateHomaIr(
    draft.result_data.glucosa_ayunas ?? null,
    draft.result_data.insulina ?? null
  );

  const loadResults = async (patientId: string) => {
    setLoading(true);
    const { data, error: fetchError } = await fetchLabResults(patientId);
    if (fetchError) {
      setError(fetchError);
      addToast(fetchError, "error");
      setResults([]);
    } else {
      setResults(data ?? []);
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
      setResults([]);
      return;
    }

    loadResults(selectedPatient.id);
  }, [selectedPatient]);

  const resetForm = () => {
    setDraft({ ...emptyDraft, result_date: getTodayDate() });
    setEditingId(null);
  };

  const handleFieldChange = (fieldKey: keyof LabResultData, value: string) => {
    setDraft((current) => ({
      ...current,
      result_data: {
        ...current.result_data,
        [fieldKey]: toNumber(value),
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({ result_date: "" });

    if (!selectedPatient?.id) {
      setError("Selecciona un paciente primero.");
      return;
    }

    let hasErrors = false;
    const nextErrors = { result_date: "" };

    if (!draft.result_date) {
      nextErrors.result_date = "La fecha del resultado es obligatoria.";
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(nextErrors);
      setError("Revisa los campos marcados.");
      return;
    }

    setSaving(true);

    const payload = {
      result_date: draft.result_date,
      notes: draft.notes.trim() || null,
      result_data: draft.result_data,
    };

    const { error: actionError } = editingId
      ? await updateLabResult(editingId, payload)
      : await createLabResult(selectedPatient.id, payload);

    if (actionError) {
      setError(actionError);
      addToast(actionError, "error");
      setSaving(false);
      return;
    }

    resetForm();
    await loadResults(selectedPatient.id);
    addToast(editingId ? "Resultado actualizado." : "Resultado registrado.", "success");
    setSaving(false);
  };

  const startEdit = (result: LabResult) => {
    setDraft({
      result_date: result.result_date,
      notes: result.notes ?? "",
      result_data: result.result_data ?? emptyResultData,
    });
    setEditingId(result.id);
  };

  const handleDeactivate = async (result: LabResult) => {
    const confirm = window.confirm("Deseas desactivar este resultado de laboratorio?");
    if (!confirm) return;

    setSaving(true);
    const { error: deactivateError } = await deactivateLabResult(result.id);
    if (deactivateError) {
      setError(deactivateError);
      addToast(deactivateError, "error");
    } else if (selectedPatient?.id) {
      await loadResults(selectedPatient.id);
      addToast("Resultado desactivado.", "success");
    }
    setSaving(false);
  };

  const formatValue = (value: number | null | undefined, unit: string): string => {
    if (value === null || value === undefined) return "-";
    return `${value} ${unit}`;
  };

  return (
    <section className="stack">
      <div className="card">
        <h2>Resultados de Laboratorio</h2>
        <p className="muted">Registra y consulta los resultados de analisis clinicos.</p>
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
        <h3>{editingId ? "Editar resultado" : "Nuevo resultado"}</h3>
        {!selectedPatient?.id ? (
          <div className="alert alert-warning">
            <strong>Paciente no seleccionado</strong>
            <p>Selecciona un paciente en la seccion superior para registrar resultados de laboratorio.</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="stack">
          <label>
            <span className="label-text required">Fecha del resultado</span>
            <input
              type="date"
              value={draft.result_date}
              onChange={(event) =>
                setDraft((current) => ({ ...current, result_date: event.target.value }))
              }
              className={fieldErrors.result_date ? "input-error" : ""}
            />
            <span className="help">Fecha en que se realizaron los analisis.</span>
            {fieldErrors.result_date ? (
              <span className="field-error">{fieldErrors.result_date}</span>
            ) : null}
          </label>

          {labFieldGroups.map((group) => (
            <fieldset key={group.key} className="lab-group">
              <legend>{group.label}</legend>
              <div className="form-grid">
                {group.fields.map((field) => (
                  <label key={field.key}>
                    <span className="label-text">{field.label}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={draft.result_data[field.key as keyof LabResultData] ?? ""}
                      onChange={(event) =>
                        handleFieldChange(field.key as keyof LabResultData, event.target.value)
                      }
                      placeholder={field.unit}
                    />
                    <span className="help">{field.unit}</span>
                  </label>
                ))}
                {group.key === "glucosa" ? (
                  <div className="metric-card">
                    <span className="muted">HOMA-IR (calculado)</span>
                    <strong>{homaIr !== null ? homaIr.toFixed(2) : "-"}</strong>
                  </div>
                ) : null}
              </div>
            </fieldset>
          ))}

          <label>
            <span className="label-text">Observaciones</span>
            <textarea
              rows={3}
              value={draft.notes}
              onChange={(event) =>
                setDraft((current) => ({ ...current, notes: event.target.value }))
              }
              placeholder="Notas adicionales sobre los resultados..."
            />
            <span className="help">Comentarios o contexto del analisis.</span>
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
        {error ? <p className="error">{error}</p> : null}
      </div>

      <div className="card">
        <div className="section-header">
          <h3>Resultados registrados</h3>
          <button
            type="button"
            className="btn-icon"
            onClick={() => selectedPatient?.id && loadResults(selectedPatient.id)}
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
          <p className="muted">Selecciona un paciente para ver sus resultados.</p>
        ) : results.length === 0 ? (
          <p className="muted">Sin resultados de laboratorio registrados.</p>
        ) : (
          <div className="note-list">
            {results.map((result) => {
              const resultHomaIr = calculateHomaIr(
                result.result_data?.glucosa_ayunas ?? null,
                result.result_data?.insulina ?? null
              );
              return (
                <article key={result.id} className="note-card">
                  <div className="note-meta">
                    <span>{new Date(result.result_date).toLocaleDateString()}</span>
                  </div>
                  <div className="lab-summary">
                    {labFieldGroups.map((group) => {
                      const filledFields = group.fields.filter(
                        (field) =>
                          result.result_data?.[field.key as keyof LabResultData] !== null &&
                          result.result_data?.[field.key as keyof LabResultData] !== undefined
                      );
                      if (filledFields.length === 0) return null;
                      return (
                        <div key={group.key} className="lab-summary-group">
                          <strong>{group.label}</strong>
                          <ul>
                            {filledFields.map((field) => (
                              <li key={field.key}>
                                {field.label}:{" "}
                                {formatValue(
                                  result.result_data?.[field.key as keyof LabResultData],
                                  field.unit
                                )}
                              </li>
                            ))}
                            {group.key === "glucosa" && resultHomaIr !== null ? (
                              <li>HOMA-IR: {resultHomaIr.toFixed(2)}</li>
                            ) : null}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                  {result.notes ? <p className="muted">Notas: {result.notes}</p> : null}
                  <div className="note-actions">
                    <button
                      type="button"
                      className="btn-success btn-action"
                      onClick={() => startEdit(result)}
                      disabled={saving}
                    >
                      <EditIcon />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn-danger btn-action"
                      onClick={() => handleDeactivate(result)}
                      disabled={saving}
                    >
                      <TrashIcon />
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
