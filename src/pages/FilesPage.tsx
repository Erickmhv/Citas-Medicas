import { useEffect, useState } from "react";
import PatientPicker from "../components/PatientPicker";
import type { Patient, PatientFile } from "../lib/types";
import { EditIcon, TrashIcon } from "../components/Icons";
import { useToast } from "../components/ToastProvider";
import {
  deactivateFile,
  fetchPatientFiles,
  getFileDownloadUrl,
  updateFileMeta,
  uploadPatientFile,
  validateFile,
} from "../lib/files";

const emptyDraft = {
  file: null as File | null,
  description: "",
  is_lab: false,
};

type FilesPageProps = {
  patient?: Patient;
};

export default function FilesPage({ patient }: FilesPageProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient ?? null);
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingLab, setEditingLab] = useState(false);
  const [editingDescription, setEditingDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({ file: "", description: "" });
  const [preview, setPreview] = useState<{ url: string; name: string; mime: string | null } | null>(
    null
  );
  const { addToast } = useToast();

  const loadFiles = async (patientId: string) => {
    setLoading(true);
    const { data, error: fetchError } = await fetchPatientFiles(patientId);
    if (fetchError) {
      setError(fetchError);
      addToast(fetchError, "error");
      setFiles([]);
    } else {
      setFiles(data ?? []);
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
      setFiles([]);
      return;
    }

    loadFiles(selectedPatient.id);
  }, [selectedPatient]);


  const resetForm = () => {
    setDraft(emptyDraft);
  };

  const resetEditing = () => {
    setEditingId(null);
    setEditingName("");
    setEditingLab(false);
    setEditingDescription("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({ file: "", description: "" });

    let hasErrors = false;
    const nextErrors = { file: "", description: "" };

    if (!selectedPatient?.id) {
      setError("Selecciona un paciente primero.");
      return;
    }

    if (!draft.file) {
      nextErrors.file = "Selecciona un archivo.";
      hasErrors = true;
    } else {
      const validationError = validateFile(draft.file);
      if (validationError) {
        nextErrors.file = validationError;
        hasErrors = true;
      }
    }

    if (!draft.description.trim()) {
      nextErrors.description = "La descripcion es obligatoria.";
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(nextErrors);
      setError("Revisa los campos marcados.");
      return;
    }

    setSaving(true);
    const { error: uploadError } = await uploadPatientFile({
      patientId: selectedPatient.id,
      file: draft.file!,
      isLab: draft.is_lab,
      description: draft.description.trim() || null,
    });

    if (uploadError) {
      setError(uploadError);
      addToast(uploadError, "error");
      setSaving(false);
      return;
    }

    resetForm();
    await loadFiles(selectedPatient.id);
    addToast("Archivo subido.", "success");
    setSaving(false);
  };

  const startEdit = (file: PatientFile) => {
    setEditingId(file.id);
    setEditingName(file.file_name);
    setEditingLab(file.is_lab);
    setEditingDescription(file.description ?? "");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error: updateError } = await updateFileMeta(editingId, {
      file_name: editingName.trim() || "Sin nombre",
      is_lab: editingLab,
      description: editingDescription.trim() || null,
    });
    if (updateError) {
      setError(updateError);
      addToast(updateError, "error");
    } else if (selectedPatient?.id) {
      await loadFiles(selectedPatient.id);
      resetEditing();
      addToast("Archivo actualizado.", "success");
    }
    setSaving(false);
  };

  const handleDeactivate = async (file: PatientFile) => {
    const confirm = window.confirm("Deseas desactivar este archivo?");
    if (!confirm) return;

    setSaving(true);
    const { error: deactivateError } = await deactivateFile(file.id);
    if (deactivateError) {
      setError(deactivateError);
      addToast(deactivateError, "error");
    } else if (selectedPatient?.id) {
      await loadFiles(selectedPatient.id);
      addToast("Archivo desactivado.", "success");
    }
    setSaving(false);
  };

  const handleDownload = async (file: PatientFile) => {
    const { url, error: urlError } = await getFileDownloadUrl(file.file_path);
    if (urlError || !url) {
      setError(urlError);
      addToast(urlError ?? "No se pudo generar el enlace.", "error");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePreview = async (file: PatientFile) => {
    const { url, error: urlError } = await getFileDownloadUrl(file.file_path);
    if (urlError || !url) {
      setError(urlError);
      addToast(urlError ?? "No se pudo generar el enlace.", "error");
      return;
    }
    setPreview({ url, name: file.file_name, mime: file.mime_type });
  };

  return (
    <section className="stack">
      <div className="card">
        <h2>Archivos</h2>
        <p className="muted">Adjunta documentos y marca si son resultados de laboratorio.</p>
        {!patient ? (
          <PatientPicker
            label="Paciente"
            selectedPatient={selectedPatient}
            onSelect={(nextPatient) => {
              setSelectedPatient(nextPatient);
              resetForm();
              resetEditing();
            }}
          />
        ) : null}
        {!selectedPatient?.id ? (
          <p className="help">Selecciona un paciente para habilitar el formulario.</p>
        ) : null}
      </div>

      <div className="card">
        <h3>Nuevo archivo</h3>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            <span className="label-text required">Archivo</span>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setDraft((current) => ({ ...current, file: event.target.files?.[0] ?? null }))
              }
              disabled={!selectedPatient?.id}
              className={fieldErrors.file ? "input-error" : ""}
            />
          </label>
          {fieldErrors.file ? <span className="field-error">{fieldErrors.file}</span> : null}
          {draft.file ? <p className="muted">Archivo seleccionado: {draft.file.name}</p> : null}
          {!draft.file ? <p className="help">Solo PDF, JPG, PNG o WebP. Maximo 10MB.</p> : null}
          <label>
            <span className="label-text required">Descripcion breve</span>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Ej: Resultado de laboratorio, receta, nota medica..."
              disabled={!selectedPatient?.id}
              className={fieldErrors.description ? "input-error" : ""}
            />
            <span className="help">Ayuda a encontrar el archivo rapidamente.</span>
            {fieldErrors.description ? (
              <span className="field-error">{fieldErrors.description}</span>
            ) : null}
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={draft.is_lab}
              onChange={(event) =>
                setDraft((current) => ({ ...current, is_lab: event.target.checked }))
              }
              disabled={!selectedPatient?.id}
            />
            Es resultado de laboratorio
          </label>
          <button type="submit" disabled={saving || !selectedPatient?.id}>
            {saving ? "Subiendo..." : "Subir archivo"}
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </div>

      <div className="card">
        <div className="section-header">
          <h3>Archivos registrados</h3>
          <button
            type="button"
            className="btn-icon"
            onClick={() => selectedPatient?.id && loadFiles(selectedPatient.id)}
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
          <p className="muted">Selecciona un paciente para ver sus archivos.</p>
        ) : files.length === 0 ? (
          <p className="muted">Sin archivos registrados.</p>
        ) : (
          <div className="file-list">
            {files.map((file) => (
              <article key={file.id} className="file-card">
                {editingId === file.id ? (
                  <div className="file-edit">
                    <label>
                      Nombre
                      <input
                        type="text"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                      />
                    </label>
                    <label>
                      Descripcion
                      <textarea
                        rows={3}
                        value={editingDescription}
                        onChange={(event) => setEditingDescription(event.target.value)}
                      />
                    </label>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={editingLab}
                        onChange={(event) => setEditingLab(event.target.checked)}
                      />
                      Es laboratorio
                    </label>
                    <div className="form-actions">
                      <button type="button" onClick={saveEdit} disabled={saving}>
                        Guardar cambios
                      </button>
                      <button type="button" onClick={resetEditing} disabled={saving}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>{file.file_name}</strong>
                      <p className="muted">
                        {file.is_lab ? "Laboratorio" : "Documento"} ·{" "}
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                      {file.description ? <p>{file.description}</p> : null}
                    </div>
                    <div className="file-actions">
                      <button type="button" className="btn-primary btn-action" onClick={() => handlePreview(file)}>
                        Ver
                      </button>
                      <button type="button" onClick={() => handleDownload(file)}>
                        Descargar
                      </button>
                      <button type="button" className="btn-success btn-action" onClick={() => startEdit(file)}>
                        <EditIcon />
                        Editar
                      </button>
                      <button type="button" className="btn-danger btn-action" onClick={() => handleDeactivate(file)}>
                        <TrashIcon />
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
      {preview ? (
        <div className="preview-overlay" onClick={() => setPreview(null)}>
          <div className="preview-modal" onClick={(event) => event.stopPropagation()}>
            <div className="section-header">
              <div>
                <h3>Vista previa</h3>
                <p className="muted">{preview.name}</p>
              </div>
              <button type="button" className="btn-icon" onClick={() => setPreview(null)}>
                ✕
              </button>
            </div>
            <div className="preview-body">
              {preview.mime?.startsWith("image/") ? (
                <img src={preview.url} alt={preview.name} />
              ) : preview.mime === "application/pdf" ? (
                <iframe src={preview.url} title={preview.name} />
              ) : (
                <p className="muted">No hay vista previa disponible. Usa Descargar.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
