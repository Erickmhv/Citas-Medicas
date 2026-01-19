import { supabase } from "./supabase";

export async function getCurrentClinicId() {
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

  return data.clinic_id;
}
