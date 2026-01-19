import { supabase } from "./supabase";

let cachedClinicId: string | null = null;

export async function getCurrentClinicId() {
  if (cachedClinicId) {
    return cachedClinicId;
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("clinic_id")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (error || !data?.clinic_id) {
    return null;
  }

  cachedClinicId = data.clinic_id;
  return cachedClinicId;
}

export function clearClinicIdCache() {
  cachedClinicId = null;
}
