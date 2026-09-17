"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

type Article = {
  id: number;
  title: string;
  slug: string;
  status: string;
  is_breaking: boolean;
  breaking_priority: number;
  breaking_until: string | null;
};

const supabase = createClient();

export default function BreakingNewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("articles")
        .select(
          "id,title,slug,status,is_breaking,breaking_priority,breaking_until"
        )
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("BREAKING ARTICLES ERROR:", error);
        setMessage("News load नहीं हो पाई ❌");
        setLoading(false);
        return;
      }

      setArticles(data || []);
      setLoading(false);
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  async function updateBreaking(
    id: number,
    changes: Partial<Article>
  ) {
    setSavingId(id);
    setMessage("");

    const { error } = await supabase
      .from("articles")
      .update(changes)
      .eq("id", id);

    if (error) {
      console.error("BREAKING UPDATE ERROR:", error);
      setMessage("Update नहीं हुआ ❌");
      setSavingId(null);
      return;
    }

    setArticles((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, ...changes }
          : item
      )
    );

    setMessage("Breaking News update हो गई ✅");
    setSavingId(null);
  }

  return (
    <main className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <section className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Breaking News 🔴
            </h1>

            <p className="mt-2 text-gray-600">
              Homepage की Breaking News यहाँ से manage करें।
            </p>
          </div>

          {message && (
            <div className="mb-5 rounded-lg bg-white px-4 py-3 text-sm font-medium shadow">
              {message}
            </div>
          )}

          {loading ? (
            <div className="rounded-xl bg-white p-8">
              Loading news...
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-gray-500">
              अभी कोई news नहीं है।
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl bg-white shadow">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold">
                        News
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-semibold">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-semibold">
                        Priority
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-semibold">
                        Expiry
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-semibold">
                        Breaking
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {articles.map((article) => (
                      <tr key={article.id}>
                        <td className="px-5 py-5">
                          <div className="max-w-md">
                            <p className="font-semibold text-gray-900">
                              {article.title}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              /news/{article.slug}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                            {article.status}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={article.breaking_priority}
                            disabled={
                              savingId === article.id
                            }
                            onChange={(e) => {
                              const value = Number(
                                e.target.value
                              );

                              setArticles((current) =>
                                current.map((item) =>
                                  item.id === article.id
                                    ? {
                                        ...item,
                                        breaking_priority:
                                          value,
                                      }
                                    : item
                                )
                              );
                            }}
                            onBlur={(e) =>
                              updateBreaking(article.id, {
                                breaking_priority:
                                  Number(e.target.value),
                              })
                            }
                            className="w-20 rounded-lg border px-3 py-2"
                          />
                        </td>

                        <td className="px-5 py-5">
                          <input
                            type="datetime-local"
                            value={
                              article.breaking_until
                                ? new Date(
                                    article.breaking_until
                                  )
                                    .toISOString()
                                    .slice(0, 16)
                                : ""
                            }
                            disabled={
                              savingId === article.id
                            }
                            onChange={(e) => {
                              const value = e.target.value;

                              setArticles((current) =>
                                current.map((item) =>
                                  item.id === article.id
                                    ? {
                                        ...item,
                                        breaking_until:
                                          value || null,
                                      }
                                    : item
                                )
                              );
                            }}
                            onBlur={(e) =>
                              updateBreaking(article.id, {
                                breaking_until:
                                  e.target.value
                                    ? new Date(
                                        e.target.value
                                      ).toISOString()
                                    : null,
                              })
                            }
                            className="rounded-lg border px-3 py-2 text-sm"
                          />
                        </td>

                        <td className="px-5 py-5">
                          <button
                            type="button"
                            disabled={
                              savingId === article.id
                            }
                            onClick={() =>
                              updateBreaking(article.id, {
                                is_breaking:
                                  !article.is_breaking,
                              })
                            }
                            className={
                              article.is_breaking
                                ? "rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                                : "rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
                            }
                          >
                            {savingId === article.id
                              ? "Saving..."
                              : article.is_breaking
                              ? "ON 🔴"
                              : "OFF"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}