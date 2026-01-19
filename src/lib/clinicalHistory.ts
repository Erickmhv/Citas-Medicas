import { supabase } from "./supabase";
import type { ClinicalHistoryEntry } from "./types";

const baseSelect =
  "id, clinic_id, patient_id, notes, is_active, created_at, updated_at, updated_by";

export async function fetchClinicalHistory(patientId: string) {
  const { data, error } = await supabase
    .from("clinical_history")
    .select(baseSelect)
    .eq("patient_id", patientId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? []) as ClinicalHistoryEntry[], error: null };
}

export async function createClinicalHistory(patientId: string, notes: string) {
  const { error } = await supabase.from("clinical_history").insert({
    patient_id: patientId,
    notes,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function updateClinicalHistory(id: string, notes: string) {
  const { error } = await supabase.from("clinical_history").update({ notes }).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function deactivateClinicalHistory(id: string) {
  const { error } = await supabase.from("clinical_history").update({ is_active: false }).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
