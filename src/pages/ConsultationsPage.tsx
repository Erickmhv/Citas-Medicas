import { useEffect, useState } from "react";
import type { Consultation, Patient } from "../lib/types";
import { EditIcon, TrashIcon } from "../components/Icons";
import PatientPicker from "../components/PatientPicker";
import { useToast } from "../components/ToastProvider";
import {
  createConsultation,
  deactivateConsultation,
  fetchConsultations,
  updateConsultation,
} from "../lib/consultations";

const getTodayDate = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
};

const emptyDraft = {
  consultation_date: getTodayDate(),
  observations: "",
  plan_summary: "",
};

type ConsultationsPageProps = {
  patient?: Patient;
};

export default function ConsultationsPage({ patient }: ConsultationsPageProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient ?? null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    consultation_date: "",
    observations: "",
    plan_summary: "",
  });
  const { addToast } = useToast();

  useEffect(() => {
    if (patient) {
      setSelectedPatient(patient);
    }
    setLoading(false);
  }, [patient]);

  const loadConsultations = async (patientId: string) => {
    setLoading(true);
    const { data, error: fetchError } = await fetchConsultations(patientId);
    if (fetchError) {
      setError(fetchError);
      addToast(fetchError, "error");
      setConsultations([]);
    } else {
      setConsultations(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!selectedPatient?.id) {
      setConsultations([]);
      return;
    }

    loadConsultations(selectedPatient.id);
  }, [selectedPatient]);

  const resetForm = () => {
    setDraft({ ...emptyDraft, consultation_date: getTodayDate() });
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({ consultation_date: "", observations: "", plan_summary: "" });

    if (!selectedPatient?.id) {
      setError("Selecciona un paciente primero.");
      return;
    }

    let hasErrors = false;
    const nextErrors = { consultation_date: "", observations: "", plan_summary: "" };

    if (!draft.consultation_date) {
      nextErrors.consultation_date = "La fecha de la consulta es obligatoria.";
      hasErrors = true;
    }

    if (!draft.observations.trim()) {
      nextErrors.observations = "Las observaciones son obligatorias.";
      hasErrors = true;
    }

    if (!draft.plan_summary.trim()) {
      nextErrors.plan_summary = "El plan es obligatorio.";
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(nextErrors);
      setError("Revisa los campos marcados.");
      return;
    }

    setSaving(true);

    const payload = {
      consultation_date: draft.consultation_date,
      observations: draft.observations.trim() || null,
      plan_summary: draft.plan_summary.trim() || null,
    };

    const { error: actionError } = editingId
      ? await updateConsultation(editingId, payload)
      : await createConsultation({ patient_id: selectedPatient.id, ...payload });

    if (actionError) {
      setError(actionError);
      addToast(actionError, "error");
      setSaving(false);
      return;
    }

    resetForm();
    await loadConsultations(selectedPatient.id);
    addToast(editingId ? "Consulta actualizada." : "Consulta registrada.", "success");
    setSaving(false);
  };

  const startEdit = (consultation: Consultation) => {
    setDraft({
      consultation_date: consultation.consultation_date,
      observations: consultation.observations ?? "",
      plan_summary: consultation.plan_summary ?? "",
    });
    setEditingId(consultation.id);
  };

  const handleDeactivate = async (consultation: Consultation) => {
    const confirm = window.confirm("Deseas desactivar esta consulta?");
    if (!confirm) return;

    setSaving(true);
    const { error: deactivateError } = await deactivateConsultation(consultation.id);
    if (deactivateError) {
      setError(deactivateError);
      addToast(deactivateError, "error");
    } else if (selectedPatient?.id) {
      await loadConsultations(selectedPatient.id);
      addToast("Consulta desactivada.", "success");
    }
    setSaving(false);
  };

  return (
    <section className="stack">
      <div className="card">
        <h2>Consultas</h2>
        <p className="muted">Registra el seguimiento y plan de cada consulta.</p>
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
        <h3>{editingId ? "Editar consulta" : "Nueva consulta"}</h3>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            <span className="label-text required">Fecha de consulta</span>
            <input
              type="date"
              value={draft.consultation_date}
              onChange={(event) =>
                setDraft((current) => ({ ...current, consultation_date: event.target.value }))
              }
              className={fieldErrors.consultation_date ? "input-error" : ""}
            />
            <span className="help">Por defecto se usa la fecha de hoy.</span>
            {fieldErrors.consultation_date ? (
              <span className="field-error">{fieldErrors.consultation_date}</span>
            ) : null}
          </label>
          <label>
            <span className="label-text required">Observaciones</span>
            <textarea
              rows={4}
              value={draft.observations}
              onChange={(event) =>
                setDraft((current) => ({ ...current, observations: event.target.value }))
              }
              placeholder="Notas de la consulta, sintomas, avances..."
              className={fieldErrors.observations ? "input-error" : ""}
            />
            <span className="help">Resumen breve de la consulta.</span>
            {fieldErrors.observations ? (
              <span className="field-error">{fieldErrors.observations}</span>
            ) : null}
          </label>
          <label>
            <span className="label-text required">Plan</span>
            <textarea
              rows={3}
              value={draft.plan_summary}
              onChange={(event) =>
                setDraft((current) => ({ ...current, plan_summary: event.target.value }))
              }
              placeholder="Plan sugerido, tareas, recomendaciones..."
              className={fieldErrors.plan_summary ? "input-error" : ""}
            />
            <span className="help">Acciones acordadas con el paciente.</span>
            {fieldErrors.plan_summary ? (
              <span className="field-error">{fieldErrors.plan_summary}</span>
            ) : null}
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
        {error ? <p className="error">{error}</p> : null}
      </div>

      <div className="card">
        <div className="section-header">
          <h3>Consultas registradas</h3>
          <button
            type="button"
            className="btn-icon"
            onClick={() => selectedPatient?.id && loadConsultations(selectedPatient.id)}
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
          <p className="muted">Selecciona un paciente para ver sus consultas.</p>
        ) : consultations.length === 0 ? (
          <p className="muted">Sin consultas registradas para este paciente.</p>
        ) : (
          <div className="note-list">
            {consultations.map((consultation) => (
              <article key={consultation.id} className="note-card">
                <div className="note-meta">
                  <span>{new Date(consultation.consultation_date).toLocaleDateString()}</span>
                </div>
                <p>{consultation.observations ?? "Sin observaciones."}</p>
                <p className="muted">Plan: {consultation.plan_summary ?? "Sin plan."}</p>
                <div className="note-actions">
                  <button
                    type="button"
                    className="btn-success btn-action"
                    onClick={() => startEdit(consultation)}
                    disabled={saving}
                  >
                    <EditIcon />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-danger btn-action"
                    onClick={() => handleDeactivate(consultation)}
                    disabled={saving}
                  >
                    <TrashIcon />
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
