import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

const categoryNames: Record<string, string> = {
  india: "भारत",
  haryana: "हरियाणा",
  hisar: "हिसार",
  politics: "राजनीति",
  crime: "क्राइम",
  business: "बिजनेस",
  sports: "स्पोर्ट्स",
  entertainment: "मनोरंजन",
  world: "दुनिया",
  technology: "टेक्नोलॉजी",
  health: "स्वास्थ्य",
  education: "शिक्षा",
  auto: "ऑटो",
  weather: "मौसम",
  rashifal: "राशिफल",
panchang: "पंचांग",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const categoryName = categoryNames[category];

  if (!categoryName) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: articles,
    error,
  } = await supabase
    .from("articles")
    .select(
      "id,title,slug,summary,hero_image,category,author,published_at,created_at"
    )
    .eq("status", "published")
    .eq("category", categoryName)
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(50);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <Link href="/" className="flex items-center">
            <Image
              src="/logo.jpeg"
              alt="MyHisarNews"
              className="h-16 w-auto object-contain"
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

      {/* CATEGORY TITLE */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8">

          <p className="text-sm font-semibold text-red-600">
            MyHisarNews
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
            {categoryName} की ताज़ा खबरें
          </h1>

          <p className="mt-2 text-gray-500">
            {categoryName} से जुड़ी सभी बड़ी और ताज़ा खबरें
          </p>

        </div>
      </section>

      {/* NEWS */}
      <section className="mx-auto max-w-7xl px-5 py-8">

        {error ? (

          <div className="rounded-xl bg-red-100 p-6 text-red-700">
            <p className="text-lg font-bold">
              News load नहीं हो पाई।
            </p>

            <p className="mt-2 break-words text-sm">
              Error: {error.message}
            </p>
          </div>

        ) : !articles || articles.length === 0 ? (

          <div className="rounded-xl bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">
              📰
            </div>

            <h2 className="mt-4 text-xl font-bold">
              अभी इस category में कोई खबर नहीं है।
            </h2>

            <p className="mt-2 text-gray-500">
              जल्द ही नई खबरें यहाँ दिखाई देंगी।
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white"
            >
              ← सभी खबरें देखें
            </Link>

          </div>

        ) : (

          <>

            {/* NEWS COUNT */}
            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold text-gray-900">
                Latest News
              </h2>

              <span className="text-sm text-gray-500">
                {articles.length} खबरें
              </span>

            </div>

            {/* GRID */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {articles.map((article: Article) => (

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

                  {/* CONTENT */}
                  <div className="p-5">

                    {/* CATEGORY */}
                    {article.category && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        {article.category}
                      </span>
                    )}

                    {/* TITLE */}
                    <h3 className="mt-3 text-xl font-bold leading-7 text-gray-900">
                      <a
                        href={`/news/${article.slug}`}
                        className="hover:text-red-600"
                      >
                        {article.title}
                      </a>
                    </h3>

                    {/* SUMMARY */}
                    {article.summary && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                        {article.summary}
                      </p>
                    )}

                    {/* META */}
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

                    {/* READ MORE */}
                    <a
                      href={`/news/${article.slug}`}
                      className="mt-4 inline-block font-semibold text-red-600 hover:text-red-700"
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

          <p className="mt-1">
            भारत और दुनिया की हर बड़ी खबर
          </p>

        </div>

      </footer>

    </main>
  );
}
