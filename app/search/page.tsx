import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

type Article = {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  hero_image?: string | null;
  category?: string | null;
  author?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  let articles: Article[] = [];
  let error: { message: string } | null = null;

  if (query) {
    const result = await supabase
      .from("articles")
      .select(
        "id,title,slug,summary,hero_image,category,author,published_at,created_at"
      )
      .eq("status", "published")
      .or(
        `title.ilike.%${query}%,summary.ilike.%${query}%,category.ilike.%${query}%`
      )
      .order("published_at", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(50);

    articles = result.data || [];
    error = result.error;
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4">

          <Link href="/" className="flex items-center">
            <Image
              src="/logo.jpeg"
              alt="MyHisarNews"
              width={220}
              height={80}
              className="h-20 w-auto object-contain"
            />
          </Link>

          <Link
            href="/"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            🏠 Home
          </Link>

        </div>

      </header>


      {/* SEARCH */}
      <section className="border-b bg-white">

        <div className="mx-auto max-w-4xl px-5 py-10">

          <h1 className="text-center text-3xl font-bold text-gray-900">
            खबर खोजें
          </h1>

          <p className="mt-2 text-center text-gray-500">
            किसी भी खबर, विषय या category को खोजें
          </p>

          <form
            action="/search"
            method="GET"
            className="mx-auto mt-6 flex max-w-2xl gap-2"
          >

            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="जैसे: हरियाणा, चुनाव, क्रिकेट..."
              className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />

            <button
              type="submit"
              className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
            >
              🔍 खोजें
            </button>

          </form>

        </div>

      </section>


      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-5 py-8">

        {!query ? (

          <div className="rounded-xl bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">
              🔍
            </div>

            <h2 className="mt-4 text-xl font-bold">
              खबर खोजने के लिए ऊपर search करें
            </h2>

          </div>

        ) : error ? (

          <div className="rounded-xl bg-red-100 p-6 text-red-700">

            <p className="font-bold">
              Search में समस्या आ गई।
            </p>

            <p className="mt-2 text-sm">
              {error.message}
            </p>

          </div>

        ) : articles.length === 0 ? (

          <div className="rounded-xl bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">
              📰
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              कोई खबर नहीं मिली
            </h2>

            <p className="mt-2 text-gray-500">
              &quot;{query}&quot; से जुड़ी कोई published खबर नहीं मिली।
            </p>

          </div>

        ) : (

          <>

            <div className="mb-6">

              <h2 className="text-2xl font-bold text-gray-900">
                &quot;{query}&quot; के search results
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {articles.length} खबरें मिलीं
              </p>

            </div>


            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {articles.map((article) => (

                <article
                  key={article.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  {/* IMAGE */}
                  {article.hero_image ? (

                    <a href={`/news/${article.slug}`}>

                      <Image
                        src={article.hero_image}
                        alt={article.title}
                        className="h-52 w-full object-cover"
                      />

                    </a>

                  ) : (

                    <a
                      href={`/news/${article.slug}`}
                      className="flex h-52 w-full items-center justify-center bg-gray-200 text-gray-500"
                    >
                      MyHisarNews
                    </a>

                  )}


                  <div className="p-5">

                    {article.category && (

                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        {article.category}
                      </span>

                    )}

                    <h3 className="mt-3 text-xl font-bold leading-7 text-gray-900">

                      <a
                        href={`/news/${article.slug}`}
                        className="hover:text-red-600"
                      >
                        {article.title}
                      </a>

                    </h3>

                    {article.summary && (

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                        {article.summary}
                      </p>

                    )}

                    <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-gray-500">

                      <span>
                        {article.author
                          ? `✍️ ${article.author}`
                          : "MyHisarNews"}
                      </span>

                      <span>
                        {new Date(
                          article.published_at ||
                            article.created_at!
                        ).toLocaleDateString("hi-IN")}
                      </span>

                    </div>

                    <a
                      href={`/news/${article.slug}`}
                      className="mt-4 inline-block font-semibold text-red-600"
                    >
                      पूरी खबर पढ़ें →
                    </a>

                  </div>

                </article>

              ))}

            </div>

          </>

        )}

      </section>


      {/* FOOTER */}
      <footer className="mt-12 border-t bg-white">

        <div className="mx-auto max-w-7xl px-5 py-6 text-center text-sm text-gray-500">

          <p>
            © {new Date().getFullYear()} MyHisarNews.
            All Rights Reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}
