export type PatientSex = 'M' | 'F';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type Patient = {
  id: string;
  clinic_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  sex: PatientSex | null;
  activity_level: ActivityLevel | null;
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
  is_active: boolean;
};

export type UserProfile = {
  id: string;
  clinic_id: string;
  full_name: string | null;
};

export type ClinicalHistoryEntry = {
  id: string;
  clinic_id: string;
  patient_id: string;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
};

export type Consultation = {
  id: string;
  clinic_id: string;
  patient_id: string;
  consultation_date: string;
  observations: string | null;
  plan_summary: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
};

export type AnthropometricRecord = {
  id: string;
  clinic_id: string;
  patient_id: string;
  recorded_at: string;
  weight_kg: number | null;
  height_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  body_fat_pct: number | null;
  lean_mass_pct: number | null;
  arm_circumference_cm: number | null;
  observations: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
};

export type PatientFile = {
  id: string;
  clinic_id: string;
  patient_id: string | null;
  file_name: string;
  file_path: string;
  description: string | null;
  is_lab: boolean;
  is_active: boolean;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
};

export interface LabResultData {
  // Metabolismo de glucosa
  glucosa_ayunas?: number | null;
  hba1c?: number | null;
  insulina?: number | null;
  // Perfil lipidico
  colesterol_total?: number | null;
  hdl?: number | null;
  ldl?: number | null;
  trigliceridos?: number | null;
  // Funcion hepatica
  tgp?: number | null;
  tgo?: number | null;
  // Tiroides
  tsh?: number | null;
  t3?: number | null;
  t4?: number | null;
  // Vitaminas y minerales
  vitamina_d?: number | null;
  vitamina_b12?: number | null;
  acido_folico?: number | null;
  ferritina?: number | null;
  hierro_serico?: number | null;
  // Inflamacion
  pcr?: number | null;
}

export type LabResult = {
  id: string;
  clinic_id: string;
  patient_id: string;
  result_date: string;
  result_data: LabResultData | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
};
