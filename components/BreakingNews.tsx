import { supabase } from "@/lib/supabase";

export default async function BreakingNews() {
  const { data: articles } = await supabase
    .from("articles")
    .select("id,title,slug,is_breaking,breaking_priority,breaking_until")
    .eq("status", "published")
    .eq("is_breaking", true)
    .order("breaking_priority", {
      ascending: false,
      nullsFirst: false,
    })
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(8);

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="border-b bg-red-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center">

        {/* LABEL */}
        <div className="z-10 flex shrink-0 items-center gap-2 bg-red-700 px-4 py-3 font-bold shadow-md">
          <span className="animate-pulse">🔴</span>
          <span>BREAKING NEWS</span>
        </div>

        {/* NEWS */}
        <div className="min-w-0 flex-1 overflow-hidden">

          <div className="flex min-w-max animate-[ticker_35s_linear_infinite] gap-10 px-6">

            {articles.map((article) => (

              <a
                key={article.id}
                href={`/news/${article.slug}`}
                className="whitespace-nowrap py-3 text-sm font-medium hover:underline"
              >
                {article.title}
              </a>

            ))}

          </div>

        </div>

      </div>
    </div>
  );
}
