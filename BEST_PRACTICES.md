# BEST_PRACTICES.md

Mejores prácticas de desarrollo para el proyecto Citas-Medicas.

---

## Parte 1: React + Vite Performance

Las optimizaciones están ordenadas por impacto. Enfocarse primero en las categorías CRITICAL.

---

### 1. Eliminating Waterfalls (CRITICAL)

Los waterfalls ocurren cuando las solicitudes de datos se ejecutan secuencialmente en lugar de en paralelo.

#### Problema: Fetches secuenciales

```typescript
// MAL - Waterfall: cada fetch espera al anterior
async function loadPatientData(patientId: string) {
  const patient = await fetchPatientById(patientId);
  const history = await fetchClinicalHistory(patientId);
  const files = await fetchPatientFiles(patientId);
  return { patient, history, files };
}
```

#### Solución: Promise.all()

```typescript
// BIEN - Fetches paralelos
async function loadPatientData(patientId: string) {
  const [patientResult, historyResult, filesResult] = await Promise.all([
    fetchPatientById(patientId),
    fetchClinicalHistory(patientId),
    fetchPatientFiles(patientId),
  ]);
  return {
    patient: patientResult.data,
    history: historyResult.data,
    files: filesResult.data,
  };
}
```

#### Patrón: Defer Await

Iniciar fetches antes de necesitar los resultados:

```typescript
// BIEN - Iniciar fetch temprano, await después
function PatientProfilePage({ patientId }: Props) {
  // Iniciar fetch inmediatamente
  const dataPromise = useMemo(
    () => loadPatientData(patientId),
    [patientId]
  );

  const [data, setData] = useState(null);

  useEffect(() => {
    dataPromise.then(setData);
  }, [dataPromise]);

  // Renderizar mientras carga...
}
```

---

### 2. Bundle Size (CRITICAL)

Un bundle grande retrasa el First Contentful Paint (FCP).

#### Problema: Imports completos de librerías

```typescript
// MAL - Importa toda la librería
import _ from "lodash";
const sorted = _.sortBy(patients, "full_name");

// MAL - Import con destructuring sigue importando todo
import { sortBy } from "lodash";
```

#### Solución: Imports directos

```typescript
// BIEN - Solo importa la función necesaria
import sortBy from "lodash/sortBy";
const sorted = sortBy(patients, "full_name");
```

#### Code Splitting con React.lazy()

```typescript
// BIEN - Carga lazy de páginas
const PatientProfilePage = React.lazy(
  () => import("./pages/PatientProfilePage")
);
const ClinicalHistoryPage = React.lazy(
  () => import("./pages/ClinicalHistoryPage")
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {route === "patient-profile" && <PatientProfilePage />}
      {route === "clinical-history" && <ClinicalHistoryPage />}
    </Suspense>
  );
}
```

#### Análisis de Bundle

```bash
# Visualizar bundle
npx vite-bundle-visualizer

# Verificar tamaño de dependencia específica
npm ls @supabase/supabase-js
```

---

### 3. Client-Side Fetching (MEDIUM-HIGH)

En SPAs como esta, optimizar los fetches del cliente es crucial.

#### Problema: Fetches duplicados

```typescript
// MAL - Cada componente hace su propio fetch
function PatientHeader({ patientId }) {
  const [patient, setPatient] = useState(null);
  useEffect(() => {
    fetchPatientById(patientId).then((r) => setPatient(r.data));
  }, [patientId]);
}

function PatientDetails({ patientId }) {
  const [patient, setPatient] = useState(null);
  useEffect(() => {
    // Fetch duplicado del mismo paciente
    fetchPatientById(patientId).then((r) => setPatient(r.data));
  }, [patientId]);
}
```

#### Solución: Lifting state up

```typescript
// BIEN - Fetch una vez, pasar como prop
function PatientProfilePage({ patientId }) {
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    fetchPatientById(patientId).then((r) => setPatient(r.data));
  }, [patientId]);

  if (!patient) return <LoadingSpinner />;

  return (
    <>
      <PatientHeader patient={patient} />
      <PatientDetails patient={patient} />
    </>
  );
}
```

#### Patrón: Cache simple en memoria

```typescript
// Cache de sesión para datos que no cambian frecuentemente
const patientCache = new Map<string, Patient>();

export async function fetchPatientById(id: string) {
  if (patientCache.has(id)) {
    return { data: patientCache.get(id), error: null };
  }

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (data) {
    patientCache.set(id, data);
  }

  return { data, error: error?.message ?? null };
}

// Invalidar cache cuando sea necesario
export function invalidatePatientCache(id: string) {
  patientCache.delete(id);
}
```

