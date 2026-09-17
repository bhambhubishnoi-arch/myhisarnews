"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [category, setCategory] = useState("हिसार");
  const [author, setAuthor] = useState("MyHisarNews");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("published");
  const [body, setBody] = useState("");
  const [originalPublishedAt, setOriginalPublishedAt] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // LOAD ARTICLE
  // =========================

  useEffect(() => {
    async function loadArticle() {
      const id = params.id;

      if (!id) {
        setMessage("Article ID missing.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("LOAD ARTICLE ERROR:", error);

        setMessage(`Error loading article: ${error.message}`);

        setLoading(false);
        return;
      }

      if (!data) {
        console.error("ARTICLE NOT FOUND:", id);

        setMessage("Article not found.");
        setLoading(false);
        return;
      }

      setTitle(data.title || "");
      setSlug(data.slug || "");
      setSummary(data.summary || "");
      setHeroImage(data.hero_image || "");
      setCategory(data.category || "हिसार");
      setAuthor(data.author || "MyHisarNews");
      setTags(data.tags || "");
      setStatus(data.status || "published");
      setBody(data.body || "");
      setOriginalPublishedAt(data.published_at || null);

      setLoading(false);
    }

    void loadArticle();
  }, [params.id]);

  // =========================
  // UPDATE ARTICLE
  // =========================

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const id = params.id;

    if (!id) {
      setMessage("Article ID missing.");
      setSaving(false);
      return;
    }

    const updateData = {
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim(),
      hero_image: heroImage.trim(),
      body: body.trim(),
      category,
      author: author.trim(),
      tags: tags.trim(),
      status,
      published_at:
        status === "published"
          ? originalPublishedAt || new Date().toISOString()
          : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("articles")
      .update(updateData)
      .eq("id", id);

    // =========================
    // UPDATE ERROR
    // =========================

    if (error) {
      console.error(
        "UPDATE ARTICLE ERROR MESSAGE:",
        error.message
      );

      console.error(
        "UPDATE ARTICLE ERROR DETAILS:",
        error.details
      );

      console.error(
        "UPDATE ARTICLE ERROR HINT:",
        error.hint
      );

      console.error(
        "UPDATE ARTICLE ERROR CODE:",
        error.code
      );

      console.error(
        "UPDATE ARTICLE ERROR JSON:",
        JSON.stringify(error, null, 2)
      );

      setMessage(
        `Update failed: ${
          error.message || "Unknown Supabase error"
        }`
      );

      setSaving(false);
      return;
    }

    // =========================
    // UPDATE SUCCESS
    // =========================

    console.log("ARTICLE UPDATED SUCCESSFULLY:", id);

    setMessage("Article successfully updated! ✅");

    setSaving(false);

    setTimeout(() => {
      router.push("/admin/articles");
      router.refresh();
    }, 800);
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8">
          Loading article...
        </div>
      </main>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">
              MyHisarNews
            </h1>

            <p className="text-sm text-gray-500">
              Edit Article
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/articles")
            }
            className="rounded-lg border px-4 py-2"
          >
            ← All News
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold">
            ✏️ खबर Edit करें
          </h2>

          {/* HEADLINE */}

          <div>
            <label className="mb-2 block font-semibold">
              Headline
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              required
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* SLUG */}

          <div>
            <label className="mb-2 block font-semibold">
              Slug
            </label>

            <input
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value)
              }
              required
              className="w-full rounded-lg border px-4 py-3"
            />

            <p className="mt-1 text-xs text-gray-500">
              URL के लिए English slug रखना बेहतर है।
            </p>
          </div>

          {/* SUMMARY */}

          <div>
            <label className="mb-2 block font-semibold">
              Summary
            </label>

            <textarea
              value={summary}
              onChange={(e) =>
                setSummary(e.target.value)
              }
              rows={3}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* HERO IMAGE */}

          <div>
            <label className="mb-2 block font-semibold">
              Hero Image URL
            </label>

            <input
              value={heroImage}
              onChange={(e) =>
                setHeroImage(e.target.value)
              }
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* BODY */}

          <div>
            <label className="mb-2 block font-semibold">
              News Content
            </label>

            <textarea
              value={body}
              onChange={(e) =>
                setBody(e.target.value)
              }
              rows={15}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* CATEGORY */}

          <div>
            <label className="mb-2 block font-semibold">
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full rounded-lg border px-4 py-3"
            >
              <option>हिसार</option>
              <option>हरियाणा</option>
              <option>अपराध</option>
              <option>राजनीति</option>
              <option>खेल</option>
              <option>कृषि</option>
              <option>मनोरंजन</option>
              <option>बॉलीवुड</option>
            </select>
          </div>

          {/* AUTHOR */}

          <div>
            <label className="mb-2 block font-semibold">
              Author
            </label>

            <input
              value={author}
              onChange={(e) =>
                setAuthor(e.target.value)
              }
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* TAGS */}

          <div>
            <label className="mb-2 block font-semibold">
              Tags
            </label>

            <input
              value={tags}
              onChange={(e) =>
                setTags(e.target.value)
              }
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* STATUS */}

          <div>
            <label className="mb-2 block font-semibold">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="w-full rounded-lg border px-4 py-3"
            >
              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>
            </select>
          </div>

          {/* MESSAGE */}

          {message && (
            <div className="rounded-lg bg-gray-100 p-4">
              {message}
            </div>
          )}

          {/* BUTTONS */}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/articles")
              }
              className="rounded-lg border px-6 py-3"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/admin/articles/preview?id=${params.id}`
                )
              }
              className="rounded-lg border px-6 py-3"
            >
              👁️ Preview
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Updating..."
                : "Update Article"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}