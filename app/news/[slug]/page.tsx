import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import Advertisement from "@/components/Advertisement";
import Link from "next/link";
import Image from "next/image";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug);

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", cleanSlug)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!article) {
    return {
      title: "News Not Found | MyHisarNews",
      description: "यह खबर उपलब्ध नहीं है।",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://myhisarnews.com";

  const description =
    article.seo_description ||
    article.summary ||
    `Read ${article.title} on MyHisarNews.`;

  const keywords =
    article.seo_keywords ||
    article.tags ||
    undefined;

  const image =
    article.hero_image || "/logo.jpeg";

  return {
    title: article.title,
    description,
    keywords,

    alternates: {
      canonical: `${siteUrl}/news/${article.slug}`,
    },

    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: `${siteUrl}/news/${article.slug}`,
      siteName: "MyHisarNews",
      publishedTime: article.published_at || undefined,
      authors: article.author
        ? [article.author]
        : ["MyHisarNews"],
      images: [
        {
          url: image,
          alt: article.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [image],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function NewsDetail({ params }: Props) {
  const { slug } = await params;

  const cleanSlug = decodeURIComponent(slug);

  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", cleanSlug)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("NEWS DETAIL ERROR:", error);
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-gray-50 p-10">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8">
          <h1 className="text-2xl font-bold">
            News not found
          </h1>

          <p className="mt-3 text-gray-500">
            यह खबर उपलब्ध नहीं है या अभी published नहीं हुई है।
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white"
          >
            ← MyHisarNews Home
          </Link>
        </div>
      </main>
    );
  }

  const contentBlocks = Array.isArray(article.content_blocks)
    ? article.content_blocks
    : [];

  function getYouTubeEmbedUrl(url: string) {
    try {
      const parsed = new URL(url);

      if (parsed.hostname.includes("youtu.be")) {
        const id = parsed.pathname.replace("/", "");
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }

      if (parsed.hostname.includes("youtube.com")) {
        const videoId = parsed.searchParams.get("v");

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }

        if (parsed.pathname.startsWith("/shorts/")) {
          const id = parsed.pathname.split("/shorts/")[1];
          return id ? `https://www.youtube.com/embed/${id}` : url;
        }

        if (parsed.pathname.startsWith("/embed/")) {
          return url;
        }
      }
    } catch {}

    return url;
  }

  const currentViews = article.views || 0;

  // Increase views
  await supabase
    .from("articles")
    .update({
      views: currentViews + 1,
    })
    .eq("id", article.id);

  return (
    <main className="min-h-screen bg-gray-50">

      <header className="border-b bg-white px-5 py-5">
        <Link
          href="/"
          className="text-2xl font-bold text-red-600"
        >
          MyHisarNews
        </Link>
      </header>

      <article className="mx-auto mt-6 max-w-4xl rounded-xl bg-white px-5 py-10">

        {article.hero_image && (
          <Image
            src={article.hero_image}
            alt={article.title}
            className="mb-8 w-full rounded-xl"
          />
        )}

        <Advertisement
          position="article_top"
          className="my-8"
        />

        <div className="mb-4 text-sm font-semibold text-red-600">
          {article.category}
        </div>

        <h1 className="text-4xl font-bold leading-tight text-gray-900">
          {article.title}
        </h1>

        <div className="mt-4 text-sm text-gray-500">
          ✍️ {article.author || "MyHisarNews"}
          {" | "}
          👁️ {currentViews} views
        </div>

        {article.summary && (
          <p className="mt-6 text-xl text-gray-600">
            {article.summary}
          </p>
        )}

        <Advertisement
          position="article_middle"
          className="my-8"
        />

        <div className="mt-8 space-y-6">

          {contentBlocks.length > 0 ? (
            contentBlocks.map((block: (typeof contentBlocks)[number], index: number) => {

              if (block.type === "text") {
                return (
                  <p
                    key={block.id || index}
                    className="whitespace-pre-line text-lg leading-9 text-gray-800"
                  >
                    {block.content}
                  </p>
                );
              }

              if (block.type === "image") {
                return (
                  <figure key={block.id || index}>
                    {block.url && (
                      <Image
                        src={block.url}
                        alt={block.title || article.title}
                        className="w-full rounded-xl"
                      />
                    )}

                    {block.title && (
                      <figcaption className="mt-2 text-center text-sm text-gray-500">
                        {block.title}
                      </figcaption>
                    )}
                  </figure>
                );
              }

              if (block.type === "youtube") {
                return (
                  <div
                    key={block.id || index}
                    className="aspect-video overflow-hidden rounded-xl bg-black"
                  >
                    <iframe
                      src={getYouTubeEmbedUrl(block.url || "")}
                      className="h-full w-full"
                      allowFullScreen
                      title="YouTube video"
                    />
                  </div>
                );
              }

              if (block.type === "instagram") {
                return (
                  <div
                    key={block.id || index}
                    className="rounded-xl border bg-white p-5"
                  >
                    <div className="mb-2 font-bold">
                      📱 Instagram
                    </div>

                    {block.url && (
                      <a
                        href={block.url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-blue-600"
                      >
                        {block.url}
                      </a>
                    )}
                  </div>
                );
              }

              if (block.type === "facebook") {
                return (
                  <div
                    key={block.id || index}
                    className="rounded-xl border bg-white p-5"
                  >
                    <div className="mb-2 font-bold">
                      📘 Facebook
                    </div>

                    {block.url && (
                      <a
                        href={block.url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-blue-600"
                      >
                        {block.url}
                      </a>
                    )}
                  </div>
                );
              }

              if (block.type === "embed") {
                return (
                  <div
                    key={block.id || index}
                    className="rounded-xl border bg-white p-5"
                  >
                    <p className="font-semibold">
                      🔲 Embed
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Embed content added
                    </p>
                  </div>
                );
              }

              if (block.type === "external_link") {
                return (
                  <a
                    key={block.id || index}
                    href={block.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border bg-gray-50 p-4 font-semibold text-blue-600"
                  >
                    {block.title || block.url}
                  </a>
                );
              }

              return null;
            })
          ) : (
            <div className="whitespace-pre-line text-lg leading-9 text-gray-800">
              {article.body}
            </div>
          )}

        </div>

        <Advertisement
          position="article_bottom"
          className="my-8"
        />

      </article>
    </main>
  );
}
