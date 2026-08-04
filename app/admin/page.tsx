"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      setUserEmail(user.email || "");
      setChecking(false);
    }

    checkUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading Admin Panel...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              MyHisarNews
            </h1>

            <p className="text-sm text-gray-500">
              Admin Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Logout
          </button>

        </div>
      </header>

      {/* Dashboard */}
      <section className="mx-auto max-w-7xl px-6 py-8">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, Admin 👋
          </h2>

          <p className="mt-2 text-gray-600">
            {userEmail}
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">

          <button
            onClick={() => router.push("/admin/articles/new")}
            className="rounded-xl bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 text-4xl">📰</div>

            <h3 className="text-xl font-bold">
              New Article
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              नई खबर publish करें
            </p>
          </button>

          <button
            onClick={() => router.push("/admin/articles")}
            className="rounded-xl bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 text-4xl">📋</div>

            <h3 className="text-xl font-bold">
              All Articles
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              सभी खबरें देखें और manage करें
            </p>
          </button>

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <div className="mb-4 text-4xl">⚙️</div>

            <h3 className="text-xl font-bold">
              Website
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              MyHisarNews Management
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}