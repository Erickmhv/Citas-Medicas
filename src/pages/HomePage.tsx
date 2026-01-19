import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type HomePageProps = {
  onNewPatient: () => void;
  onNewConsultation: () => void;
  onNewFile: () => void;
};

type QuickPatient = {
  id: string;
  full_name: string;
  created_at: string;
};

type QuickConsultation = {
  id: string;
  consultation_date: string;
  patient_name: string | null;
};

type QuickFile = {
  id: string;
  file_name: string;
  is_lab: boolean;
  created_at: string;
  patient_name: string | null;
};

export default function HomePage({ onNewPatient, onNewConsultation, onNewFile }: HomePageProps) {
  const [patients, setPatients] = useState<QuickPatient[]>([]);
  const [consultations, setConsultations] = useState<QuickConsultation[]>([]);
  const [files, setFiles] = useState<QuickFile[]>([]);
  const [totals, setTotals] = useState({ patients: 0, consultations: 0, files: 0 });
  const [weeklyTotals, setWeeklyTotals] = useState({ patients: 0, consultations: 0, files: 0 });
  const [loading, setLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState<7 | 30>(7);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);

      const periodAgo = new Date();
      periodAgo.setDate(periodAgo.getDate() - periodDays);
      const periodAgoIso = periodAgo.toISOString();

      const [
        patientsRes,
        consultationsRes,
        filesRes,
        patientsCountRes,
        consultationsCountRes,
        filesCountRes,
        patientsWeekRes,
        consultationsWeekRes,
        filesWeekRes,
      ] = await Promise.all([
          supabase
            .from("patients")
            .select("id, full_name, created_at")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("consultations")
            .select("id, consultation_date, patients(full_name)")
            .eq("is_active", true)
            .order("consultation_date", { ascending: false })
            .limit(5),
          supabase
            .from("files")
            .select("id, file_name, is_lab, created_at, patients(full_name)")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase.from("patients").select("id", { count: "exact", head: true }).eq("is_active", true),
          supabase
            .from("consultations")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true),
          supabase.from("files").select("id", { count: "exact", head: true }).eq("is_active", true),
          supabase
            .from("patients")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true)
            .gte("created_at", periodAgoIso),
          supabase
            .from("consultations")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true)
            .gte("consultation_date", periodAgoIso.slice(0, 10)),
          supabase
            .from("files")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true)
            .gte("created_at", periodAgoIso),
        ]);

      if (!isMounted) return;

      setPatients((patientsRes.data ?? []) as QuickPatient[]);
      setConsultations(
        (consultationsRes.data ?? []).map((row) => ({
          id: row.id,
          consultation_date: row.consultation_date,
          patient_name: Array.isArray(row.patients)
            ? row.patients[0]?.full_name ?? null
            : row.patients?.full_name ?? null,
        }))
      );
      setFiles(
        (filesRes.data ?? []).map((row) => ({
          id: row.id,
          file_name: row.file_name,
          is_lab: row.is_lab,
          created_at: row.created_at,
          patient_name: Array.isArray(row.patients)
            ? row.patients[0]?.full_name ?? null
            : row.patients?.full_name ?? null,
        }))
      );
      setTotals({
        patients: patientsCountRes.count ?? 0,
        consultations: consultationsCountRes.count ?? 0,
        files: filesCountRes.count ?? 0,
      });
      setWeeklyTotals({
        patients: patientsWeekRes.count ?? 0,
        consultations: consultationsWeekRes.count ?? 0,
        files: filesWeekRes.count ?? 0,
      });

      setLoading(false);
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [periodDays]);

  return (
    <section className="stack">
      <div className="card">
        <h2>Resumen rapido</h2>
        <p className="muted">Acciones clave para tu jornada.</p>
        <div className="quick-actions">
          <button type="button" className="btn-primary" onClick={onNewPatient}>
            Nuevo paciente
          </button>
          <button type="button" className="btn-primary" onClick={onNewConsultation}>
            Nueva consulta
          </button>
          <button type="button" className="btn-primary" onClick={onNewFile}>
            Subir archivo
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="card summary-card">
          <span className="muted">Pacientes activos</span>
          <strong>{loading ? "-" : totals.patients}</strong>
        </div>
        <div className="card summary-card">
          <span className="muted">Consultas registradas</span>
          <strong>{loading ? "-" : totals.consultations}</strong>
        </div>
        <div className="card summary-card">
          <span className="muted">Archivos activos</span>
          <strong>{loading ? "-" : totals.files}</strong>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div>
            <h3>Actividad reciente</h3>
            <p className="muted">Conteo por periodo seleccionado.</p>
          </div>
          <div className="segmented">
            <button
              type="button"
              className={periodDays === 7 ? "active" : ""}
              onClick={() => setPeriodDays(7)}
            >
              7 dias
            </button>
            <button
              type="button"
              className={periodDays === 30 ? "active" : ""}
              onClick={() => setPeriodDays(30)}
            >
              30 dias
            </button>
          </div>
        </div>
        <div className="summary-grid">
          <div className="card summary-card">
            <span className="muted">Pacientes</span>
            <strong>{loading ? "-" : weeklyTotals.patients}</strong>
          </div>
          <div className="card summary-card">
            <span className="muted">Consultas</span>
            <strong>{loading ? "-" : weeklyTotals.consultations}</strong>
          </div>
          <div className="card summary-card">
            <span className="muted">Archivos</span>
            <strong>{loading ? "-" : weeklyTotals.files}</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Ultimos pacientes</h3>
        {patients.length === 0 ? (
          <p className="muted">Aun no hay pacientes registrados.</p>
        ) : (
          <ul className="list card-list">
            {patients.map((patient) => (
              <li key={patient.id}>
                <span>{patient.full_name}</span>
                <span className="muted">
                  {new Date(patient.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>Ultimas consultas</h3>
        {consultations.length === 0 ? (
          <p className="muted">Aun no hay consultas registradas.</p>
        ) : (
          <ul className="list card-list">
            {consultations.map((consultation) => (
              <li key={consultation.id}>
                <span>{consultation.patient_name ?? "Paciente"}</span>
                <span className="muted">
                  {new Date(consultation.consultation_date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>Ultimos archivos</h3>
        {files.length === 0 ? (
          <p className="muted">Aun no hay archivos cargados.</p>
        ) : (
          <ul className="list card-list">
            {files.map((file) => (
              <li key={file.id}>
                <span>{file.file_name}</span>
                <span className="muted">
                  {file.patient_name ?? "Paciente"} · {file.is_lab ? "Laboratorio" : "Documento"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
