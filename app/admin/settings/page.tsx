"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const supabase = createClient();

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [siteName, setSiteName] = useState("MyHisarNews");
  const [siteDescription, setSiteDescription] = useState(
    "Hisar की हर खबर सबसे पहले"
  );

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      setEmail(user.email || "");

      const savedSiteName = localStorage.getItem(
        "myhisarnews_site_name"
      );

      const savedSiteDescription = localStorage.getItem(
        "myhisarnews_site_description"
      );

      if (savedSiteName) {
        setSiteName(savedSiteName);
      }

      if (savedSiteDescription) {
        setSiteDescription(savedSiteDescription);
      }

      setLoading(false);
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      localStorage.setItem(
        "myhisarnews_site_name",
        siteName
      );

      localStorage.setItem(
        "myhisarnews_site_description",
        siteDescription
      );

      setMessage(
        "Settings successfully save हो गईं ✅"
      );
    } catch (err) {
      console.error("SETTINGS SAVE ERROR:", err);
      setError("Settings save नहीं हो पाईं ❌");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    const { error: logoutError } =
      await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50 p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          Loading settings...
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Settings ⚙️
          </h1>

          <p className="mt-1 text-gray-500">
            MyHisarNews की basic settings manage करें।
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-lg border bg-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-50"
        >
          ← Dashboard
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-xl bg-green-100 p-4 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Site Settings */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Website Settings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Website की basic information.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Website Name
              </label>

              <input
                value={siteName}
                onChange={(e) =>
                  setSiteName(e.target.value)
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-red-500"
                placeholder="MyHisarNews"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Website Description
              </label>

              <textarea
                value={siteDescription}
                onChange={(e) =>
                  setSiteDescription(e.target.value)
                }
                rows={4}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-red-500"
                placeholder="Website description"
              />
            </div>

            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Settings"}
            </button>
          </div>
        </div>

        {/* Account Settings */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Admin Account
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current logged-in account.
          </p>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold">
              Email
            </label>

            <input
              value={email}
              disabled
              className="w-full rounded-lg border bg-gray-100 px-4 py-3 text-gray-600"
            />
          </div>

          <div className="mt-6 rounded-xl bg-gray-50 p-5">
            <p className="text-sm text-gray-500">
              Account Security
            </p>

            <p className="mt-2 text-sm">
              आपका account Supabase authentication
              से protected है।
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-6 rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Future Settings */}

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">
          More Settings
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-5">
            <div className="text-2xl">🔔</div>

            <h3 className="mt-3 font-semibold">
              Notifications
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Future notification controls.
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <div className="text-2xl">🌐</div>

            <h3 className="mt-3 font-semibold">
              Social Media
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Facebook, Instagram और YouTube.
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <div className="text-2xl">🔍</div>

            <h3 className="mt-3 font-semibold">
              SEO
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              SEO और Google settings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}