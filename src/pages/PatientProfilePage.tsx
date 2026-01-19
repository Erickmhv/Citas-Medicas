import { useEffect, useState } from "react";
import type { Patient } from "../lib/types";
import { fetchPatientById } from "../lib/patients";
import ClinicalHistoryPage from "./ClinicalHistoryPage";
import AnthropometryPage from "./AnthropometryPage";
import ConsultationsPage from "./ConsultationsPage";
import FilesPage from "./FilesPage";

type PatientProfilePageProps = {
  patientId: string;
  onBack: () => void;
  onEdit: (patientId: string) => void;
};

type TabKey = "history" | "anthropometry" | "consultations" | "files";

export default function PatientProfilePage({ patientId, onBack, onEdit }: PatientProfilePageProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("history");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchPatientById(patientId).then(({ data, error: fetchError }) => {
      if (!isMounted) return;
      if (fetchError) {
        setError(fetchError);
        setPatient(null);
      } else {
        setPatient(data ?? null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  if (loading) {
    return (
      <div className="centered">
        <p className="muted">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="centered">
        <div className="card">
          <h2>No se pudo cargar el paciente</h2>
          <p className="muted">{error ?? "No hay datos disponibles."}</p>
          <button type="button" className="btn-primary" onClick={onBack}>
            Volver a pacientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="stack">
      <div className="card">
        <div className="section-header">
          <div>
            <h2>{patient.full_name}</h2>
            <p className="muted">Perfil del paciente</p>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-primary" onClick={() => onEdit(patient.id)}>
              Editar datos
            </button>
            <button type="button" onClick={onBack}>
              Volver
            </button>
          </div>
        </div>
        <div className="profile-info">
          <div>
            <span className="muted">Correo</span>
            <strong>{patient.email ?? "-"}</strong>
          </div>
          <div>
            <span className="muted">Telefono</span>
            <strong>{patient.phone ?? "-"}</strong>
          </div>
          <div>
            <span className="muted">Fecha de nacimiento</span>
            <strong>{patient.date_of_birth ?? "-"}</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="tabs">
          <button
            type="button"
            className={tab === "history" ? "active" : ""}
            onClick={() => setTab("history")}
          >
            Historia clinica
          </button>
          <button
            type="button"
            className={tab === "anthropometry" ? "active" : ""}
            onClick={() => setTab("anthropometry")}
          >
            Antropometria
          </button>
          <button
            type="button"
            className={tab === "consultations" ? "active" : ""}
            onClick={() => setTab("consultations")}
          >
            Consultas
          </button>
          <button
            type="button"
            className={tab === "files" ? "active" : ""}
            onClick={() => setTab("files")}
          >
            Archivos
          </button>
        </div>
      </div>

      {tab === "history" ? <ClinicalHistoryPage patient={patient} /> : null}
      {tab === "anthropometry" ? <AnthropometryPage patient={patient} /> : null}
      {tab === "consultations" ? <ConsultationsPage patient={patient} /> : null}
      {tab === "files" ? <FilesPage patient={patient} /> : null}
    </section>
  );
}
