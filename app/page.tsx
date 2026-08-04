
import { createClient } from "@/lib/supabase/server";
import LocationWeather from "@/components/LocationWeather";
import BreakingNews from "@/components/BreakingNews";

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

export default async function HomePage() {
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
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(20);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* LOCATION / WEATHER / TIME */}
      <LocationWeather />

      {/* BREAKING NEWS */}
      <BreakingNews />

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          {/* LOGO */}
          <a href="/" className="flex items-center">
            <img
              src="/logo.jpeg"
              alt="MyHisarNews"
              className="h-20 w-auto object-contain"
            />
          </a>

          {/* SEARCH + HOME */}
          <div className="flex items-center gap-2">

            <a
              href="/search"
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              🔍 Search
            </a>

            <a
              href="/"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              🏠 Home
            </a>

          </div>

        </div>
      </header>

      {/* HERO */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8">

          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            देश-दुनिया की ताज़ा खबरें
          </h1>

          <p className="mt-2 text-gray-500">
            भारत, हरियाणा, हिसार और दुनिया की हर बड़ी खबर
          </p>

        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-b bg-white">

        <div className="mx-auto max-w-7xl overflow-x-auto px-5 py-4">

          <div className="flex min-w-max gap-3">

            <a
              href="/"
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white"
            >
              सभी खबरें
            </a>

            <a
              href="/category/india"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🇮🇳 भारत
            </a>

            <a
              href="/category/haryana"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              हरियाणा
            </a>

            <a
              href="/category/hisar"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              हिसार
            </a>

            <a
              href="/category/politics"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              राजनीति
            </a>

            <a
              href="/category/crime"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🚨 क्राइम
            </a>

            <a
              href="/category/business"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              💼 बिजनेस
            </a>

            <a
              href="/category/sports"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🏏 स्पोर्ट्स
            </a>

            <a
              href="/category/entertainment"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🎬 मनोरंजन
            </a>

            <a
              href="/category/world"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🌍 दुनिया
            </a>

            <a
              href="/category/technology"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              💻 टेक्नोलॉजी
            </a>

            <a
              href="/category/health"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🩺 स्वास्थ्य
            </a>

            <a
              href="/category/education"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              📚 शिक्षा
            </a>

            <a
              href="/category/auto"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🚗 ऑटो
            </a>

            <a
              href="/category/weather"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🌦️ मौसम
            </a>

          </div>

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

          <div className="rounded-xl bg-white p-8 text-center shadow-sm">

            <p className="text-lg font-semibold">
              अभी कोई खबर प्रकाशित नहीं हुई है।
            </p>

            <p className="mt-2 text-sm text-gray-500">
              जल्द ही नई खबरें यहाँ दिखाई देंगी।
            </p>

          </div>

        ) : (

          <>

            {/* SECTION TITLE */}
            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold text-gray-900">
                Latest News
              </h2>

              <span className="text-sm text-gray-500">
                {articles.length} खबरें
              </span>

            </div>

            {/* NEWS GRID */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {articles.map((article) => (

                <article
                  key={article.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  {/* IMAGE */}
                  {article.hero_image ? (

                    <a href={`/news/${article.slug}`}>

                      <img
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