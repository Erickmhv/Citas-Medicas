import { supabase } from "./supabase";
import type { LabResult, LabResultData } from "./types";

type LabResultPayload = {
  result_date: string;
  result_data: LabResultData | null;
  notes: string | null;
};

const baseSelect =
  "id, clinic_id, patient_id, result_date, result_data, notes, is_active, created_at, updated_at, updated_by";

export async function fetchLabResults(patientId: string) {
  const { data, error } = await supabase
    .from("lab_results")
    .select(baseSelect)
    .eq("patient_id", patientId)
    .eq("is_active", true)
    .order("result_date", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? []) as LabResult[], error: null };
}

export async function fetchLabResultById(id: string) {
  const { data, error } = await supabase
    .from("lab_results")
    .select(baseSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? null) as LabResult | null, error: null };
}

export async function createLabResult(patientId: string, payload: LabResultPayload) {
  const { error } = await supabase.from("lab_results").insert({
    patient_id: patientId,
    ...payload,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function updateLabResult(id: string, payload: LabResultPayload) {
  const { error } = await supabase
    .from("lab_results")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function deactivateLabResult(id: string) {
  const { error } = await supabase
    .from("lab_results")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Calcula el indice HOMA-IR (Homeostatic Model Assessment of Insulin Resistance)
 * Formula: (glucosa_ayunas * insulina) / 405
 * Donde glucosa esta en mg/dL e insulina en uUI/mL
 */
export function calculateHomaIr(glucosaAyunas: number | null, insulina: number | null): number | null {
  if (glucosaAyunas === null || insulina === null) {
    return null;
  }
  if (glucosaAyunas <= 0 || insulina <= 0) {
    return null;
  }
  return (glucosaAyunas * insulina) / 405;
}

/**
 * Definiciones de campos de laboratorio agrupados por categoria
 */
export const labFieldGroups = [
  {
    key: "glucosa",
    label: "Metabolismo de Glucosa",
    fields: [
      { key: "glucosa_ayunas", label: "Glucosa en ayunas", unit: "mg/dL" },
      { key: "hba1c", label: "HbA1c", unit: "%" },
      { key: "insulina", label: "Insulina", unit: "uUI/mL" },
    ],
  },
  {
    key: "lipidos",
    label: "Perfil Lipidico",
    fields: [
      { key: "colesterol_total", label: "Colesterol total", unit: "mg/dL" },
      { key: "hdl", label: "HDL", unit: "mg/dL" },
      { key: "ldl", label: "LDL", unit: "mg/dL" },
      { key: "trigliceridos", label: "Trigliceridos", unit: "mg/dL" },
    ],
  },
  {
    key: "hepatica",
    label: "Funcion Hepatica",
    fields: [
      { key: "tgp", label: "TGP (ALT)", unit: "U/L" },
      { key: "tgo", label: "TGO (AST)", unit: "U/L" },
    ],
  },
  {
    key: "tiroides",
    label: "Tiroides",
    fields: [
      { key: "tsh", label: "TSH", unit: "uUI/mL" },
      { key: "t3", label: "T3", unit: "ng/dL" },
      { key: "t4", label: "T4", unit: "ug/dL" },
    ],
  },
  {
    key: "vitaminas",
    label: "Vitaminas y Minerales",
    fields: [
      { key: "vitamina_d", label: "Vitamina D", unit: "ng/mL" },
      { key: "vitamina_b12", label: "Vitamina B12", unit: "pg/mL" },
      { key: "acido_folico", label: "Acido folico", unit: "ng/mL" },
      { key: "ferritina", label: "Ferritina", unit: "ng/mL" },
      { key: "hierro_serico", label: "Hierro serico", unit: "ug/dL" },
    ],
  },
  {
    key: "inflamacion",
    label: "Inflamacion",
    fields: [
      { key: "pcr", label: "PCR ultrasensible", unit: "mg/L" },
    ],
  },
] as const;
