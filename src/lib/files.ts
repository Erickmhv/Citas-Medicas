import { supabase } from "./supabase";
import type { PatientFile } from "./types";
import { getCurrentClinicId } from "./profile";

const baseSelect =
  "id, clinic_id, patient_id, file_name, file_path, description, is_lab, is_active, mime_type, size_bytes, created_at, updated_at, updated_by";

const bucketName = "patient-files";

function sanitizeFileName(name: string) {
  return name.replace(/\s+/g, "-");
}

type UploadPayload = {
  patientId: string;
  file: File;
  isLab: boolean;
  description: string | null;
};

export async function fetchPatientFiles(patientId: string) {
  const { data, error } = await supabase
    .from("files")
    .select(baseSelect)
    .eq("patient_id", patientId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? []) as PatientFile[], error: null };
}

export async function uploadPatientFile({ patientId, file, isLab, description }: UploadPayload) {
  const clinicId = await getCurrentClinicId();
  if (!clinicId) {
    return { error: "No se pudo obtener la clinica del usuario." };
  }

  const safeName = sanitizeFileName(file.name);
  const filePath = `${patientId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { error: insertError } = await supabase.from("files").insert({
    clinic_id: clinicId,
    patient_id: patientId,
    file_name: file.name,
    file_path: filePath,
    description,
    mime_type: file.type || null,
    size_bytes: file.size || null,
    is_lab: isLab,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  return { error: null };
}

export async function updateFileMeta(
  id: string,
  payload: { file_name: string; is_lab: boolean; description: string | null }
) {
  const { error } = await supabase.from("files").update(payload).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function deactivateFile(id: string) {
  const { error } = await supabase.from("files").update({ is_active: false }).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function getFileDownloadUrl(filePath: string) {
  const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(filePath, 60);

  if (error || !data) {
    return { url: null, error: error?.message ?? "No se pudo generar el enlace." };
  }

  return { url: data.signedUrl, error: null };
}
