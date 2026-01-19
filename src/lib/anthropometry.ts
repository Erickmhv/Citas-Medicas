import { supabase } from "./supabase";
import type { AnthropometricRecord } from "./types";

type AnthropometryPayload = {
  recorded_at: string;
  weight_kg: number | null;
  height_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
};

const baseSelect =
  "id, clinic_id, patient_id, recorded_at, weight_kg, height_cm, waist_cm, hip_cm, is_active, created_at, updated_at, updated_by";

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
    unit: "kg/m2",
    calculate: (record) => {
      if (!record.weight_kg || !record.height_cm) return null;
      if (record.height_cm === 0) return null;
      return record.weight_kg / Math.pow(record.height_cm / 100, 2);
    },
  },
  {
    key: "waist_hip_ratio",
    label: "Relacion cintura/cadera",
    unit: "",
    calculate: (record) => {
      if (!record.waist_cm || !record.hip_cm) return null;
      if (record.hip_cm === 0) return null;
      return record.waist_cm / record.hip_cm;
    },
  },
  {
    key: "waist_height_ratio",
    label: "Relacion cintura/altura",
    unit: "",
    calculate: (record) => {
      if (!record.waist_cm || !record.height_cm) return null;
      if (record.height_cm === 0) return null;
      return record.waist_cm / record.height_cm;
    },
  },
];

export function calculateAnthropometry(record: AnthropometryPayload) {
  return formulas.map((formula) => {
    const value = formula.calculate(record);
    return {
      key: formula.key,
      label: formula.label,
      unit: formula.unit,
      value,
    };
  });
}

export async function fetchAnthropometry(patientId: string) {
  const { data, error } = await supabase
    .from("anthropometric_records")
    .select(baseSelect)
    .eq("patient_id", patientId)
    .eq("is_active", true)
    .order("recorded_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? []) as AnthropometricRecord[], error: null };
}

export async function createAnthropometry(patientId: string, payload: AnthropometryPayload) {
  const { error } = await supabase.from("anthropometric_records").insert({
    patient_id: patientId,
    ...payload,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function updateAnthropometry(id: string, payload: AnthropometryPayload) {
  const { error } = await supabase
    .from("anthropometric_records")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function deactivateAnthropometry(id: string) {
  const { error } = await supabase
    .from("anthropometric_records")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
