"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Article = {
  id: number;
  title: string;
  slug: string;
  category?: string | null;
  status?: string | null;
  author?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

const supabase = createClient();

export default function ArticlesPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (cancelled) return;

      if (error) {
        console.error("ARTICLES ERROR:", error.message);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log("ARTICLES LOADED:", data?.length || 0);

      setArticles(data || []);
      setLoading(false);
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  async function deleteArticle(id: number) {
    const confirmed = window.confirm(
      "क्या आप यह खबर delete करना चाहते हैं?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setArticles((current) =>
      current.filter((article) => article.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">
              MyHisarNews
            </h1>

            <p className="text-sm text-gray-500">
              All Articles
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              ← Dashboard
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/admin/articles/new")
              }
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              + New Article
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-xl bg-white p-8 text-center">
            Loading articles...
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center">
            अभी कोई article नहीं है।
          </div>
        )}

        {!loading && articles.length > 0 && (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-5 py-4">
                      News
                    </th>

                    <th className="px-5 py-4">
                      Category
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-5 py-5">
                        <div className="font-semibold">
                          {article.title}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          /news/{article.slug}
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm">
                        {article.category || "-"}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={
                            "rounded-full px-3 py-1 text-xs font-semibold " +
                            (article.status ===
                            "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700")
                          }
                        >
                          {article.status || "draft"}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-sm text-gray-500">
                        {article.published_at
                          ? new Date(
                              article.published_at
                            ).toLocaleDateString(
                              "hi-IN"
                            )
                          : article.created_at
                          ? new Date(
                              article.created_at
                            ).toLocaleDateString(
                              "hi-IN"
                            )
                          : "-"}
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-2">
                          {article.status ===
                            "published" && (
                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  "/news/" +
                                    article.slug,
                                  "_blank"
                                )
                              }
                              className="rounded-lg border px-3 py-2 text-sm"
                            >
                              👁️ View
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                "/admin/articles/edit/" +
                                  article.id
                              )
                            }
                            className="rounded-lg border px-3 py-2 text-sm"
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteArticle(
                                article.id
                              )
                            }
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}