"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Article = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  hero_image: string | null;
  body: string | null;
  category: string | null;
  author: string | null;
  tags: string | null;
  status: string | null;
  published_at: string | null;
};

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArticle() {
      if (!id) {
        setError("Article ID missing.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("PREVIEW ERROR:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Article not found.");
        setLoading(false);
        return;
      }

      setArticle(data);
      setLoading(false);
    }

    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8">
          Loading preview...
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8">
          <h1 className="text-2xl font-bold">Preview unavailable</h1>

          <p className="mt-3 text-red-600">
            {error || "Article not found."}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-6 rounded-lg border px-5 py-3"
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">MyHisarNews</h1>

            <p className="text-sm text-gray-500">
              Article Preview
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(`/admin/articles/edit/${article.id}`)
            }
            className="rounded-lg border px-4 py-2"
          >
            ← Back to Edit
          </button>
        </div>
      </header>

      <article className="mx-auto mt-8 max-w-4xl rounded-xl bg-white p-6 shadow-sm md:p-10">
        {article.status === "draft" && (
          <div className="mb-6 rounded-lg bg-yellow-100 p-4 font-semibold text-yellow-800">
            ⚠️ Draft Preview — यह खबर अभी Published नहीं है।
          </div>
        )}

        {article.category && (
          <div className="mb-3 text-sm font-semibold text-red-600">
            {article.category}
          </div>
        )}

        <h1 className="text-4xl font-bold leading-tight text-gray-900">
          {article.title}
        </h1>

        <div className="mt-4 text-sm text-gray-500">
          ✍️ {article.author || "MyHisarNews"}
        </div>

        {article.hero_image && (
          <Image
            src={article.hero_image}
            alt={article.title}
            width={1200}
            height={675}
            unoptimized
            className="mt-8 h-auto w-full rounded-xl object-cover"
          />
        )}

        {article.summary && (
          <p className="mt-8 text-xl leading-8 text-gray-600">
            {article.summary}
          </p>
        )}

        <div className="mt-8 whitespace-pre-line text-lg leading-9 text-gray-800">
          {article.body}
        </div>

        {article.tags && (
          <div className="mt-10 border-t pt-6 text-sm text-gray-500">
            Tags: {article.tags}
          </div>
        )}
      </article>
    </main>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-4xl rounded-xl bg-white p-8">
            Loading preview...
          </div>
        </main>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}