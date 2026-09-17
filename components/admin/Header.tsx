"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserRole } from "@/lib/getUserRole";

const supabase = createClient();

export default function Header() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email || "");
      setRole((await getUserRole()) || "");
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          MyHisarNews
        </h2>

        <p className="text-sm text-gray-500">
          Manage MyHisarNews platform
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right md:block">
          <p className="font-semibold text-gray-900">
            {role || "User"}
          </p>

          <p className="text-sm text-gray-500">
            {email || "Loading..."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}