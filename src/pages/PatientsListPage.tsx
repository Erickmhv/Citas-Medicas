import { useEffect, useMemo, useState } from "react";
import type { Patient } from "../lib/types";
import { EditIcon, TrashIcon } from "../components/Icons";
import { useToast } from "../components/ToastProvider";
import { deactivatePatient, fetchPatients } from "../lib/patients";

type PatientsListPageProps = {
  onAdd: () => void;
  onEdit: (id: string) => void;
  onViewProfile: (id: string) => void;
};

export default function PatientsListPage({ onAdd, onEdit, onViewProfile }: PatientsListPageProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 25;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const loadPatients = async (currentQuery: string, currentPage: number) => {
    setLoading(true);
    setError(null);

    const { data, count, error: fetchError } = await fetchPatients({
      query: currentQuery,
      page: currentPage,
      pageSize,
    });

    if (fetchError) {
      setError(fetchError);
      addToast(fetchError, "error");
      setPatients([]);
    } else {
      setPatients(data ?? []);
      setTotal(count ?? 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setPage(0);
      loadPatients(query, 0);
    }, 300);

    return () => window.clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    loadPatients(query, page);
  }, [page]);

  const handleDeactivate = async (patient: Patient) => {
    const confirm = window.confirm(
      `Deseas desactivar a ${patient.full_name}? No aparecera en el listado.`
    );
    if (!confirm) return;

    setSaving(true);
    const { error: deactivateError } = await deactivatePatient(patient.id);
    if (deactivateError) {
      setError(deactivateError);
      addToast(deactivateError, "error");
    } else {
      await loadPatients(query, page);
      addToast("Paciente desactivado.", "success");
    }
    setSaving(false);
  };

  return (
    <section className="stack">
      <div className="card">
        <div className="section-header">
          <div>
            <h2>Pacientes</h2>
            <p className="muted">Busca por nombre, correo o telefono.</p>
          </div>
          <button type="button" className="btn-primary" onClick={onAdd}>
            Nuevo paciente
          </button>
        </div>
        <div className="search-row">
          <label>
            Busqueda rapida
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre, correo o telefono"
            />
          </label>
        </div>
        <div className="section-divider">
          <span>Listado de pacientes</span>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </div>
      <div className="card">
        <div className="section-header">
          <h3>Listado</h3>
          <button
            type="button"
            className="btn-icon"
            onClick={() => loadPatients(query, page)}
            disabled={loading}
            aria-label="Actualizar"
            title="Actualizar"
          >
            ↻
          </button>
        </div>
        {loading ? (
          <p className="muted">Cargando pacientes...</p>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <p className="muted">
              {query.trim()
                ? "No encontramos pacientes con ese criterio."
                : "No hay pacientes activos."}
            </p>
            <button type="button" className="btn-primary" onClick={onAdd}>
              Agregar primer paciente
            </button>
          </div>
        ) : (
          <div className="table table-patients">
            <div className="table-row table-header">
              <span>Nombre</span>
              <span>Correo</span>
              <span>Telefono</span>
              <span>Fecha de nacimiento</span>
              <span>Creado</span>
              <span>Acciones</span>
            </div>
            {patients.map((patient) => (
              <div className="table-row" key={patient.id}>
                <span data-label="Nombre">{patient.full_name}</span>
                <span data-label="Correo">{patient.email ?? "-"}</span>
                <span data-label="Telefono">{patient.phone ?? "-"}</span>
                <span data-label="Fecha de nacimiento">{patient.date_of_birth ?? "-"}</span>
                <span data-label="Creado">{new Date(patient.created_at).toLocaleDateString()}</span>
                <span className="table-actions" data-label="Acciones">
                  <button
                    type="button"
                    className="btn-primary btn-action"
                    onClick={() => onViewProfile(patient.id)}
                    disabled={saving}
                  >
                    Ver perfil
                  </button>
                  <button
                    type="button"
                    className="btn-success btn-action"
                    onClick={() => onEdit(patient.id)}
                    disabled={saving}
                  >
                    <EditIcon />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-danger btn-action"
                    onClick={() => handleDeactivate(patient)}
                    disabled={saving}
                  >
                    <TrashIcon />
                    Eliminar
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="pagination">
          <button
            type="button"
            className="btn-icon"
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0}
            aria-label="Anterior"
            title="Anterior"
          >
            ←
          </button>
          <span>
            Pagina {page + 1} de {totalPages}
          </span>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={page >= totalPages - 1}
            aria-label="Siguiente"
            title="Siguiente"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
