# ARCHITECTURE.md

Documentación técnica detallada de la arquitectura del proyecto Citas-Medicas.

---

## Visión General

Citas-Medicas es una Single Page Application (SPA) para gestión de consultas médicas de nutrición. El principio fundamental es:

> **La base de datos ES el backend.**

PostgreSQL (via Supabase) maneja toda la lógica de negocio, seguridad y validación. El frontend es un cliente delgado que consume la API de Supabase.

```
┌─────────────────────────────────────────────────────────────┐
│                     ARQUITECTURA                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐         ┌──────────────────────────────┐ │
│   │   Browser    │         │         Supabase             │ │
│   │              │         │                              │ │
│   │ ┌──────────┐ │  HTTPS  │ ┌──────────┐ ┌────────────┐ │ │
│   │ │  React   │◄─────────►│ │   Auth   │ │ PostgreSQL │ │ │
│   │ │   SPA    │ │         │ └──────────┘ │   + RLS    │ │ │
│   │ └──────────┘ │         │              └────────────┘ │ │
│   │              │         │ ┌──────────────────────────┐ │ │
│   │              │         │ │       Storage            │ │ │
│   │              │         │ │   (patient-files)        │ │ │
│   │              │         │ └──────────────────────────┘ │ │
│   └──────────────┘         └──────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Modelo Multi-Tenancy

### Decisión Arquitectónica

**Enfoque:** `clinic_id` directo en cada tabla (sin tabla `tenants` separada)

Este modelo fue elegido porque:
1. Simplicidad para el escenario actual (un usuario = una clínica)
2. Policies RLS más legibles y directas
3. Sin JOINs adicionales en cada query
4. Menor complejidad en el código del frontend

### Implementación

```sql
-- Cada tabla de datos tiene clinic_id
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL DEFAULT public.current_clinic_id(),
  full_name TEXT NOT NULL,
  -- ... otros campos
);

-- Función helper para obtener clinic_id del usuario actual
CREATE OR REPLACE FUNCTION public.current_clinic_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.users
  WHERE id = auth.uid();
$$;
```

### Flujo de Datos

```
1. Usuario hace login
   ↓
2. Supabase Auth valida y emite JWT con user_id
   ↓
3. Cualquier query incluye auth.uid() implícitamente
   ↓
4. current_clinic_id() obtiene clinic_id de la tabla users
   ↓
5. RLS filtra datos automáticamente por clinic_id
```

### Diagrama de Relaciones

```
┌─────────────┐       ┌─────────────┐
│   clinics   │       │    users    │
├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ clinic_id   │
│ name        │       │ id (PK/FK)  │───► auth.users
│ created_at  │       │ full_name   │
└─────────────┘       │ role        │
       │              └─────────────┘
       │
       │ clinic_id (FK implícito via current_clinic_id())
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌─────────────┐    ┌─────────────────┐   ┌──────────┐
│  patients   │    │ clinical_history│   │  files   │
├─────────────┤    ├─────────────────┤   ├──────────┤
│ id (PK)     │◄───│ patient_id (FK) │   │ id (PK)  │
│ clinic_id   │    │ clinic_id       │   │clinic_id │
│ full_name   │    │ notes           │   │patient_id│
│ email       │    │ is_active       │   │file_path │
│ phone       │    └─────────────────┘   └──────────┘
│ is_active   │
└─────────────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────┐  ┌─────────────┐  ┌──────────────────────┐
│consultations │  │ lab_results │  │anthropometric_records│
├──────────────┤  ├─────────────┤  ├──────────────────────┤
│ id (PK)      │  │ id (PK)     │  │ id (PK)              │
│ patient_id   │  │ patient_id  │  │ patient_id           │
│ clinic_id    │  │ clinic_id   │  │ clinic_id            │
│ observations │  │ result_data │  │ weight_kg            │
│ is_active    │  │ notes       │  │ height_cm            │
└──────────────┘  └─────────────┘  │ waist_cm, hip_cm     │
                                   │ is_active            │
                                   └──────────────────────┘
```

---

## 2. Patrones RLS (Row Level Security)

### Principio Fundamental: Default Deny

```sql
-- Al habilitar RLS sin policies, NADIE puede acceder
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Esta query falla si no hay policies
SELECT * FROM patients;  -- Error: permission denied
```

### Estructura de Policies

Cada tabla tiene 4 policies (CRUD):

```sql
-- SELECT: Leer solo datos de mi clínica
CREATE POLICY "patients_select" ON patients
  FOR SELECT
  USING (clinic_id = public.current_clinic_id());

