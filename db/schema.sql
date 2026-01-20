-- Base schema for Citas Medicas (Supabase)
-- The database is the backend. RLS enforces clinic isolation.

create extension if not exists pgcrypto;

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  full_name text,
  role text not null default 'owner',
  created_at timestamptz not null default now()
);

create or replace function public.current_clinic_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select clinic_id from public.users where id = auth.uid();
$$;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null default public.current_clinic_id(),
  full_name text not null,
  email text,
  phone text,
  date_of_birth date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references auth.users(id)
);

alter table public.patients add column if not exists is_active boolean not null default true;
alter table public.patients add column if not exists updated_at timestamptz;
alter table public.patients add column if not exists updated_by uuid references auth.users(id);
alter table public.patients add column if not exists sex text check (sex in ('M', 'F') or sex is null);

create or replace function public.set_patient_audit_fields()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.updated_at := now();
    new.updated_by := auth.uid();
  elsif tg_op = 'UPDATE' then
    new.updated_at := now();
    new.updated_by := auth.uid();
  end if;
  return new;
end;
$$;

create or replace function public.set_common_audit_fields()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.updated_at := now();
    new.updated_by := auth.uid();
  elsif tg_op = 'UPDATE' then
    new.updated_at := now();
    new.updated_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists patients_set_audit_fields on public.patients;
create trigger patients_set_audit_fields
before insert or update on public.patients
for each row
execute function public.set_patient_audit_fields();

drop trigger if exists clinical_history_set_audit_fields on public.clinical_history;
create trigger clinical_history_set_audit_fields
before insert or update on public.clinical_history
for each row
execute function public.set_common_audit_fields();

drop trigger if exists consultations_set_audit_fields on public.consultations;
create trigger consultations_set_audit_fields
before insert or update on public.consultations
for each row
execute function public.set_common_audit_fields();

drop trigger if exists anthropometric_records_set_audit_fields on public.anthropometric_records;
create trigger anthropometric_records_set_audit_fields
before insert or update on public.anthropometric_records
for each row
execute function public.set_common_audit_fields();

drop trigger if exists files_set_audit_fields on public.files;
create trigger files_set_audit_fields
before insert or update on public.files
for each row
execute function public.set_common_audit_fields();

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null,
  table_name text not null,
  record_id uuid not null,
  action text not null,
  changed_by uuid,
  changed_at timestamptz not null default now(),
  changes jsonb
);

create index if not exists audit_logs_clinic_id_idx on public.audit_logs (clinic_id);
create index if not exists audit_logs_table_record_idx on public.audit_logs (table_name, record_id);

create or replace function public.log_patient_audit()
returns trigger
language plpgsql
as $$
declare
  audit_changes jsonb;
  clinic uuid;
  record_uuid uuid;
begin
  if tg_op = 'INSERT' then
    audit_changes := jsonb_build_object('new', to_jsonb(new));
    clinic := new.clinic_id;
    record_uuid := new.id;
  elsif tg_op = 'UPDATE' then
    audit_changes := jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new));
    clinic := new.clinic_id;
    record_uuid := new.id;
  else
    audit_changes := jsonb_build_object('old', to_jsonb(old));
    clinic := old.clinic_id;
    record_uuid := old.id;
  end if;

  insert into public.audit_logs (clinic_id, table_name, record_id, action, changed_by, changes)
  values (clinic, tg_table_name, record_uuid, tg_op, auth.uid(), audit_changes);

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists patients_audit on public.patients;
create trigger patients_audit
after insert or update or delete on public.patients
for each row
execute function public.log_patient_audit();

