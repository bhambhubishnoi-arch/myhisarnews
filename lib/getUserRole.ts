import { createClient } from "@/lib/supabase/client";

export async function getUserRole() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("ROLE ERROR:", error.message);
    return null;
  }

  return data?.role?.trim() || null;
}