-- INSERT: Solo insertar con mi clinic_id
CREATE POLICY "patients_insert" ON patients
  FOR INSERT
  WITH CHECK (clinic_id = public.current_clinic_id());

-- UPDATE: Solo actualizar mis datos, y no cambiar clinic_id
CREATE POLICY "patients_update" ON patients
  FOR UPDATE
  USING (clinic_id = public.current_clinic_id())
  WITH CHECK (clinic_id = public.current_clinic_id());

-- DELETE: Solo eliminar mis datos
CREATE POLICY "patients_delete" ON patients
  FOR DELETE
  USING (clinic_id = public.current_clinic_id());
```

### Matriz de Policies por Tabla

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `clinics` | membership check | authenticated | membership check | - |
| `users` | own row only | own row only | own row only | - |
| `patients` | clinic_id | clinic_id | clinic_id | clinic_id |
| `clinical_history` | clinic_id | clinic_id | clinic_id | clinic_id |
| `consultations` | clinic_id | clinic_id | clinic_id | clinic_id |
| `anthropometric_records` | clinic_id | clinic_id | clinic_id | clinic_id |
| `files` | clinic_id | clinic_id | clinic_id | clinic_id |
| `audit_logs` | clinic_id | clinic_id | - | - |

### Policy Especial: Users

La tabla `users` tiene policies diferentes porque cada usuario solo puede ver/editar su propia fila:

```sql
-- Solo puede ver su propia fila
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (id = auth.uid());

-- Solo puede insertar su propia fila
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Solo puede actualizar su propia fila
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (id = auth.uid());
```

---

## 3. Capas de Validación

### Diagrama de Capas

```
┌────────────────────────────────────────────────────────────┐
│                    USUARIO                                  │
└────────────────────────────┬───────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│           CAPA 1: Frontend (React)                          │
│                                                              │
│   - Validación de formularios (onSubmit)                    │
│   - Campos requeridos                                       │
│   - Formato de email/teléfono                               │
│   - Mensajes de error en español                            │
│   - Feedback inmediato al usuario                           │
│                                                              │
│   Objetivo: UX (prevenir errores obvios)                    │
└────────────────────────────┬───────────────────────────────┘
                             │ Si pasa validación
                             ▼
┌────────────────────────────────────────────────────────────┐
│           CAPA 2: Supabase Client                           │
│                                                              │
│   - Sanitización automática de inputs                       │
│   - Prepared statements (previene SQL injection)            │
│   - Manejo de errores de red                                │
│                                                              │
│   Objetivo: Seguridad en tránsito                           │
└────────────────────────────┬───────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│           CAPA 3: RLS Policies                              │
│                                                              │
│   - Verificación de clinic_id                               │
│   - Verificación de auth.uid()                              │
│   - Aislamiento de datos entre clínicas                     │
│                                                              │
│   Objetivo: Autorización                                    │
└────────────────────────────┬───────────────────────────────┘
                             │ Si autorizado
                             ▼
┌────────────────────────────────────────────────────────────┐
│           CAPA 4: Database Constraints                      │
│                                                              │
│   - NOT NULL constraints                                    │
│   - Foreign key constraints                                 │
│   - CHECK constraints (si aplica)                           │
│   - Defaults (clinic_id, timestamps)                        │
│   - Triggers (audit fields)                                 │
│                                                              │
│   Objetivo: Integridad de datos                             │
└────────────────────────────────────────────────────────────┘
```

### Ejemplo: Crear Paciente

```typescript
// CAPA 1: Validación Frontend
function validatePatient(data: PatientFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.full_name?.trim()) {
    errors.full_name = "El nombre es requerido";
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = "El formato del email es inválido";
  }

  return errors;
}

// CAPA 2: Envío a Supabase
const { error } = await supabase.from("patients").insert({
  full_name: data.full_name.trim(),
  email: data.email || null,
  phone: data.phone || null,
});

// CAPA 3: RLS verifica automáticamente
// INSERT policy: WITH CHECK (clinic_id = public.current_clinic_id())

// CAPA 4: Database aplica
// - clinic_id DEFAULT public.current_clinic_id()
// - NOT NULL constraint en full_name
// - Trigger set_patient_audit_fields() para timestamps
```

---

## 4. Autenticación

### Flujo de Login

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario ingresa credenciales en AuthView                 │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. supabase.auth.signInWithPassword({ email, password })    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Supabase Auth valida credenciales                        │
│    - Verifica email/password en auth.users                  │
│    - Genera JWT con user_id                                 │
│    - Retorna session object                                 │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. useSession() detecta cambio via onAuthStateChange        │
│    - Actualiza estado session                               │
│    - loading = false                                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. App.tsx carga perfil de usuario                          │
│    - SELECT * FROM users WHERE id = auth.uid()              │
│    - Verifica que tenga clinic_id asignado                  │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────────┐
│ 6a. Perfil válido       │   │ 6b. Sin clínica asignada    │
│     → Renderiza app     │   │     → Error "Sin clínica"   │
└─────────────────────────┘   └─────────────────────────────┘
```

