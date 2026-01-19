import { supabase } from "./supabase";
import type { Consultation } from "./types";

const baseSelect =
  "id, clinic_id, patient_id, consultation_date, observations, plan_summary, is_active, created_at, updated_at, updated_by";

export async function fetchConsultations(patientId: string) {
  const { data, error } = await supabase
    .from("consultations")
    .select(baseSelect)
    .eq("patient_id", patientId)
    .eq("is_active", true)
    .order("consultation_date", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? []) as Consultation[], error: null };
}

export async function createConsultation(payload: {
  patient_id: string;
  consultation_date: string;
  observations: string | null;
  plan_summary: string | null;
}) {
  const { error } = await supabase.from("consultations").insert(payload);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function updateConsultation(
  id: string,
  payload: {
    consultation_date: string;
    observations: string | null;
    plan_summary: string | null;
  }
) {
  const { error } = await supabase.from("consultations").update(payload).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function deactivateConsultation(id: string) {
  const { error } = await supabase.from("consultations").update({ is_active: false }).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
