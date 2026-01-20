import { useEffect, useState } from "react";
import { useToast } from "../components/ToastProvider";
import { createPatient, fetchPatientById, updatePatient } from "../lib/patients";

type PatientFormPageProps = {
  patientId: string | null;
  onDone: () => void;
  onCancel: () => void;
};

type PatientDraft = {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  sex: string;
  activity_level: string;
};

const emptyDraft: PatientDraft = {
  full_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  sex: "",
  activity_level: "",
};

const activityLevelOptions = [
  { value: "", label: "Sin especificar" },
  { value: "sedentary", label: "Sedentario (poco o nada de ejercicio)" },
  { value: "light", label: "Ligeramente activo (ejercicio 1-3 dias/semana)" },
  { value: "moderate", label: "Moderadamente activo (ejercicio 3-5 dias/semana)" },
  { value: "active", label: "Muy activo (ejercicio 6-7 dias/semana)" },
  { value: "very_active", label: "Extra activo (ejercicio intenso, trabajo fisico)" },
];

export default function PatientFormPage({ patientId, onDone, onCancel }: PatientFormPageProps) {
  const [draft, setDraft] = useState<PatientDraft>(emptyDraft);
  const [loading, setLoading] = useState(!!patientId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    sex: "",
    activity_level: "",
  });
  const { addToast } = useToast();

  useEffect(() => {
    if (!patientId) {
      setDraft(emptyDraft);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchPatientById(patientId).then(({ data, error: fetchError }) => {
      if (!isMounted) return;
      if (fetchError) {
        setError(fetchError);
      } else if (data) {
        setDraft({
          full_name: data.full_name,
          email: data.email ?? "",
          phone: data.phone ?? "",
          date_of_birth: data.date_of_birth ?? "",
          sex: data.sex ?? "",
          activity_level: data.activity_level ?? "",
        });
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const onDraftChange = (field: keyof PatientDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({ full_name: "", email: "", phone: "", date_of_birth: "", sex: "", activity_level: "" });

    let hasErrors = false;
    const nextErrors = { full_name: "", email: "", phone: "", date_of_birth: "", sex: "", activity_level: "" };

    if (!draft.full_name.trim()) {
      nextErrors.full_name = "El nombre completo es obligatorio.";
      hasErrors = true;
    }

    if (!draft.email.trim()) {
      nextErrors.email = "El correo es obligatorio.";
      hasErrors = true;
    } else if (!draft.email.includes("@")) {
      nextErrors.email = "El correo no parece valido.";
      hasErrors = true;
    }

    if (!draft.phone.trim()) {
      nextErrors.phone = "El telefono es obligatorio.";
      hasErrors = true;
    } else if (!/^[0-9+\\s()-]+$/.test(draft.phone)) {
      nextErrors.phone = "El telefono solo puede incluir numeros, espacios y + ( ).";
      hasErrors = true;
    }

    if (!draft.date_of_birth) {
      nextErrors.date_of_birth = "La fecha de nacimiento es obligatoria.";
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(nextErrors);
      setError("Revisa los campos marcados.");
      return;
    }

    setSaving(true);

    const sexValue = draft.sex === "M" || draft.sex === "F" ? draft.sex : null;
    const validActivityLevels = ["sedentary", "light", "moderate", "active", "very_active"];
    const activityValue = validActivityLevels.includes(draft.activity_level) ? draft.activity_level : null;
    const payload = {
      full_name: draft.full_name.trim(),
      email: draft.email.trim() || null,
      phone: draft.phone.trim() || null,
      date_of_birth: draft.date_of_birth || null,
      sex: sexValue as "M" | "F" | null,
      activity_level: activityValue as "sedentary" | "light" | "moderate" | "active" | "very_active" | null,
    };

    const { error: actionError } = patientId
      ? await updatePatient(patientId, payload)
      : await createPatient(payload);

    if (actionError) {
      setError(actionError);
      addToast(actionError, "error");
      setSaving(false);
      return;
    }

    addToast(patientId ? "Paciente actualizado." : "Paciente guardado.", "success");
    setSaving(false);
    onDone();
  };

  if (loading) {
    return (
      <div className="centered">
        <p className="muted">Cargando paciente...</p>
      </div>
    );
  }

  return (
    <section className="stack">
      <div className="card">
        <h2>{patientId ? "Editar paciente" : "Nuevo paciente"}</h2>
        <p className="muted">
          Completa la informacion basica para identificar al paciente. Puedes editarla en cualquier
          momento.
        </p>
      </div>
      <div className="card">
        <form onSubmit={onSubmit} className="form-grid">
          <label>
            <span className="label-text required">Nombre completo</span>
            <input
              type="text"
              value={draft.full_name}
              onChange={(event) => onDraftChange("full_name", event.target.value)}
              placeholder="Ana Perez"
              className={fieldErrors.full_name ? "input-error" : ""}
            />
            <span className="help">Ej: Ana Perez</span>
            {fieldErrors.full_name ? <span className="field-error">{fieldErrors.full_name}</span> : null}
          </label>
          <label>
            <span className="label-text required">Correo</span>
            <input
              type="email"
              value={draft.email}
              onChange={(event) => onDraftChange("email", event.target.value)}
              placeholder="ana@clinica.com"
              className={fieldErrors.email ? "input-error" : ""}
            />
            <span className="help">Usa el correo principal del paciente.</span>
            {fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}
          </label>
          <label>
            <span className="label-text required">Telefono</span>
            <input
              type="tel"
              value={draft.phone}
              onChange={(event) => onDraftChange("phone", event.target.value)}
              placeholder="+34 600 000 000"
              className={fieldErrors.phone ? "input-error" : ""}
            />
            <span className="help">Incluye el codigo de pais si aplica.</span>
            {fieldErrors.phone ? <span className="field-error">{fieldErrors.phone}</span> : null}
          </label>
          <label>
            <span className="label-text required">Fecha de nacimiento</span>
            <input
              type="date"
              value={draft.date_of_birth}
              onChange={(event) => onDraftChange("date_of_birth", event.target.value)}
              className={fieldErrors.date_of_birth ? "input-error" : ""}
            />
            <span className="help">Ayuda a identificar al paciente.</span>
            {fieldErrors.date_of_birth ? (
              <span className="field-error">{fieldErrors.date_of_birth}</span>
            ) : null}
          </label>
          <label>
            <span className="label-text">Sexo</span>
            <select
              value={draft.sex}
              onChange={(event) => onDraftChange("sex", event.target.value)}
              className={fieldErrors.sex ? "input-error" : ""}
            >
              <option value="">Sin especificar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
            <span className="help">Necesario para calculos de requerimiento calorico.</span>
            {fieldErrors.sex ? <span className="field-error">{fieldErrors.sex}</span> : null}
          </label>
          <label>
            <span className="label-text">Nivel de actividad</span>
            <select
              value={draft.activity_level}
              onChange={(event) => onDraftChange("activity_level", event.target.value)}
              className={fieldErrors.activity_level ? "input-error" : ""}
            >
              {activityLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="help">Usado para calcular requerimiento energetico estimado (REE).</span>
            {fieldErrors.activity_level ? <span className="field-error">{fieldErrors.activity_level}</span> : null}
          </label>
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Guardando..." : patientId ? "Actualizar" : "Guardar"}
            </button>
            <button type="button" onClick={onCancel} disabled={saving}>
              Volver
            </button>
          </div>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </div>
    </section>
  );
}