---

### 4. Re-render Optimization (MEDIUM)

Evitar re-renders innecesarios mejora la responsividad.

#### Problema: Crear objetos en render

```typescript
// MAL - Nuevo objeto en cada render causa re-render de hijos
function PatientForm() {
  return (
    <FormContext.Provider value={{ validate: true, lang: "es" }}>
      <FormFields />
    </FormContext.Provider>
  );
}
```

#### Solución: useMemo para objetos

```typescript
// BIEN - Objeto estable
function PatientForm() {
  const contextValue = useMemo(
    () => ({ validate: true, lang: "es" }),
    []
  );

  return (
    <FormContext.Provider value={contextValue}>
      <FormFields />
    </FormContext.Provider>
  );
}
```

#### Problema: Callbacks que cambian

```typescript
// MAL - Nueva función en cada render
function PatientList({ onSelect }) {
  return patients.map((p) => (
    <PatientRow
      key={p.id}
      patient={p}
      onClick={() => onSelect(p.id)} // Nueva función cada vez
    />
  ));
}
```

#### Solución: useCallback

```typescript
// BIEN - Callback estable
function PatientList({ onSelect }) {
  const handleClick = useCallback(
    (id: string) => {
      onSelect(id);
    },
    [onSelect]
  );

  return patients.map((p) => (
    <PatientRow
      key={p.id}
      patient={p}
      onClick={handleClick}
      patientId={p.id}
    />
  ));
}

// En PatientRow
const PatientRow = memo(function PatientRow({ patient, onClick, patientId }) {
  return (
    <div onClick={() => onClick(patientId)}>
      {patient.full_name}
    </div>
  );
});
```

#### Usar refs para valores que no necesitan re-render

```typescript
// BIEN - Ref para tracking sin re-render
function SearchInput({ onSearch }) {
  const debounceTimerRef = useRef<number>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(() => {
      onSearch(e.target.value);
    }, 300);
  };

  return <input onChange={handleChange} />;
}
```

---

### 5. Rendering Performance (MEDIUM)

Optimizar qué y cómo se renderiza.

#### Conditional Rendering temprano

```typescript
// BIEN - Salir temprano evita trabajo innecesario
function PatientDetails({ patient }: Props) {
  if (!patient) return null;
  if (!patient.is_active) return <InactiveMessage />;

  // Solo procesar si hay paciente activo
  return <div>{/* ... */}</div>;
}
```

#### JSX Hoisting

```typescript
// MAL - Crea elementos en cada render
function Layout({ children }) {
  return (
    <div className="layout">
      <header className="header">Citas Médicas</header>
      {children}
    </div>
  );
}

// BIEN - Elementos estáticos fuera del componente
const Header = <header className="header">Citas Médicas</header>;

function Layout({ children }) {
  return (
    <div className="layout">
      {Header}
      {children}
    </div>
  );
}
```

#### Listas: key estable y única

```typescript
// BIEN - Key basada en ID único
{patients.map((patient) => (
  <PatientCard key={patient.id} patient={patient} />
))}

// MAL - Index como key causa problemas con reordenamiento
{patients.map((patient, index) => (
  <PatientCard key={index} patient={patient} />
))}
```

---

### 6. JavaScript Performance (LOW-MEDIUM)

Micro-optimizaciones que suman en operaciones frecuentes.

#### Set/Map para lookups frecuentes

```typescript
// MAL - O(n) lookup en cada iteración
const activeIds = activePatients.map((p) => p.id);
const isActive = (id: string) => activeIds.includes(id);

// BIEN - O(1) lookup
const activeIdSet = new Set(activePatients.map((p) => p.id));
const isActive = (id: string) => activeIdSet.has(id);
```

#### Cache de property access en loops

```typescript
// MAL - Acceso a length en cada iteración
for (let i = 0; i < patients.length; i++) {
  // ...
}

// BIEN - Cache de length
const len = patients.length;
for (let i = 0; i < len; i++) {
  // ...
}

// MEJOR - for...of cuando no necesitas index
for (const patient of patients) {
  // ...
}
```

---

## Parte 2: Patrones de Seguridad

---

### XSS Prevention

#### Nunca usar dangerouslySetInnerHTML

```typescript
// MAL - Vulnerable a XSS
function PatientNotes({ notes }) {
  return <div dangerouslySetInnerHTML={{ __html: notes }} />;
}

// BIEN - React escapa automáticamente
function PatientNotes({ notes }) {
  return <div>{notes}</div>;
}
```

#### Si necesitas HTML (raro), sanitizar primero

