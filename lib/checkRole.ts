import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";

export async function checkRole(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("email", user.email)
    .maybeSingle();

  if (error) {
    console.error("CHECK ROLE ERROR:", error.message);
    return null;
  }

  const role = data?.role?.trim();

  if (
    role !== "Admin" &&
    role !== "Editor" &&
    role !== "Reporter"
  ) {
    return null;
  }

  return role;
}
