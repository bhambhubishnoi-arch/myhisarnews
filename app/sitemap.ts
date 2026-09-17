import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://myhisarnews.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("articles")
    .select("slug,published_at,created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const articleUrls =
    articles?.map((article) => ({
      url: `${siteUrl}/news/${article.slug}`,
      lastModified:
        article.published_at || article.created_at || new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })) || [];

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${siteUrl}/search`,
      changeFrequency: "daily",
      priority: 0.5,
    },
    ...articleUrls,
  ];
}