### Hook useSession()

```typescript
// src/lib/auth.ts
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    // Suscribirse a cambios de autenticación
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!isMounted) return;
        setSession(nextSession);
      }
    );

    // Cleanup al desmontar
    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
```

### Uso en App

```typescript
function App() {
  const { session, loading } = useSession();
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    if (!session) return;

    // Cargar perfil del usuario
    supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [session]);

  if (loading) return <LoadingSpinner />;
  if (!session) return <AuthView />;
  if (!profile?.clinic_id) return <NoClinicError />;

  return <MainApp profile={profile} />;
}
```

---

## 5. Sistema de Archivos

### Arquitectura de Storage

```
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Storage                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Bucket: patient-files                                      │
│   ├── {patient_id}/                                         │
│   │   ├── 1705123456789-documento.pdf                       │
│   │   ├── 1705123456800-foto.jpg                            │
│   │   └── ...                                               │
│   └── {otro_patient_id}/                                    │
│       └── ...                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Tabla: files                              │
├─────────────────────────────────────────────────────────────┤
│ id          │ UUID, primary key                             │
│ clinic_id   │ UUID, para RLS                                │
│ patient_id  │ UUID, referencia a patients                   │
│ file_name   │ Nombre original del archivo                   │
│ file_path   │ Path en Storage (para signed URLs)            │
│ description │ Descripción opcional                          │
│ is_lab      │ Boolean, si es resultado de laboratorio       │
│ mime_type   │ Tipo MIME del archivo                         │
│ size_bytes  │ Tamaño en bytes                               │
│ is_active   │ Soft delete flag                              │
│ created_at  │ Timestamp de creación                         │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Upload

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario selecciona archivo (PDF o imagen)                │
│    - Validar tipo MIME                                      │
│    - Validar tamaño máximo                                  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. uploadPatientFile() sanitiza nombre                      │
│    - Reemplazar espacios con guiones                        │
│    - Generar path único con timestamp                       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Subir a Storage                                          │
│    const filePath = `${patientId}/${Date.now()}-${name}`;  │
│    await supabase.storage.from("patient-files")             │
│      .upload(filePath, file, { upsert: false });            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Insertar metadata en tabla files                         │
│    await supabase.from("files").insert({                    │
│      clinic_id,                                              │
│      patient_id,                                             │
│      file_name: originalName,                                │
│      file_path: storagePath,                                 │
│      mime_type,                                              │
│      size_bytes,                                             │
│      is_lab,                                                 │
│      description                                             │
│    });                                                       │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Download

```typescript
// Generar URL firmada (expira en 60 segundos)
export async function getFileDownloadUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from("patient-files")
    .createSignedUrl(filePath, 60);

  if (error || !data) {
    return { url: null, error: error?.message ?? "Error generando enlace" };
  }

  return { url: data.signedUrl, error: null };
}
```

### Políticas de Storage

```sql
-- Todos los usuarios autenticados pueden acceder al bucket
-- La seguridad real está en la tabla files via RLS

CREATE POLICY "patient_files_select" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'patient-files');

CREATE POLICY "patient_files_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'patient-files');
```

---

## 6. Cálculos de Antropometría

### Principio: Solo Mediciones Raw

**Decisión:** Los valores derivados (IMC, ratios) se calculan en el cliente y NUNCA se almacenan.

**Razones:**
1. Evitar inconsistencias si la fórmula cambia
2. Reducir tamaño de almacenamiento
3. Fácil agregar nuevos cálculos sin migración

### Estructura de Datos

```sql
-- Solo se almacenan mediciones directas
CREATE TABLE anthropometric_records (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  recorded_at DATE NOT NULL,
  weight_kg NUMERIC,      -- Medición directa
  height_cm NUMERIC,      -- Medición directa
  waist_cm NUMERIC,       -- Medición directa
  hip_cm NUMERIC,         -- Medición directa
  -- NO hay columnas para IMC, ratios, etc.
  is_active BOOLEAN DEFAULT true
);
```

### Función de Cálculo

```typescript
// src/lib/anthropometry.ts

type AnthropometryPayload = {
  recorded_at: string;
  weight_kg: number | null;
  height_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
};

