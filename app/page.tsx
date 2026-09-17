import { createClient } from "@/lib/supabase/server";
import LocationWeather from "@/components/LocationWeather";
import BreakingNews from "@/components/BreakingNews";
import Advertisement from "@/components/Advertisement";
import Link from "next/link";
import Image from "next/image";

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

      {/* TOP ADVERTISEMENT */}
      <Advertisement
        position="homepage_top"
        className="mx-auto my-4 max-w-7xl"
      />

      <div className="mx-auto max-w-7xl px-5 pt-5"></div>

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.jpeg"
              alt="MyHisarNews"
              width={220}
              height={80}
              className="h-20 w-auto object-contain"
            />
          </Link>

          {/* SEARCH + HOME */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              🔍 Search
            </Link>

            <Link
              href="/"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              🏠 Home
            </Link>
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
            <Link
              href="/"
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white"
            >
              सभी खबरें
            </Link>

            <Link
              href="/category/india"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🇮🇳 भारत
            </Link>

            <Link
              href="/category/haryana"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              हरियाणा
            </Link>

            <Link
              href="/category/hisar"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              हिसार
            </Link>

            <Link
              href="/category/politics"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              राजनीति
            </Link>

            <Link
              href="/category/crime"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🚨 क्राइम
            </Link>

            <Link
              href="/category/business"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              💼 बिजनेस
            </Link>

            <Link
              href="/category/sports"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🏏 स्पोर्ट्स
            </Link>

            <Link
              href="/category/entertainment"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🎬 मनोरंजन
            </Link>

            <Link
              href="/category/world"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🌍 दुनिया
            </Link>

            <Link
              href="/category/technology"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              💻 टेक्नोलॉजी
            </Link>

            <Link
              href="/category/health"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🩺 स्वास्थ्य
            </Link>

            <Link
              href="/category/education"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              📚 शिक्षा
            </Link>

            <Link
              href="/category/auto"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🚗 ऑटो
            </Link>

            <Link
              href="/category/weather"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🌦️ मौसम
            </Link>

            <Link
              href="/category/rashifal"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🔮 राशिफल
            </Link>

            <Link
              href="/category/panchang"
              className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              🕉️ पंचांग
            </Link>
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
                          article.published_at || article.created_at!
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

      {/* HOMEPAGE BOTTOM ADVERTISEMENT */}
      <Advertisement
        position="homepage_bottom"
        className="mx-auto my-8 max-w-7xl"
      />

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