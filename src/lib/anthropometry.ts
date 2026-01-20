import { supabase } from "./supabase";
import type { ActivityLevel, AnthropometricRecord, PatientSex } from "./types";

type AnthropometryPayload = {
  recorded_at: string;
  weight_kg: number | null;
  height_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  body_fat_pct: number | null;
  lean_mass_pct: number | null;
  arm_circumference_cm: number | null;
  observations: string | null;
};

const baseSelect =
  "id, clinic_id, patient_id, recorded_at, weight_kg, height_cm, waist_cm, hip_cm, body_fat_pct, lean_mass_pct, arm_circumference_cm, observations, is_active, created_at, updated_at, updated_by";

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

/**
 * Factores de actividad para calculo de REE
 */
export const activityFactors: Record<ActivityLevel, { factor: number; label: string }> = {
  sedentary: { factor: 1.2, label: "Sedentario" },
  light: { factor: 1.375, label: "Ligeramente activo" },
  moderate: { factor: 1.55, label: "Moderadamente activo" },
  active: { factor: 1.725, label: "Muy activo" },
  very_active: { factor: 1.9, label: "Extra activo" },
};

type TmbParams = {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: PatientSex;
};

/**
 * Calcula la Tasa Metabolica Basal (TMB) usando la formula de Mifflin-St Jeor
 * - Hombres: TMB = (10 x peso) + (6.25 x altura) - (5 x edad) + 5
 * - Mujeres: TMB = (10 x peso) + (6.25 x altura) - (5 x edad) - 161
 */
export function calculateTmb({ weightKg, heightCm, ageYears, sex }: TmbParams): number | null {
  if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) {
    return null;
  }

  const baseTmb = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);

  if (sex === "M") {
    return baseTmb + 5;
  }
  if (sex === "F") {
    return baseTmb - 161;
  }

  return null;
}

type ReeParams = TmbParams & {
  activityLevel: ActivityLevel;
};

/**
 * Calcula el Requerimiento Energetico Estimado (REE)
 * REE = TMB x factor_actividad
 */
export function calculateRee(params: ReeParams): number | null {
  const tmb = calculateTmb(params);
  if (tmb === null) {
    return null;
  }

  const factor = activityFactors[params.activityLevel]?.factor;
  if (!factor) {
    return null;
  }

  return tmb * factor;
}

/**
 * Calcula la edad en anos a partir de la fecha de nacimiento
 */
export function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) {
    return null;
  }

  const birth = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age > 0 ? age : null;
}
