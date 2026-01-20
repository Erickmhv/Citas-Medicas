import { supabase } from "./supabase";
import type { ActivityLevel, Patient, PatientSex } from "./types";

type PatientInsert = {
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  sex: PatientSex | null;
  activity_level: ActivityLevel | null;
};

type PatientUpdate = {
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  sex: PatientSex | null;
  activity_level: ActivityLevel | null;
};

const baseSelect =
  "id, clinic_id, full_name, email, phone, date_of_birth, sex, activity_level, created_at, updated_at, updated_by, is_active";

type FetchPatientsParams = {
  query: string;
  page: number;
  pageSize: number;
};

function buildSearchFilter(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const search = `%${trimmed}%`;
  const conditions = [
    `full_name.ilike.${search}`,
    `email.ilike.${search}`,
    `phone.ilike.${search}`,
  ];
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(trimmed)) {
    conditions.push(`date_of_birth.eq.${trimmed}`);
  }
  return conditions.join(",");
}

export async function fetchPatients({ query, page, pageSize }: FetchPatientsParams) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const filter = buildSearchFilter(query);

  let request = supabase
    .from("patients")
    .select(baseSelect, { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filter) {
    request = request.or(filter);
  }

  const { data, error, count } = await request;

  if (error) {
    return { data: null, count: null, error: error.message };
  }

  return { data: (data ?? []) as Patient[], count: count ?? 0, error: null };
}

export async function searchPatients(query: string, limit: number) {
  const filter = buildSearchFilter(query);
  let request = supabase
    .from("patients")
    .select(baseSelect)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(0, limit - 1);

  if (filter) {
    request = request.or(filter);
  }

  const { data, error } = await request;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? []) as Patient[], error: null };
}

export async function fetchPatientById(id: string) {
  const { data, error } = await supabase
    .from("patients")
    .select(baseSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? null) as Patient | null, error: null };
}

export async function createPatient(payload: PatientInsert) {
  const { error } = await supabase.from("patients").insert(payload);
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function updatePatient(id: string, payload: PatientUpdate) {
  const { error } = await supabase.from("patients").update(payload).eq("id", id);
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function deactivatePatient(id: string) {
  const { error } = await supabase.from("patients").update({ is_active: false }).eq("id", id);
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