create table if not exists public.clinical_history (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null default public.current_clinic_id(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  notes text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references auth.users(id)
);

alter table public.clinical_history add column if not exists is_active boolean not null default true;
alter table public.clinical_history add column if not exists updated_at timestamptz;
alter table public.clinical_history add column if not exists updated_by uuid references auth.users(id);

create table if not exists public.anthropometric_records (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null default public.current_clinic_id(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  recorded_at date not null default current_date,
  weight_kg numeric,
  height_cm numeric,
  waist_cm numeric,
  hip_cm numeric,
  -- Los calculos derivados se hacen en el frontend, no se almacenan aqui.
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references auth.users(id)
);

alter table public.anthropometric_records add column if not exists is_active boolean not null default true;
alter table public.anthropometric_records add column if not exists updated_at timestamptz;
alter table public.anthropometric_records add column if not exists updated_by uuid references auth.users(id);
alter table public.anthropometric_records add column if not exists body_fat_pct numeric;
alter table public.anthropometric_records add column if not exists lean_mass_pct numeric;
alter table public.anthropometric_records add column if not exists arm_circumference_cm numeric;
alter table public.anthropometric_records add column if not exists observations text;

create table if not exists public.lab_results (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null default public.current_clinic_id(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  result_date date not null default current_date,
  result_data jsonb,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references auth.users(id)
);

alter table public.lab_results add column if not exists is_active boolean not null default true;
alter table public.lab_results add column if not exists updated_at timestamptz;
alter table public.lab_results add column if not exists updated_by uuid references auth.users(id);

drop trigger if exists lab_results_set_audit_fields on public.lab_results;
create trigger lab_results_set_audit_fields
before insert or update on public.lab_results
for each row
execute function public.set_common_audit_fields();

drop trigger if exists lab_results_audit on public.lab_results;
create trigger lab_results_audit
after insert or update or delete on public.lab_results
for each row
execute function public.log_patient_audit();

create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null default public.current_clinic_id(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  consultation_date date not null default current_date,
  observations text,
  plan_summary text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references auth.users(id)
);

alter table public.consultations add column if not exists is_active boolean not null default true;
alter table public.consultations add column if not exists updated_at timestamptz;
alter table public.consultations add column if not exists updated_by uuid references auth.users(id);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null default public.current_clinic_id(),
  patient_id uuid references public.patients(id) on delete set null,
  file_name text not null,
  file_path text not null,
  description text,
  is_lab boolean not null default false,
  is_active boolean not null default true,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references auth.users(id)
);

alter table public.files add column if not exists description text;
alter table public.files add column if not exists is_lab boolean not null default false;
alter table public.files add column if not exists is_active boolean not null default true;
alter table public.files add column if not exists updated_at timestamptz;
alter table public.files add column if not exists updated_by uuid references auth.users(id);

create index if not exists patients_clinic_id_idx on public.patients (clinic_id);
create index if not exists patients_full_name_idx on public.patients (full_name);
create index if not exists patients_active_idx on public.patients (is_active);
create index if not exists clinical_history_patient_id_idx on public.clinical_history (patient_id);
create index if not exists clinical_history_active_idx on public.clinical_history (is_active);
create index if not exists anthropometric_records_patient_id_idx on public.anthropometric_records (patient_id);
create index if not exists anthropometric_records_active_idx on public.anthropometric_records (is_active);
create index if not exists lab_results_patient_id_idx on public.lab_results (patient_id);
create index if not exists consultations_patient_id_idx on public.consultations (patient_id);
create index if not exists consultations_active_idx on public.consultations (is_active);
create index if not exists files_patient_id_idx on public.files (patient_id);
create index if not exists files_active_idx on public.files (is_active);
create index if not exists files_is_lab_idx on public.files (is_lab);

alter table public.clinics enable row level security;
alter table public.users enable row level security;
alter table public.patients enable row level security;
alter table public.audit_logs enable row level security;
alter table public.clinical_history enable row level security;
alter table public.anthropometric_records enable row level security;
alter table public.lab_results enable row level security;
alter table public.consultations enable row level security;
alter table public.files enable row level security;

drop policy if exists "clinics_select" on public.clinics;
create policy "clinics_select" on public.clinics
  for select
  using (exists (
    select 1 from public.users u where u.clinic_id = clinics.id and u.id = auth.uid()
  ));

drop policy if exists "clinics_insert" on public.clinics;
create policy "clinics_insert" on public.clinics
  for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "clinics_update" on public.clinics;
create policy "clinics_update" on public.clinics
  for update
  using (exists (
    select 1 from public.users u where u.clinic_id = clinics.id and u.id = auth.uid()
  ));

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select
  using (id = auth.uid());

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own" on public.users
  for insert
  with check (id = auth.uid());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update
  using (id = auth.uid());

drop policy if exists "patients_select" on public.patients;
create policy "patients_select" on public.patients
  for select
  using (clinic_id = public.current_clinic_id());

drop policy if exists "patients_insert" on public.patients;
create policy "patients_insert" on public.patients
  for insert
  with check (clinic_id = public.current_clinic_id());

drop policy if exists "patients_update" on public.patients;
create policy "patients_update" on public.patients
  for update
  using (clinic_id = public.current_clinic_id())
  with check (clinic_id = public.current_clinic_id());

drop policy if exists "patients_delete" on public.patients;
create policy "patients_delete" on public.patients
  for delete
  using (clinic_id = public.current_clinic_id());

drop policy if exists "audit_logs_select" on public.audit_logs;
create policy "audit_logs_select" on public.audit_logs
  for select
  using (clinic_id = public.current_clinic_id());

drop policy if exists "audit_logs_insert" on public.audit_logs;
create policy "audit_logs_insert" on public.audit_logs
  for insert
  with check (clinic_id = public.current_clinic_id());

drop policy if exists "clinical_history_select" on public.clinical_history;
create policy "clinical_history_select" on public.clinical_history
  for select
  using (clinic_id = public.current_clinic_id());

drop policy if exists "clinical_history_insert" on public.clinical_history;
create policy "clinical_history_insert" on public.clinical_history
  for insert
  with check (clinic_id = public.current_clinic_id());

drop policy if exists "clinical_history_update" on public.clinical_history;
create policy "clinical_history_update" on public.clinical_history
  for update
  using (clinic_id = public.current_clinic_id())
  with check (clinic_id = public.current_clinic_id());

drop policy if exists "clinical_history_delete" on public.clinical_history;
create policy "clinical_history_delete" on public.clinical_history
  for delete
  using (clinic_id = public.current_clinic_id());

drop policy if exists "anthropometric_records_select" on public.anthropometric_records;
create policy "anthropometric_records_select" on public.anthropometric_records
  for select
  using (clinic_id = public.current_clinic_id());

drop policy if exists "anthropometric_records_insert" on public.anthropometric_records;
create policy "anthropometric_records_insert" on public.anthropometric_records
  for insert
  with check (clinic_id = public.current_clinic_id());

drop policy if exists "anthropometric_records_update" on public.anthropometric_records;
create policy "anthropometric_records_update" on public.anthropometric_records
  for update
  using (clinic_id = public.current_clinic_id())
  with check (clinic_id = public.current_clinic_id());

drop policy if exists "anthropometric_records_delete" on public.anthropometric_records;
create policy "anthropometric_records_delete" on public.anthropometric_records
  for delete
  using (clinic_id = public.current_clinic_id());

drop policy if exists "lab_results_select" on public.lab_results;
create policy "lab_results_select" on public.lab_results
  for select
  using (clinic_id = public.current_clinic_id());

drop policy if exists "lab_results_insert" on public.lab_results;
create policy "lab_results_insert" on public.lab_results
  for insert
  with check (clinic_id = public.current_clinic_id());

drop policy if exists "lab_results_update" on public.lab_results;
create policy "lab_results_update" on public.lab_results
  for update
  using (clinic_id = public.current_clinic_id());

drop policy if exists "lab_results_delete" on public.lab_results;
create policy "lab_results_delete" on public.lab_results
  for delete
  using (clinic_id = public.current_clinic_id());

drop policy if exists "consultations_select" on public.consultations;
create policy "consultations_select" on public.consultations
  for select
  using (clinic_id = public.current_clinic_id());

drop policy if exists "consultations_insert" on public.consultations;
create policy "consultations_insert" on public.consultations
  for insert
  with check (clinic_id = public.current_clinic_id());

drop policy if exists "consultations_update" on public.consultations;
create policy "consultations_update" on public.consultations
  for update
  using (clinic_id = public.current_clinic_id())
  with check (clinic_id = public.current_clinic_id());

drop policy if exists "consultations_delete" on public.consultations;
create policy "consultations_delete" on public.consultations
  for delete
  using (clinic_id = public.current_clinic_id());

drop policy if exists "files_select" on public.files;
create policy "files_select" on public.files
  for select
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.clinic_id = files.clinic_id
  ));

