# CLAUDE.md

Guía de desarrollo para agentes AI trabajando en el repositorio Citas-Medicas.

---

## Contexto del Proyecto

**Sistema de consultas médicas/nutricionales** - SPA simple, estable y lista para producción.

**Usuarios objetivo:**
- Profesionales médicos o nutricionistas independientes
- Clínicas pequeñas
- Multi-tenant (una clínica por usuario)
- Los pacientes NO inician sesión

**Principios de desarrollo:**
- Preferir patrones probados y "aburridos"
- Evitar over-engineering y framework hype
- Optimizar para claridad, corrección y desarrollo asistido por AI
- Agregar tests para toda lógica CRUD nueva
- Este proyecto es intencionalmente **no cutting-edge**

---

## Features MVP (ALCANCE ESTRICTO)

Solo implementar:

1. **Autenticación** - Email + password via Supabase Auth
2. **Multi-Tenant** - Datos scoped por `clinic_id`, aislamiento via RLS
3. **Gestión de Pacientes** - CRUD, demografía, contacto
4. **Historial Clínico** - Notas de texto libre, antecedentes
5. **Registros Antropométricos** - Peso, altura, cintura, cadera (cálculos en cliente)
6. **Resultados de Laboratorio** - Entrada manual, estructura flexible (JSON)
7. **Consultas/Seguimientos** - Notas por fecha, observaciones, plan
8. **Archivos Adjuntos** - PDFs e imágenes en buckets privados

---

## Principio Arquitectónico Core (NO NEGOCIABLE)

> **La base de datos ES el backend.**

Las reglas de negocio, seguridad y corrección de datos deben vivir en:
- PostgreSQL (constraints, relaciones)
- Row Level Security (RLS)

El frontend es un cliente. Edge Functions son helpers, no el core.

---

## Reglas Críticas para Agentes

### Commits
- **Formato:** Conventional Commits en español
  - `feat:` nueva funcionalidad
  - `fix:` corrección de errores
  - `refactor:` cambios sin modificar comportamiento
  - `docs:` documentación
  - `test:` tests
  - `chore:` mantenimiento
- **Prohibido:** Nunca mencionar "claude", "sonnet", "haiku", "opus" o cualquier modelo AI en commits
- **Ejemplo válido:** `feat: agregar filtro por fecha en listado de pacientes`

### Código
- **Idioma código:** Español para variables, funciones, comentarios y mensajes de usuario
- **Idioma schema DB:** Inglés para tablas, columnas, constraints e índices
- **Estilo:**
  - Usar `Number.parseInt()` en lugar de `parseInt()`
  - Usar `!!value` para conversión booleana en JSX
  - Mantener 0 errores de lint antes de commit
  - Preferir funciones nombradas sobre arrow functions para exports

### TypeScript
- Tipar todo explícitamente
- Usar tipos compartidos para registros de DB
- Evitar `any` - usar tipos explícitos
- Preferir interfaces sobre types para objetos
- Código generado debe ser: determinístico, legible, "aburrido"

### Arquitectura
- **Stack:** React + Vite (NO Next.js)
- **Backend:** Supabase exclusivamente (PostgreSQL + RLS + Auth + Storage)
- **Principio:** La base de datos ES el backend - sin servidores custom

---

## Quick Start

```bash
# Desarrollo
npm run dev      # Servidor Vite en http://localhost:5173

# Producción
npm run build    # TypeScript check + build optimizado
npm run preview  # Vista previa del build de producción

# Testing
npm test         # Ejecutar suite completa con Vitest
npx vitest run src/lib/patients.test.ts  # Test específico
```

### Variables de Entorno

```bash
VITE_SUPABASE_URL=<url-del-proyecto>
VITE_SUPABASE_ANON_KEY=<anon-key>
```

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend | React + TypeScript | 18.3.1 |
| Build | Vite | 7.3.1 |
| Backend | Supabase (PostgreSQL) | 2.49.1 |
| Auth | Supabase Auth | Integrado |
| Storage | Supabase Storage | Integrado |
| Testing | Vitest | 2.0.5 |

### Tecnologías NO Utilizadas

**Explícitamente prohibidas:**
- Express / Fastify / servidores Node custom
- Microservicios
- GraphQL
- Message queues
- Event-driven pipelines
- SSR / Server Components
- Next.js (usar Vite)

---

## Arquitectura Core

### Multi-Tenancy

**Modelo:** `clinic_id` directo (sin tabla tenants separada)

Cada usuario pertenece a una clínica. Todos los datos se filtran automáticamente por `clinic_id`.

```sql
-- Función helper (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.current_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM public.users
  WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Row Level Security (RLS)

**Principio:** Default Deny - sin policies = sin acceso

```sql
-- Todas las tablas tienen RLS habilitado
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Patrón de policy por tabla
CREATE POLICY "patients_select" ON patients
  FOR SELECT USING (clinic_id = public.current_clinic_id());
