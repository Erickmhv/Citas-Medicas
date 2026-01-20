import { useEffect, useState } from "react";
import type { ClinicalHistoryEntry, Patient } from "../lib/types";
import { EditIcon, TrashIcon } from "../components/Icons";
import PatientPicker from "../components/PatientPicker";
import { useToast } from "../components/ToastProvider";
import {
  createClinicalHistory,
  deactivateClinicalHistory,
  fetchClinicalHistory,
  updateClinicalHistory,
} from "../lib/clinicalHistory";

type ClinicalHistoryPageProps = {
  patient?: Patient;
};

export default function ClinicalHistoryPage({ patient }: ClinicalHistoryPageProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient ?? null);
  const [entries, setEntries] = useState<ClinicalHistoryEntry[]>([]);
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({ notes: "" });
  const { addToast } = useToast();

  useEffect(() => {
    if (patient) {
      setSelectedPatient(patient);
    }
    setLoading(false);
  }, [patient]);

  useEffect(() => {
    if (!selectedPatient?.id) {
      setEntries([]);
      return;
    }

    loadEntries(selectedPatient.id);
  }, [selectedPatient]);

  const loadEntries = async (patientId: string) => {
    setLoading(true);
    const { data, error: fetchError } = await fetchClinicalHistory(patientId);
    if (fetchError) {
      setError(fetchError);
      addToast(fetchError, "error");
      setEntries([]);
    } else {
      setEntries(data ?? []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setNotes("");
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({ notes: "" });

    if (!selectedPatient?.id) {
      setError("Selecciona un paciente primero.");
      return;
    }

    if (!notes.trim()) {
      setFieldErrors({ notes: "Las notas son obligatorias." });
      setError("Revisa los campos marcados.");
      return;
    }

    setSaving(true);

    const { error: actionError } = editingId
      ? await updateClinicalHistory(editingId, notes.trim())
      : await createClinicalHistory(selectedPatient.id, notes.trim());

    if (actionError) {
      setError(actionError);
      addToast(actionError, "error");
      setSaving(false);
      return;
    }

    resetForm();
    await loadEntries(selectedPatient.id);
    addToast(editingId ? "Nota actualizada." : "Nota registrada.", "success");
    setSaving(false);
  };

  const startEdit = (entry: ClinicalHistoryEntry) => {
    setNotes(entry.notes);
    setEditingId(entry.id);
  };

  const handleDeactivate = async (entry: ClinicalHistoryEntry) => {
    const confirm = window.confirm("Deseas desactivar esta nota?");
    if (!confirm) return;

    setSaving(true);
    const { error: deactivateError } = await deactivateClinicalHistory(entry.id);
    if (deactivateError) {
      setError(deactivateError);
      addToast(deactivateError, "error");
    } else if (selectedPatient?.id) {
      await loadEntries(selectedPatient.id);
      addToast("Nota desactivada.", "success");
    }
    setSaving(false);
  };

  return (
    <section className="stack">
      <div className="card">
        <h2>Historia clinica</h2>
        <p className="muted">Registra antecedentes clinicos y notas importantes del paciente.</p>
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
        <h3>{editingId ? "Editar nota" : "Nueva nota"}</h3>
        {!selectedPatient?.id ? (
          <div className="alert alert-warning">
            <strong>Paciente no seleccionado</strong>
            <p>Selecciona un paciente en la seccion superior para registrar notas clinicas.</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="stack">
          <label>
            <span className="label-text required">Notas clinicas</span>
            <textarea
              rows={5}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Antecedentes, habitos, observaciones..."
              className={fieldErrors.notes ? "input-error" : ""}
            />
            <span className="help">Escribe notas breves y claras para futuras consultas.</span>
            {fieldErrors.notes ? <span className="field-error">{fieldErrors.notes}</span> : null}
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
          <h3>Notas registradas</h3>
          <button
            type="button"
            className="btn-icon"
            onClick={() => selectedPatient?.id && loadEntries(selectedPatient.id)}
            disabled={loading || !selectedPatient?.id}
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
          <p className="muted">Selecciona un paciente para ver su historia clinica.</p>
        ) : entries.length === 0 ? (
          <p className="muted">Sin notas registradas para este paciente.</p>
        ) : (
          <div className="note-list">
            {entries.map((entry) => (
              <article key={entry.id} className="note-card">
                <div className="note-meta">
                  <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                </div>
                <p>{entry.notes}</p>
                <div className="note-actions">
                  <button
                    type="button"
                    className="btn-success btn-action"
                    onClick={() => startEdit(entry)}
                    disabled={saving}
                  >
                    <EditIcon />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-danger btn-action"
                    onClick={() => handleDeactivate(entry)}
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