type Formula = {
  key: string;
  label: string;
  unit: string;
  calculate: (record: AnthropometryPayload) => number | null;
};

const formulas: Formula[] = [
  {
    key: "bmi",
    label: "IMC",
    unit: "kg/m²",
    calculate: (record) => {
      if (!record.weight_kg || !record.height_cm) return null;
      if (record.height_cm === 0) return null;
      // IMC = peso(kg) / altura(m)²
      return record.weight_kg / Math.pow(record.height_cm / 100, 2);
    },
  },
  {
    key: "waist_hip_ratio",
    label: "Relación cintura/cadera",
    unit: "",
    calculate: (record) => {
      if (!record.waist_cm || !record.hip_cm) return null;
      if (record.hip_cm === 0) return null;
      return record.waist_cm / record.hip_cm;
    },
  },
  {
    key: "waist_height_ratio",
    label: "Relación cintura/altura",
    unit: "",
    calculate: (record) => {
      if (!record.waist_cm || !record.height_cm) return null;
      if (record.height_cm === 0) return null;
      return record.waist_cm / record.height_cm;
    },
  },
];

export function calculateAnthropometry(record: AnthropometryPayload) {
  return formulas.map((formula) => ({
    key: formula.key,
    label: formula.label,
    unit: formula.unit,
    value: formula.calculate(record),
  }));
}
```

### Uso en UI

```typescript
function AnthropometryView({ record }: Props) {
  const calculations = calculateAnthropometry(record);

  return (
    <div>
      <h3>Mediciones</h3>
      <p>Peso: {record.weight_kg} kg</p>
      <p>Altura: {record.height_cm} cm</p>

      <h3>Valores Calculados</h3>
      {calculations.map(({ key, label, value, unit }) => (
        <p key={key}>
          {label}: {value?.toFixed(2) ?? "N/A"} {unit}
        </p>
      ))}
    </div>
  );
}
```

---

## 7. Sistema de Auditoría

### Tabla audit_logs

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,  -- INSERT, UPDATE, DELETE
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changes JSONB          -- { old: {...}, new: {...} }
);

-- Índices para queries comunes
CREATE INDEX audit_logs_clinic_id_idx ON audit_logs (clinic_id);
CREATE INDEX audit_logs_table_record_idx ON audit_logs (table_name, record_id);
```

### Trigger de Auditoría

```sql
CREATE OR REPLACE FUNCTION public.log_patient_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  audit_changes JSONB;
  clinic UUID;
  record_uuid UUID;
BEGIN
  -- Construir objeto de cambios según operación
  IF TG_OP = 'INSERT' THEN
    audit_changes := jsonb_build_object('new', to_jsonb(NEW));
    clinic := NEW.clinic_id;
    record_uuid := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    audit_changes := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
    clinic := NEW.clinic_id;
    record_uuid := NEW.id;
  ELSE  -- DELETE
    audit_changes := jsonb_build_object('old', to_jsonb(OLD));
    clinic := OLD.clinic_id;
    record_uuid := OLD.id;
  END IF;

  -- Insertar registro de auditoría
  INSERT INTO audit_logs (
    clinic_id,
    table_name,
    record_id,
    action,
    changed_by,
    changes
  ) VALUES (
    clinic,
    TG_TABLE_NAME,
    record_uuid,
    TG_OP,
    auth.uid(),
    audit_changes
  );

  -- Retornar el registro apropiado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Aplicar trigger a patients
CREATE TRIGGER patients_audit
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH ROW
EXECUTE FUNCTION log_patient_audit();
```

### Estructura de changes JSONB

```json
// INSERT
{
  "new": {
    "id": "uuid",
    "full_name": "Juan Pérez",
    "email": "juan@example.com",
    "clinic_id": "uuid",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}

// UPDATE
{
  "old": {
    "full_name": "Juan Perez",
    "email": "juan@example.com"
  },
  "new": {
    "full_name": "Juan Pérez García",
    "email": "juan.garcia@example.com"
  }
}

// DELETE (soft delete en realidad)
{
  "old": {
    "is_active": true
  },
  "new": {
    "is_active": false
  }
}
```

---

## 8. Testing

### Framework y Configuración

**Framework:** Vitest 2.0.5

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

### Estructura de Mocks

```typescript
// Patrón base para mockear Supabase
vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));
```

### Patrón de Test: Query Builder