```

### Reglas de Seguridad

Se DEBE garantizar:
- PostgreSQL RLS en todas las tablas
- Aislamiento de datos a nivel clínica
- Sin acceso público a datos de pacientes
- Storage privado para archivos

**La seguridad NO debe depender de lógica del frontend.**

### Soft Deletes

**Nunca** usar DELETE directo. Todas las entidades usan `is_active = false`:

```typescript
// Correcto
await supabase.from("patients").update({ is_active: false }).eq("id", id);

// Incorrecto - NO hacer
await supabase.from("patients").delete().eq("id", id);
```

### Edge Functions (LIMITACIÓN IMPORTANTE)

Edge Functions son **opcionales y limitadas**.

**Uso permitido:**
- Generación de PDFs
- Procesamiento de archivos
- Llamadas a APIs externas
- Tareas que requieren servidor seguro

**Uso PROHIBIDO:**
- Operaciones CRUD
- Autenticación/Autorización
- Lógica multi-tenant
- Validación de datos

➡️ Si necesitas CRUD: usa cliente Supabase + RLS.

---

## Estructura del Proyecto

```
src/
├── lib/              # Módulos de datos (uno por entidad)
│   ├── supabase.ts   # Cliente singleton
│   ├── auth.ts       # Hook useSession()
│   ├── types.ts      # Interfaces TypeScript compartidas
│   ├── patients.ts   # CRUD pacientes + paginación
│   ├── consultations.ts  # Notas de visita
│   ├── clinicalHistory.ts # Historial médico
│   ├── anthropometry.ts  # Mediciones + cálculos cliente
│   ├── files.ts      # Subida a Storage
│   └── profile.ts    # Info de clínica
├── pages/            # Componentes de ruta
│   ├── HomePage.tsx
│   ├── PatientsListPage.tsx
│   ├── PatientFormPage.tsx
│   ├── PatientProfilePage.tsx
│   ├── ClinicalHistoryPage.tsx
│   ├── ConsultationsPage.tsx
│   ├── AnthropometryPage.tsx
│   └── FilesPage.tsx
├── components/       # Componentes UI compartidos
│   ├── AuthView.tsx
│   ├── AppHeader.tsx
│   ├── PatientPicker.tsx
│   ├── ToastProvider.tsx
│   └── Icons.tsx
└── App.tsx           # Router principal (state-based)
db/
└── schema.sql        # Fuente de verdad para schema DB
```

---

## Capa de Datos (`src/lib/`)

Cada módulo retorna `{ data, error }` o `{ error }` para operaciones de escritura:

| Módulo | Responsabilidad |
|--------|-----------------|
| `supabase.ts` | Cliente Supabase singleton |
| `auth.ts` | Hook `useSession()` para estado de autenticación |
| `types.ts` | Interfaces TypeScript para todas las entidades |
| `patients.ts` | CRUD pacientes + búsqueda paginada multi-campo |
| `consultations.ts` | Notas de visita por paciente |
| `clinicalHistory.ts` | Historial médico (notas largas) |
| `anthropometry.ts` | Mediciones físicas + cálculos derivados |
| `files.ts` | Upload a Storage + metadata en tabla files |
| `profile.ts` | Información de clínica del usuario actual |

### Patrón CRUD Consistente

```typescript
// Lectura
export async function fetchPatients({ query, page, pageSize }) {
  const { data, error, count } = await supabase
    .from("patients")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .range(from, to);

  if (error) return { data: null, count: null, error: error.message };
  return { data, count, error: null };
}

// Escritura
export async function createPatient(payload) {
  const { error } = await supabase.from("patients").insert(payload);
  if (error) return { error: error.message };
  return { error: null };
}

// Soft delete
export async function deactivatePatient(id: string) {
  const { error } = await supabase
    .from("patients")
    .update({ is_active: false })
    .eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}
```

---

## Routing

Enrutamiento manual basado en estado en `App.tsx`:

| Ruta | Página | Descripción |
|------|--------|-------------|
| `home` | HomePage | Dashboard principal |
| `patients` | PatientsListPage | Listado paginado |
| `patient-form` | PatientFormPage | Crear/editar paciente |
| `patient-profile` | PatientProfilePage | Detalle de paciente |
| `clinical-history` | ClinicalHistoryPage | Historial médico |
| `consultations` | ConsultationsPage | Notas de visita |
| `anthropometry` | AnthropometryPage | Mediciones físicas |
| `files` | FilesPage | Archivos del paciente |

---

## Paginación

**Tamaño fijo:** 25 items por página

```typescript
const pageSize = 25;
const from = page * pageSize;
const to = from + pageSize - 1;

