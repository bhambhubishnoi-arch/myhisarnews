"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Advertisement = {
  id: number;
  sponsor_name: string;
  title: string | null;
  image_url: string;
  target_url: string | null;
  position: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  priority: number;
};

const positions = [
  { value: "homepage_top", label: "Homepage Top" },
  { value: "homepage_middle", label: "Homepage Middle" },
  { value: "homepage_bottom", label: "Homepage Bottom" },
  { value: "article_top", label: "Article Top" },
  { value: "article_middle", label: "Article Middle" },
  { value: "article_bottom", label: "Article Bottom" },
  { value: "sidebar", label: "Sidebar" },
];

export default function AdvertisementsPage() {
  const router = useRouter();

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [sponsorName, setSponsorName] = useState("");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [position, setPosition] = useState("homepage_top");
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("0");

  useEffect(() => {
    loadAds();
  }, []);

  async function loadAds() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setAds(data || []);
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setSponsorName("");
    setTitle("");
    setImageUrl("");
    setTargetUrl("");
    setPosition("homepage_top");
    setIsActive(true);
    setStartDate("");
    setEndDate("");
    setPriority("0");
    setError("");
  }

  function editAd(ad: Advertisement) {
    setEditingId(ad.id);
    setSponsorName(ad.sponsor_name);
    setTitle(ad.title || "");
    setImageUrl(ad.image_url);
    setTargetUrl(ad.target_url || "");
    setPosition(ad.position);
    setIsActive(ad.is_active);

    setStartDate(
      ad.start_date
        ? new Date(ad.start_date).toISOString().slice(0, 16)
        : ""
    );

    setEndDate(
      ad.end_date
        ? new Date(ad.end_date).toISOString().slice(0, 16)
        : ""
    );

    setPriority(String(ad.priority || 0));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveAd() {
    setError("");

    if (!sponsorName.trim()) {
      setError("Sponsor Name डालना जरूरी है।");
      return;
    }

    if (!imageUrl.trim()) {
      setError("Image URL डालना जरूरी है।");
      return;
    }

    setSaving(true);

    const payload = {
      sponsor_name: sponsorName.trim(),
      title: title.trim() || null,
      image_url: imageUrl.trim(),
      target_url: targetUrl.trim() || null,
      position,
      is_active: isActive,
      start_date: startDate
        ? new Date(startDate).toISOString()
        : null,
      end_date: endDate
        ? new Date(endDate).toISOString()
        : null,
      priority: Number(priority) || 0,
    };

    let result;

    if (editingId !== null) {
      result = await supabase
        .from("advertisements")
        .update(payload)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("advertisements")
        .insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    resetForm();
    await loadAds();

    setSaving(false);
  }

  async function deleteAd(id: number) {
    const confirmed = window.confirm(
      "क्या आप यह advertisement delete करना चाहते हैं?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("advertisements")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setAds((current) =>
      current.filter((ad) => ad.id !== id)
    );
  }

  async function toggleActive(ad: Advertisement) {
    const { error } = await supabase
      .from("advertisements")
      .update({
        is_active: !ad.is_active,
      })
      .eq("id", ad.id);

    if (error) {
      alert(error.message);
      return;
    }

    setAds((current) =>
      current.map((item) =>
        item.id === ad.id
          ? {
              ...item,
              is_active: !item.is_active,
            }
          : item
      )
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold">
              Advertisements
            </h1>

            <p className="text-sm text-gray-500">
              Sponsor & Advertisement Management
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            ← Dashboard
          </button>

        </div>

      </header>


      <section className="mx-auto max-w-7xl px-6 py-8">

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold">
                {editingId !== null
                  ? "Edit Advertisement"
                  : "Add Advertisement"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Sponsor का banner और placement सेट करें।
              </p>

            </div>

            {editingId !== null && (
              <button
                onClick={resetForm}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel Edit
              </button>
            )}

          </div>


          {error && (
            <div className="mb-5 rounded-lg bg-red-100 p-4 text-sm text-red-700">
              {error}
            </div>
          )}


          <div className="grid gap-5 md:grid-cols-2">


            <div>

              <label className="mb-2 block text-sm font-semibold">
                Sponsor Name *
              </label>

              <input
                value={sponsorName}
                onChange={(e) =>
                  setSponsorName(e.target.value)
                }
                placeholder="Example: ABC Hospital"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-red-500"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold">
                Advertisement Title
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Example: Best Hospital in Hisar"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-red-500"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold">
                Advertisement Image URL *
              </label>

              <input
                value={imageUrl}
                onChange={(e) =>
                  setImageUrl(e.target.value)
                }
                placeholder="https://example.com/banner.jpg"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-red-500"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold">
                Click URL
              </label>

              <input
                value={targetUrl}
                onChange={(e) =>
                  setTargetUrl(e.target.value)
                }
                placeholder="https://example.com"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-red-500"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold">
                Advertisement Position
              </label>

              <select
                value={position}
                onChange={(e) =>
                  setPosition(e.target.value)
                }
                className="w-full rounded-lg border px-4 py-3"
              >

                {positions.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}

              </select>

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold">
                Priority
              </label>

              <input
                type="number"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value)
                }
                className="w-full rounded-lg border px-4 py-3"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold">
                Start Date
              </label>

              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                className="w-full rounded-lg border px-4 py-3"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold">
                End Date
              </label>

              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                className="w-full rounded-lg border px-4 py-3"
              />

            </div>

          </div>


          <div className="mt-5 flex items-center gap-3">

            <input
              id="advertisement-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) =>
                setIsActive(e.target.checked)
              }
              className="h-4 w-4"
            />

            <label
              htmlFor="advertisement-active"
              className="text-sm font-semibold"
            >
              Advertisement Active
            </label>

          </div>


          <div className="mt-6 flex gap-3">

            <button
              onClick={saveAd}
              disabled={saving}
              className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                ? "Update Advertisement"
                : "Add Advertisement"}
            </button>

            <button
              onClick={resetForm}
              className="rounded-lg border px-6 py-3 font-semibold hover:bg-gray-50"
            >
              Clear
            </button>

          </div>

        </div>


        <div className="rounded-2xl bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <h2 className="text-xl font-bold">
              All Advertisements
            </h2>

          </div>


          {loading ? (

            <div className="p-8 text-center text-gray-500">
              Loading advertisements...
            </div>

          ) : ads.length === 0 ? (

            <div className="p-8 text-center text-gray-500">
              अभी कोई advertisement नहीं है।
            </div>

          ) : (

            <div className="divide-y">

              {ads.map((ad) => (

                <div
                  key={ad.id}
                  className="p-6"
                >

                  <div className="flex flex-col gap-5 md:flex-row">


                    <div className="shrink-0">

                      <img
                        src={ad.image_url}
                        alt={
                          ad.title ||
                          ad.sponsor_name
                        }
                        className="h-28 w-48 rounded-lg border object-cover"
                      />

                    </div>


                    <div className="min-w-0 flex-1">


                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-lg font-bold">
                          {ad.sponsor_name}
                        </h3>

                        <span
                          className={
                            ad.is_active
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                              : "rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                          }
                        >
                          {ad.is_active
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>

                      </div>


                      {ad.title && (
                        <p className="mt-1 text-sm text-gray-600">
                          {ad.title}
                        </p>
                      )}


                      <div className="mt-3 flex flex-wrap gap-2">

                        <span className="rounded bg-gray-100 px-3 py-1 text-xs">
                          📍 {ad.position}
                        </span>

                        <span className="rounded bg-gray-100 px-3 py-1 text-xs">
                          ⭐ Priority: {ad.priority}
                        </span>

                      </div>


                      <div className="mt-4 flex flex-wrap gap-2">

                        <button
                          onClick={() =>
                            toggleActive(ad)
                          }
                          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          {ad.is_active
                            ? "Disable"
                            : "Enable"}
                        </button>


                        <button
                          onClick={() =>
                            editAd(ad)
                          }
                          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          ✏️ Edit
                        </button>


                        <button
                          onClick={() =>
                            deleteAd(ad.id)
                          }
                          className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                        >
                          🗑️ Delete
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>
  );
}

