import { useEffect, useState } from "react";
import type { Patient } from "../lib/types";
import { searchPatients } from "../lib/patients";

type PatientPickerProps = {
  label: string;
  selectedPatient: Patient | null;
  onSelect: (patient: Patient | null) => void;
};

export default function PatientPicker({ label, selectedPatient, onSelect }: PatientPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPatient) {
      setResults([]);
      setQuery("");
      setError(null);
      setLoading(false);
      return;
    }

    const handler = window.setTimeout(() => {
      setLoading(true);
      searchPatients(query, 8).then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError);
          setResults([]);
        } else {
          setError(null);
          setResults(data ?? []);
        }
        setLoading(false);
      });
    }, 250);

    return () => window.clearTimeout(handler);
  }, [query]);

  return (
    <div className="picker">
      <label>
        {label}
        {!selectedPatient ? (
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, correo o telefono"
          />
        ) : null}
      </label>
      {selectedPatient ? (
        <div className="picker-selected">
          <div>
            <strong>{selectedPatient.full_name}</strong>
            <p className="muted">Paciente seleccionado</p>
          </div>
          <button type="button" onClick={() => onSelect(null)}>
            Cambiar paciente
          </button>
        </div>
      ) : null}
      {!selectedPatient ? (
        <div className="picker-list">
          {loading ? <p className="muted">Buscando...</p> : null}
          {error ? <p className="error">{error}</p> : null}
          {!loading && results.length === 0 ? (
            <p className="muted">Sin resultados.</p>
          ) : null}
          {results.map((patient) => (
            <button
              key={patient.id}
              type="button"
              className="picker-item"
              onClick={() => onSelect(patient)}
            >
              <span>{patient.full_name}</span>
              <span className="muted">{patient.email ?? patient.phone ?? ""}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