const { data, count } = await supabase
  .from("patients")
  .select("*", { count: "exact" })
  .range(from, to);
```

---

## Búsqueda Multi-Campo

```typescript
function buildSearchFilter(query: string) {
  const search = `%${query.trim()}%`;
  return [
    `full_name.ilike.${search}`,
    `email.ilike.${search}`,
    `phone.ilike.${search}`,
  ].join(",");
}

// Uso con .or()
request = request.or(filter);
```

---

## Sistema de Archivos

**Bucket:** `patient-files`

**Path format:** `{patient_id}/{timestamp}-{filename}`

```typescript
// Upload
const filePath = `${patientId}/${Date.now()}-${safeName}`;
await supabase.storage.from("patient-files").upload(filePath, file);

// URL firmada (60 segundos)
const { data } = await supabase.storage
  .from("patient-files")
  .createSignedUrl(filePath, 60);
```

---

## Cálculos de Antropometría

**Regla:** Los cálculos derivados se hacen en cliente, NUNCA se almacenan:

```typescript
// Solo se guardan mediciones raw
{ weight_kg, height_cm, waist_cm, hip_cm }

// Cálculos en cliente
calculateAnthropometry(record) // Retorna IMC, ratios, etc.
```

**Cálculos disponibles:**
- IMC: `peso / (altura_m²)`
- Ratio cintura/cadera: `cintura / cadera`
- Ratio cintura/altura: `cintura / altura`

---

## Testing

**Framework:** Vitest 2.0.5

**Ubicación:** Tests co-locados con módulos en `src/lib/`

```typescript
// Patrón de mock
vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
    storage: { from: vi.fn() },
    auth: { getUser: vi.fn() }
  }
}));
```

**Archivos de test:**
- `patients.test.ts`
- `consultations.test.ts`
- `clinicalHistory.test.ts`
- `anthropometry.test.ts`
- `files.test.ts`

---

## Restricciones Clave

| Restricción | Razón |
|-------------|-------|
| No servidores custom | Supabase maneja todo el backend |
| No SSR/server components | SPA puro client-rendered |
| No Edge Functions para CRUD | Solo para procesamiento de archivos |
| Cálculos antropométricos en cliente | Evitar almacenar datos derivados |
| 25 items por página | Consistencia UX |
| Variables CSS para temas | Soporte light/dark mode |

---

## Tablas de Base de Datos

| Tabla | Descripción | RLS |
|-------|-------------|-----|
| `clinics` | Clínicas registradas | Por membership |
| `users` | Usuarios con clinic_id | Solo propio |
| `patients` | Pacientes de la clínica | Por clinic_id |
| `clinical_history` | Notas de historial médico | Por clinic_id |
| `consultations` | Notas de consulta | Por clinic_id |
| `anthropometric_records` | Mediciones físicas | Por clinic_id |
| `files` | Metadata de archivos | Por clinic_id |
| `audit_logs` | Log de cambios | Por clinic_id |

### Reglas de Diseño de BD

- PostgreSQL es la fuente de verdad
- Toda tabla DEBE estar scoped a una clínica
- Preferir schemas simples y legibles
- Campos JSON permitidos donde se necesite flexibilidad
- Evitar normalización prematura

---

## Auditoría

Trigger automático `log_patient_audit()` captura:
- Operación (INSERT/UPDATE/DELETE)
- Valores old/new como JSONB
- Timestamp y user_id
- clinic_id para aislamiento

---

## Heurísticas de Decisión

Cuando haya incertidumbre:
- Elegir la solución más simple que funcione
- Empujar lógica hacia la base de datos
- Evitar nuevas abstracciones
- Evitar "cleverness"
- Evitar "future-proofing"

**Regla de oro:** Si una feature no ayuda a un profesional a **almacenar, ver o actualizar datos de pacientes**, no pertenece al proyecto.

---

## Expectativas de Output

Al generar código:
- Sin placeholders ni pseudo-código
- Sin features especulativas
- TypeScript listo para producción
- Dependencias mínimas
- Estructura de carpetas clara

El sistema debe ser:
- Entendible en 6 meses
- Mantenible por un solo desarrollador
- Seguro para datos reales de pacientes

---

## Fuera de Alcance

**No implementar (rechazar si se solicita):**
- Diagnóstico asistido por AI
- Planes de alimentación automatizados
- Portal de pacientes
- Sistema de agendamiento/citas
- Notificaciones (email, push, SMS)
- Facturación/cobros
- Dashboards analíticos
- Integraciones externas (laboratorios, seguros)
- Recetas médicas
- Exportación de datos masiva
- Aplicaciones móviles

---

## Referencias

- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Patrones de React/Vite y seguridad
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Documentación técnica detallada
- [db/schema.sql](./db/schema.sql) - Schema completo de base de datos
