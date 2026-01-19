# Citas Medicas SPA

SPA simple, renderizada en el cliente, para flujos de clinica. La base de datos es el backend. No hay servidores personalizados.

## Stack
- React + TypeScript (Vite)
- Supabase Auth + Postgres + Storage

## Configuracion local
1. Crea un proyecto en Supabase.
2. Agrega las variables de entorno:

```bash
cp .env.example .env
```

3. Instala dependencias y levanta el servidor:

```bash
npm install
npm run dev
```

## Variables de entorno
Crea `.env` con:

```
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## Base de datos
Todo esta aislado por `clinic_id` usando Row Level Security. El frontend asume:
- Existe la tabla `patients`.
- `clinic_id` se rellena desde la base de datos (trigger o default segun el usuario autenticado).
- Los pacientes, historia clinica y consultas se desactivan con `is_active = false` y no se listan.
- Se registra auditoria de cambios en `audit_logs` (pacientes).
- Los calculos de antropometria se realizan en el frontend y no se guardan.

Script unico de base de datos:
- `db/schema.sql`

## Archivos
- Crea un bucket privado en Supabase Storage llamado `patient-files`.
- Los archivos se registran en `public.files` con marca de laboratorio y fecha de subida.

## Reglas del proyecto
- Esto es una SPA.
- La base de datos es el backend.
- No crear servidores.
- No abusar de Edge Functions.
- Mantenerlo simple.
- Si hay mas de una forma de resolver algo, se confirma contigo antes de avanzar.

## Busqueda y rendimiento
- Pacientes: busqueda en vivo por nombre, correo o telefono.
- Se muestran 25 pacientes por pagina (paginacion).
- Historia clinica y consultas usan un selector con busqueda en vivo (typeahead).
- El listado inicial muestra los ultimos 25 pacientes activos.