```typescript
import DOMPurify from "dompurify";

// Solo si es absolutamente necesario
function RichNotes({ htmlContent }) {
  const sanitized = DOMPurify.sanitize(htmlContent);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

#### URLs: validar protocolo

```typescript
// MAL - Permite javascript: URLs
<a href={userProvidedUrl}>Link</a>

// BIEN - Validar protocolo
function SafeLink({ url, children }) {
  const isValid = url.startsWith("http://") || url.startsWith("https://");
  if (!isValid) return <span>{children}</span>;
  return <a href={url}>{children}</a>;
}
```

---

### SQL Injection Prevention

#### Supabase escapa automáticamente

```typescript
// BIEN - Supabase usa prepared statements internamente
const { data } = await supabase
  .from("patients")
  .select("*")
  .eq("full_name", userInput) // userInput es escapado
  .ilike("email", `%${searchTerm}%`); // searchTerm es escapado
```

#### Nunca construir queries con strings

```typescript
// MAL - Vulnerable a SQL injection (nunca hacer esto)
const query = `SELECT * FROM patients WHERE name = '${userInput}'`;

// BIEN - Siempre usar el query builder de Supabase
const { data } = await supabase
  .from("patients")
  .select("*")
  .eq("full_name", userInput);
```

---

### RLS Best Practices

#### Principio: Default Deny

```sql
-- RLS habilitado = sin policies significa sin acceso
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Sin policies creadas = nadie puede acceder
-- Agregar policies explícitamente para cada operación permitida
```

#### SECURITY DEFINER para helpers

```sql
-- Función helper que accede a datos del usuario
CREATE OR REPLACE FUNCTION public.current_clinic_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER  -- Ejecuta con privilegios del owner
SET search_path = public  -- Prevenir search_path injection
AS $$
  SELECT clinic_id FROM public.users WHERE id = auth.uid();
$$;
```

#### Policies consistentes

```sql
-- Patrón para todas las tablas con clinic_id
CREATE POLICY "tabla_select" ON tabla
  FOR SELECT USING (clinic_id = public.current_clinic_id());

CREATE POLICY "tabla_insert" ON tabla
  FOR INSERT WITH CHECK (clinic_id = public.current_clinic_id());

CREATE POLICY "tabla_update" ON tabla
  FOR UPDATE
  USING (clinic_id = public.current_clinic_id())
  WITH CHECK (clinic_id = public.current_clinic_id());

CREATE POLICY "tabla_delete" ON tabla
  FOR DELETE USING (clinic_id = public.current_clinic_id());
```

---

### Validación de Inputs

#### Capa 1: Frontend (UX)

```typescript
function PatientForm({ onSubmit }) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: PatientFormData) => {
    const newErrors: Record<string, string> = {};

    if (!data.full_name?.trim()) {
      newErrors.full_name = "El nombre es requerido";
    }

    if (data.email && !isValidEmail(data.email)) {
      newErrors.email = "Email inválido";
    }

    if (data.phone && !isValidPhone(data.phone)) {
      newErrors.phone = "Teléfono inválido";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };
}
```

#### Capa 2: Database Constraints (Seguridad)

```sql
-- Constraints en la tabla
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,  -- NOT NULL es constraint
  full_name TEXT NOT NULL,
  email TEXT,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);
```

---

### Manejo Seguro de Archivos

#### Validar tipo de archivo

```typescript
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Tipo de archivo no permitido. Use PDF, JPG, PNG o WebP.";
  }

  if (file.size > MAX_SIZE) {
    return "El archivo excede el tamaño máximo de 10MB.";
  }

  return null;
}
```

#### Sanitizar nombre de archivo

```typescript
export function sanitizeFileName(name: string): string {
  return name
    .replace(/\s+/g, "-")       // Espacios a guiones
    .replace(/[^a-zA-Z0-9.-]/g, "") // Solo alfanuméricos, puntos y guiones
    .toLowerCase();
}
```

---

## Parte 3: Patrones de Datos Citas-Medicas

---

### Patrón CRUD Consistente

Todas las funciones de datos siguen el mismo formato de retorno:

```typescript
// Lectura con datos
type ReadResult<T> = {
  data: T | null;
  error: string | null;
};

// Lectura paginada
type PaginatedResult<T> = {
  data: T[] | null;
  count: number | null;
  error: string | null;
};

// Escritura
type WriteResult = {
  error: string | null;
};
```

#### Ejemplo completo

```typescript
// src/lib/consultations.ts
import { supabase } from "./supabase";
import type { Consultation } from "./types";

