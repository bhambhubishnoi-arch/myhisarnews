"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Article = {
  id: number;
  title: string;
  category: string | null;
  status: string | null;
  views: number | null;
  created_at: string | null;
};

export default function AnalyticsPage() {
  const supabase = createClient();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      const { data, error } = await supabase
        .from("articles")
        .select("id,title,category,status,views,created_at")
        .order("created_at", {
          ascending: false,
        });

      if (cancelled) return;

      if (error) {
        console.error("ANALYTICS ERROR:", error.message);
        setError(error.message);
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
  }, [supabase]);

  const total = articles.length;

  const published = articles.filter(
    (article) => article.status === "published"
  ).length;

  const drafts = articles.filter(
    (article) => article.status === "draft"
  ).length;

  const totalViews = articles.reduce(
    (sum, article) => sum + (article.views || 0),
    0
  );

  const categoryCounts = articles.reduce(
    (acc: Record<string, number>, article) => {
      const category = article.category || "Other";

      acc[category] = (acc[category] || 0) + 1;

      return acc;
    },
    {}
  );

  const topArticles = [...articles]
    .sort(
      (a, b) =>
        (b.views || 0) - (a.views || 0)
    )
    .slice(0, 5);

  return (
    <section className="min-h-screen bg-gray-50 p-6">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics 📊
        </h1>

        <p className="mt-1 text-gray-500">
          MyHisarNews की performance और news statistics
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
          Loading analytics...
        </div>
      ) : (
        <>
          {/* Stats */}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="text-3xl">📰</div>

              <p className="mt-4 text-sm text-gray-500">
                Total News
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {total}
              </h2>
            </div>


            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="text-3xl">✅</div>

              <p className="mt-4 text-sm text-gray-500">
                Published
              </p>

              <h2 className="mt-1 text-3xl font-bold text-green-600">
                {published}
              </h2>
            </div>


            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="text-3xl">📝</div>

              <p className="mt-4 text-sm text-gray-500">
                Draft
              </p>

              <h2 className="mt-1 text-3xl font-bold text-yellow-600">
                {drafts}
              </h2>
            </div>


            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="text-3xl">👁️</div>

              <p className="mt-4 text-sm text-gray-500">
                Total Views
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {totalViews.toLocaleString("en-IN")}
              </h2>
            </div>

          </div>


          {/* Main Analytics */}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">

            {/* Categories */}

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="mb-5 text-xl font-bold">
                News by Category
              </h2>

              {Object.keys(categoryCounts).length === 0 ? (
                <p className="text-gray-500">
                  अभी कोई category data नहीं है।
                </p>
              ) : (
                <div className="space-y-4">

                  {Object.entries(categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => (

                      <div
                        key={category}
                        className="flex items-center justify-between border-b pb-3"
                      >

                        <span className="font-medium">
                          {category}
                        </span>

                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                          {count}
                        </span>

                      </div>

                    ))}

                </div>
              )}

            </div>


            {/* Top Viewed */}

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="mb-5 text-xl font-bold">
                Top Viewed News 🔥
              </h2>

              {topArticles.length === 0 ? (
                <p className="text-gray-500">
                  अभी कोई news नहीं है।
                </p>
              ) : (
                <div className="space-y-4">

                  {topArticles.map(
                    (article, index) => (

                      <div
                        key={article.id}
                        className="flex gap-4 border-b pb-4 last:border-0"
                      >

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="line-clamp-2 font-semibold">
                            {article.title}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            👁️ {(article.views || 0).toLocaleString("en-IN")} views
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>
              )}

            </div>

          </div>


          {/* Recent News */}

          <div className="mt-8 rounded-2xl bg-white shadow-sm">

            <div className="border-b px-6 py-5">

              <h2 className="text-xl font-bold">
                Recent News
              </h2>

            </div>

            {articles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                अभी कोई news नहीं है।
              </div>
            ) : (
              <div className="divide-y">

                {articles.slice(0, 10).map(
                  (article) => (

                    <div
                      key={article.id}
                      className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between"
                    >

                      <div className="min-w-0">

                        <h3 className="font-semibold">
                          {article.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {article.category || "Other"}
                        </p>

                      </div>

                      <div className="flex items-center gap-3">

                        <span
                          className={
                            article.status === "published"
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                              : "rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700"
                          }
                        >
                          {article.status || "draft"}
                        </span>

                        <span className="text-sm text-gray-500">
                          👁️ {article.views || 0}
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>
            )}

          </div>

        </>
      )}

    </section>
  );

}