```typescript
// Mock del query builder encadenado
function createMockQueryBuilder(result: { data: any; error: any }) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };
  return builder;
}

// Uso en test
it("debe retornar pacientes", async () => {
  const mockData = [{ id: "1", full_name: "Test" }];
  const builder = createMockQueryBuilder({
    data: mockData,
    error: null,
    count: 1,
  });

  vi.mocked(supabase.from).mockReturnValue(builder as any);

  const result = await fetchPatients({ query: "", page: 0, pageSize: 25 });

  expect(result.data).toEqual(mockData);
  expect(supabase.from).toHaveBeenCalledWith("patients");
});
```

### Archivos de Test Existentes

| Archivo | Cobertura |
|---------|-----------|
| `src/lib/patients.test.ts` | CRUD pacientes, paginación, búsqueda |
| `src/lib/consultations.test.ts` | CRUD consultas |
| `src/lib/clinicalHistory.test.ts` | CRUD historial |
| `src/lib/anthropometry.test.ts` | CRUD + cálculos |
| `src/lib/files.test.ts` | Upload, download, metadata |

### Ejecutar Tests

```bash
# Suite completa
npm test

# Archivo específico
npx vitest run src/lib/patients.test.ts

# Watch mode
npx vitest

# Con coverage
npx vitest run --coverage
```

---

## 9. Routing (State-Based)

### Decisión: Sin Router Library

El proyecto usa routing manual basado en estado en lugar de react-router u otras librerías.

**Razones:**
1. App pequeña con pocas rutas
2. Sin necesidad de deep linking
3. Menor bundle size
4. Control directo sobre transiciones

### Implementación

```typescript
// App.tsx
type Route =
  | "home"
  | "patients"
  | "patient-form"
  | "patient-profile"
  | "clinical-history"
  | "consultations"
  | "anthropometry"
  | "files";

function App() {
  const [route, setRoute] = useState<Route>("home");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const navigate = (newRoute: Route, patientId?: string) => {
    setRoute(newRoute);
    if (patientId !== undefined) {
      setSelectedPatientId(patientId);
    }
  };

  return (
    <div>
      <AppHeader onNavigate={navigate} />
      {route === "home" && <HomePage onNavigate={navigate} />}
      {route === "patients" && <PatientsListPage onNavigate={navigate} />}
      {route === "patient-form" && (
        <PatientFormPage
          patientId={selectedPatientId}
          onNavigate={navigate}
        />
      )}
      {route === "patient-profile" && selectedPatientId && (
        <PatientProfilePage
          patientId={selectedPatientId}
          onNavigate={navigate}
        />
      )}
      {/* ... otras rutas */}
    </div>
  );
}
```

### Flujo de Navegación

```
┌──────────────────────────────────────────────────────────────┐
│                        HomePage                               │
│  ┌─────────────────┐                                         │
│  │ Ver Pacientes   │──────────► PatientsListPage             │
│  └─────────────────┘                    │                    │
│                                         │                    │
│                                         ▼                    │
│                               ┌─────────────────┐            │
│                               │ Seleccionar     │            │
│                               │ paciente        │            │
│                               └────────┬────────┘            │
│                                        │                     │
│                                        ▼                     │
│                             PatientProfilePage               │
│                    ┌──────────────────┬──────────────────┐   │
│                    │                  │                  │   │
│                    ▼                  ▼                  ▼   │
│         ClinicalHistoryPage  ConsultationsPage   FilesPage   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Estructura de Componentes

### Jerarquía

```
App.tsx
├── AuthView (si no hay sesión)
│   └── Login form
│
└── (si hay sesión)
    ├── AppHeader
    │   ├── Logo/Title
    │   ├── Navigation
    │   └── User menu (logout)
    │
    ├── ToastProvider (contexto global)
    │
    └── {Página actual}
        ├── HomePage
        │   └── Dashboard summary
        │
        ├── PatientsListPage
        │   ├── Search input
        │   ├── PatientsList
        │   │   └── PatientRow (map)
        │   └── Pagination
        │
        ├── PatientFormPage
        │   └── Form fields
        │
        ├── PatientProfilePage
        │   ├── PatientHeader
        │   ├── QuickActions
        │   └── Navigation tabs
        │
        ├── ClinicalHistoryPage
        │   ├── HistoryList
        │   └── AddHistoryForm
        │
        ├── ConsultationsPage
        │   ├── ConsultationsList
        │   └── AddConsultationForm
        │
        ├── AnthropometryPage
        │   ├── RecordsList
        │   ├── CalculatedValues
        │   └── AddRecordForm
        │
        └── FilesPage
            ├── FilesList
            ├── FileUpload
            └── FilePreview
```

---

## Referencias

- [CLAUDE.md](./CLAUDE.md) - Guía principal de desarrollo
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Mejores prácticas
- [db/schema.sql](./db/schema.sql) - Schema completo
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