drop policy if exists "files_insert" on public.files;
create policy "files_insert" on public.files
  for insert
  with check (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.clinic_id = files.clinic_id
  ));

drop policy if exists "files_update" on public.files;
create policy "files_update" on public.files
  for update
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.clinic_id = files.clinic_id
  ))
  with check (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.clinic_id = files.clinic_id
  ));

drop policy if exists "files_delete" on public.files;
create policy "files_delete" on public.files
  for delete
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.clinic_id = files.clinic_id
  ));

-- Storage policies for patient files
drop policy if exists "patient_files_select" on storage.objects;
create policy "patient_files_select" on storage.objects
  for select
  to authenticated
  using (bucket_id = 'patient-files');

drop policy if exists "patient_files_insert" on storage.objects;
create policy "patient_files_insert" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'patient-files');

drop policy if exists "patient_files_update" on storage.objects;
create policy "patient_files_update" on storage.objects
  for update
  to authenticated
  using (bucket_id = 'patient-files')
  with check (bucket_id = 'patient-files');

drop policy if exists "patient_files_delete" on storage.objects;
create policy "patient_files_delete" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'patient-files');

-- Ejemplo manual para un usuario nuevo (ejecutar en SQL editor):
-- insert into public.clinics (name) values ('Clinica Demo') returning id;
-- insert into public.users (id, clinic_id, full_name)
-- values (auth.uid(), '<clinic_id>', 'Nombre Profesional');