type ConsultationPayload = {
  consultation_date: string;
  observations: string | null;
  plan_summary: string | null;
};

export async function fetchConsultations(patientId: string) {
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("patient_id", patientId)
    .eq("is_active", true)
    .order("consultation_date", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Consultation[], error: null };
}

export async function createConsultation(
  patientId: string,
  payload: ConsultationPayload
) {
  const { error } = await supabase.from("consultations").insert({
    patient_id: patientId,
    ...payload,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function updateConsultation(
  id: string,
  payload: ConsultationPayload
) {
  const { error } = await supabase
    .from("consultations")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function deactivateConsultation(id: string) {
  const { error } = await supabase
    .from("consultations")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
```

---

### Soft Deletes

**Regla:** Nunca usar DELETE, siempre `is_active = false`.

```typescript
// BIEN - Soft delete
export async function deactivatePatient(id: string) {
  const { error } = await supabase
    .from("patients")
    .update({ is_active: false })
    .eq("id", id);

  return { error: error?.message ?? null };
}

// MAL - Hard delete (NO usar)
export async function deletePatient(id: string) {
  await supabase.from("patients").delete().eq("id", id);
}
```

#### Queries siempre filtran activos

```typescript
// Siempre incluir filtro is_active
const { data } = await supabase
  .from("patients")
  .select("*")
  .eq("is_active", true)  // <-- Importante
  .order("created_at", { ascending: false });
```

---

### Paginación

**Tamaño estándar:** 25 items por página

```typescript
const PAGE_SIZE = 25;

type PaginationParams = {
  page: number;
  pageSize?: number;
};

export async function fetchPatients({
  query,
  page,
  pageSize = PAGE_SIZE,
}: FetchParams) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("patients")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { data: null, count: null, error: error.message };
  }

  return { data, count: count ?? 0, error: null };
}
```

#### Componente de paginación

```typescript
function Pagination({ page, totalCount, pageSize, onPageChange }) {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="pagination">
      <button
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </button>

      <span>
        Página {page + 1} de {totalPages}
      </span>

      <button
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </button>
    </div>
  );
}
```

---

### Búsqueda Multi-Campo

Patrón para buscar en múltiples columnas:

```typescript
function buildSearchFilter(query: string): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const search = `%${trimmed}%`;

  // Construir condiciones OR
  const conditions = [
    `full_name.ilike.${search}`,
    `email.ilike.${search}`,
    `phone.ilike.${search}`,
  ];

  // Agregar búsqueda exacta por fecha si el formato es válido
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    conditions.push(`date_of_birth.eq.${trimmed}`);
  }

  return conditions.join(",");
}

// Uso
let request = supabase
  .from("patients")
  .select("*")
  .eq("is_active", true);

const filter = buildSearchFilter(searchQuery);
if (filter) {
  request = request.or(filter);
}

const { data } = await request;
```

---

### Manejo de Errores

#### En funciones de datos

```typescript
export async function fetchPatientById(id: string) {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching patient:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { data: null, error: "Error inesperado al cargar paciente" };
  }
}
```

#### En componentes

```typescript
function PatientProfile({ patientId }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientById(patientId)
      .then(({ data, error }) => {
        if (error) {
          setError(error);
        } else {
          setPatient(data);
        }
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!patient) return <NotFound />;

  return <PatientDetails patient={patient} />;
}
```

---

### Testing Patterns

#### Setup de mock para Supabase

```typescript
// src/lib/__mocks__/supabase.ts
import { vi } from "vitest";

export const supabase = {
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
};
```

#### Test de función de datos

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchPatients } from "./patients";
import { supabase } from "./supabase";

vi.mock("./supabase");

describe("fetchPatients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna pacientes activos paginados", async () => {
    const mockData = [
      { id: "1", full_name: "Juan Pérez", is_active: true },
      { id: "2", full_name: "María García", is_active: true },
    ];

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: mockData,
        count: 2,
        error: null,
      }),
    };

    vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

    const result = await fetchPatients({
      query: "",
      page: 0,
      pageSize: 25,
    });

    expect(result.data).toEqual(mockData);
    expect(result.count).toBe(2);
    expect(result.error).toBeNull();
  });

  it("maneja errores correctamente", async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: null,
        count: null,
        error: { message: "Database error" },
      }),
    };

    vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

    const result = await fetchPatients({
      query: "",
      page: 0,
      pageSize: 25,
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe("Database error");
  });
});
```

---

## Referencias

- [CLAUDE.md](./CLAUDE.md) - Guía principal de desarrollo
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura técnica detallada
- [React Performance](https://react.dev/learn/render-and-commit)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
