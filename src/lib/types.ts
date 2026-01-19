export type Patient = {
  id: string;
  clinic_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
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
