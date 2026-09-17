"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

type BlockType =
  | "text"
  | "image"
  | "youtube"
  | "instagram"
  | "facebook"
  | "embed"
  | "internal_link"
  | "external_link";

type ContentBlock = {
  id: string;
  type: BlockType;
  content?: string;
  title?: string;
  url?: string;
  articleId?: number;
};

type Article = {
  id: number;
  title: string;
  slug: string;
};

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");

      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/shorts/")[1];

        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
    }
  } catch {
    return url;
  }

  return url;
}

function createSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewArticle() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [category, setCategory] = useState("हिसार");
  const [author, setAuthor] = useState("MyHisarNews");
  const [tags, setTags] = useState("");

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  const [status, setStatus] = useState("published");

  const [blocks, setBlocks] = useState<ContentBlock[]>([
    {
      id: crypto.randomUUID(),
      type: "text",
      content: "",
    },
  ]);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {

    async function initialLoad() {
          const { data, error } = await supabase
            .from("articles")
            .select("id,title,slug")
            .order("id", { ascending: false })
            .limit(100);

          if (error) {
            console.error("LOAD ARTICLES ERROR:", error);
            return;
          }

          if (data) {
            setArticles(data);
          }
    }

    void initialLoad();

    return () => {
      };
  }, [supabase]);

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slug) {
      setSlug(createSlug(value));
    }
  }

  function addBlock(type: BlockType) {
    setBlocks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        type,
        content: "",
        url: "",
        title: "",
      },
    ]);
  }

  function removeBlock(id: string) {
    setBlocks((current) =>
      current.filter((block) => block.id !== id)
    );
  }

  function updateBlock(
    id: string,
    field: keyof ContentBlock,
    value: string | number
  ) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === id
          ? {
              ...block,
              [field]: value,
            }
          : block
      )
    );
  }

  function moveBlock(
    id: string,
    direction: "up" | "down"
  ) {
    setBlocks((current) => {
      const index = current.findIndex(
        (block) => block.id === id
      );

      if (index === -1) {
        return current;
      }

      const newIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        newIndex < 0 ||
        newIndex >= current.length
      ) {
        return current;
      }

      const copy = [...current];

      [copy[index], copy[newIndex]] = [
        copy[newIndex],
        copy[index],
      ];

      return copy;
    });
  }

  function getBlockLabel(type: BlockType) {
    switch (type) {
      case "text":
        return "📝 Text";

      case "image":
        return "📸 Image";

      case "youtube":
        return "▶️ YouTube";

      case "instagram":
        return "📱 Instagram";

      case "facebook":
        return "📘 Facebook";

      case "embed":
        return "🔲 Embed";

      case "internal_link":
        return "🔗 Internal Link";

      case "external_link":
        return "🌐 External Link";

      default:
        return "Content";
    }
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("PUBLISH AUTH CHECK");
    console.log("USER:", user);

    if (!user) {
      setMessage(
        "Login session expired. Please login again."
      );

      setLoading(false);

      router.replace("/admin/login");

      return;
    }

    if (!title.trim()) {
      setMessage("Headline required.");

      setLoading(false);

      return;
    }

    if (!slug.trim()) {
      setMessage("Slug required.");

      setLoading(false);

      return;
    }

    const cleanBlocks = blocks.filter((block) => {
      if (block.type === "internal_link") {
        return !!block.articleId;
      }

      return Boolean(
        block.content?.trim() ||
          block.url?.trim() ||
          block.title?.trim()
      );
    });

    const bodyText = cleanBlocks
      .filter(
        (block) => block.type === "text"
      )
      .map(
        (block) => block.content || ""
      )
      .join("\n\n");

    const insertData = {
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim(),
      hero_image: heroImage.trim(),
      highlights: "",
      body: bodyText,
      content_blocks: cleanBlocks,
      category,
      author: author.trim() || "MyHisarNews",
      tags: tags.trim(),
      seo_title:
        seoTitle.trim() || title.trim(),
      seo_description:
        seoDescription.trim() ||
        summary.trim(),
      seo_keywords: seoKeywords.trim(),
      status,
      published_at:
        status === "published"
          ? new Date().toISOString()
          : null,
      updated_at:
        new Date().toISOString(),
    };

    console.log(
      "INSERT ARTICLE:",
      insertData
    );

    const {
      data: insertedArticle,
      error,
    } = await supabase
      .from("articles")
      .insert(insertData)
      .select("id,slug")
      .single();

    if (error) {
      console.error(
        "PUBLISH ARTICLE ERROR:",
        error
      );

      setMessage(
        `Error: ${error.message}`
      );

      setLoading(false);

      return;
    }

    console.log(
      "ARTICLE CREATED:",
      insertedArticle
    );

    setMessage(
      "Article successfully published! ✅"
    );

    setLoading(false);

    /*
     * IMPORTANT:
     * Publish ke baad Dashboard nahi.
     * Seedha NEW ARTICLE page khulega.
     */

    setTimeout(() => {
      router.push("/admin/articles/new");
      router.refresh();
    }, 700);
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">
              MyHisarNews
            </h1>

            <p className="text-sm text-gray-500">
              New Article
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/admin")
            }
            className="rounded-lg border px-4 py-2 text-sm"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold">
            नई खबर लिखें
          </h2>

          {/* TITLE */}

          <div>
            <label className="mb-2 block font-semibold">
              Headline
            </label>

            <input
              value={title}
              onChange={(e) =>
                handleTitleChange(
                  e.target.value
                )
              }
              required
              placeholder="खबर की headline"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* SLUG */}

          <div>
            <label className="mb-2 block font-semibold">
              Slug
            </label>

            <input
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value)
              }
              required
              placeholder="hisar-news-today"
              className="w-full rounded-lg border px-4 py-3"
            />

            <p className="mt-1 text-xs text-gray-500">
              URL के लिए English slug रखना बेहतर है।
            </p>
          </div>

          {/* SUMMARY */}

          <div>
            <label className="mb-2 block font-semibold">
              Summary
            </label>

            <textarea
              value={summary}
              onChange={(e) =>
                setSummary(e.target.value)
              }
              rows={3}
              placeholder="खबर का छोटा सारांश"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* HERO */}

          <div>
            <label className="mb-2 block font-semibold">
              Hero Image URL
            </label>

            <input
              value={heroImage}
              onChange={(e) =>
                setHeroImage(e.target.value)
              }
              placeholder="Image URL"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* CONTENT */}

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                Article Content
              </h3>

              <span className="text-sm text-gray-500">
                {blocks.length} blocks
              </span>
            </div>

            <div className="space-y-4">
              {blocks.map(
                (block, index) => (
                  <div
                    key={block.id}
                    className="rounded-xl border bg-gray-50 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="font-semibold">
                        {getBlockLabel(
                          block.type
                        )}
                      </span>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            moveBlock(
                              block.id,
                              "up"
                            )
                          }
                          className="rounded border px-2 py-1 text-sm"
                          disabled={
                            index === 0
                          }
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveBlock(
                              block.id,
                              "down"
                            )
                          }
                          className="rounded border px-2 py-1 text-sm"
                          disabled={
                            index ===
                            blocks.length - 1
                          }
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeBlock(
                              block.id
                            )
                          }
                          className="rounded bg-red-600 px-2 py-1 text-sm text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* TEXT */}

                    {block.type ===
                      "text" && (
                      <textarea
                        value={
                          block.content ||
                          ""
                        }
                        onChange={(e) =>
                          updateBlock(
                            block.id,
                            "content",
                            e.target.value
                          )
                        }
                        rows={7}
                        placeholder="यहाँ Hindi में खबर लिखें..."
                        className="w-full rounded-lg border bg-white px-4 py-3"
                      />
                    )}

                    {/* IMAGE */}

                    {block.type ===
                      "image" && (
                      <div className="space-y-3">
                        <input
                          value={
                            block.url || ""
                          }
                          onChange={(e) =>
                            updateBlock(
                              block.id,
                              "url",
                              e.target.value
                            )
                          }
                          placeholder="Image URL"
                          className="w-full rounded-lg border bg-white px-4 py-3"
                        />

                        <input
                          value={
                            block.title ||
                            ""
                          }
                          onChange={(e) =>
                            updateBlock(
                              block.id,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="Image caption"
                          className="w-full rounded-lg border bg-white px-4 py-3"
                        />
                      </div>
                    )}

                    {/* YOUTUBE / SOCIAL */}

                    {(block.type ===
                      "youtube" ||
                      block.type ===
                        "instagram" ||
                      block.type ===
                        "facebook") && (
                      <input
                        value={
                          block.url || ""
                        }
                        onChange={(e) =>
                          updateBlock(
                            block.id,
                            "url",
                            e.target.value
                          )
                        }
                        placeholder="Paste URL here..."
                        className="w-full rounded-lg border bg-white px-4 py-3"
                      />
                    )}

                    {/* EMBED */}

                    {block.type ===
                      "embed" && (
                      <textarea
                        value={
                          block.content ||
                          ""
                        }
                        onChange={(e) =>
                          updateBlock(
                            block.id,
                            "content",
                            e.target.value
                          )
                        }
                        rows={5}
                        placeholder="Paste official embed code..."
                        className="w-full rounded-lg border bg-white px-4 py-3"
                      />
                    )}

                    {/* EXTERNAL LINK */}

                    {block.type ===
                      "external_link" && (
                      <div className="space-y-3">
                        <input
                          value={
                            block.title ||
                            ""
                          }
                          onChange={(e) =>
                            updateBlock(
                              block.id,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="Link text"
                          className="w-full rounded-lg border bg-white px-4 py-3"
                        />

                        <input
                          value={
                            block.url || ""
                          }
                          onChange={(e) =>
                            updateBlock(
                              block.id,
                              "url",
                              e.target.value
                            )
                          }
                          placeholder="https://example.com"
                          className="w-full rounded-lg border bg-white px-4 py-3"
                        />
                      </div>
                    )}

                    {/* INTERNAL LINK */}

                    {block.type ===
                      "internal_link" && (
                      <div className="space-y-3">
                        <input
                          value={
                            block.title ||
                            ""
                          }
                          onChange={(e) =>
                            updateBlock(
                              block.id,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="Link text"
                          className="w-full rounded-lg border bg-white px-4 py-3"
                        />

                        <select
                          value={
                            block.articleId ||
                            ""
                          }
                          onChange={(e) =>
                            updateBlock(
                              block.id,
                              "articleId",
                              Number(
                                e.target.value
                              )
                            )
                          }
                          className="w-full rounded-lg border bg-white px-4 py-3"
                        >
                          <option value="">
                            Select article
                          </option>

                          {articles.map(
                            (article) => (
                              <option
                                key={
                                  article.id
                                }
                                value={
                                  article.id
                                }
                              >
                                {article.title}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

            {/* ADD BLOCKS */}

            <div className="mt-5 rounded-xl border bg-white p-4">
              <p className="mb-3 font-semibold">
                Add Content
              </p>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    [
                      "text",
                      "📝 Text",
                    ],
                    [
                      "image",
                      "📸 Image",
                    ],
                    [
                      "youtube",
                      "▶️ YouTube",
                    ],
                    [
                      "instagram",
                      "📱 Instagram",
                    ],
                    [
                      "facebook",
                      "📘 Facebook",
                    ],
                    [
                      "embed",
                      "🔲 Embed",
                    ],
                    [
                      "internal_link",
                      "🔗 Internal Link",
                    ],
                    [
                      "external_link",
                      "🌐 External Link",
                    ],
                  ] as [
                    BlockType,
                    string
                  ][]
                ).map(
                  ([type, label]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        addBlock(type)
                      }
                      className="rounded-lg border px-4 py-2"
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* CATEGORY */}

          <div>
            <label className="mb-2 block font-semibold">
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-4 py-3"
            >
              <option>हिसार</option>
              <option>हरियाणा</option>
              <option>अपराध</option>
              <option>राजनीति</option>
              <option>खेल</option>
              <option>कृषि</option>
              <option>मनोरंजन</option>
              <option>बॉलीवुड</option>
            </select>
          </div>

          {/* AUTHOR */}

          <div>
            <label className="mb-2 block font-semibold">
              Author
            </label>

            <input
              value={author}
              onChange={(e) =>
                setAuthor(
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* TAGS */}

          <div>
            <label className="mb-2 block font-semibold">
              Tags
            </label>

            <input
              value={tags}
              onChange={(e) =>
                setTags(e.target.value)
              }
              placeholder="हिसार, हरियाणा, न्यूज़"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <hr />

          {/* SEO */}

          <h3 className="text-xl font-bold">
            SEO Settings
          </h3>

          <input
            value={seoTitle}
            onChange={(e) =>
              setSeoTitle(
                e.target.value
              )
            }
            placeholder="SEO Title"
            className="w-full rounded-lg border px-4 py-3"
          />

          <textarea
            value={seoDescription}
            onChange={(e) =>
              setSeoDescription(
                e.target.value
              )
            }
            rows={3}
            placeholder="SEO Description"
            className="w-full rounded-lg border px-4 py-3"
          />

          <input
            value={seoKeywords}
            onChange={(e) =>
              setSeoKeywords(
                e.target.value
              )
            }
            placeholder="SEO Keywords"
            className="w-full rounded-lg border px-4 py-3"
          />

          {/* STATUS */}

          <div>
            <label className="mb-2 block font-semibold">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-4 py-3"
            >
              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>
            </select>
          </div>

          {/* MESSAGE */}

          {message && (
            <div className="rounded-lg bg-gray-100 p-4 font-semibold">
              {message}
            </div>
          )}

          {/* PREVIEW */}

          <button
            type="button"
            onClick={() =>
              setShowPreview(true)
            }
            className="w-full rounded-lg border-2 border-red-600 px-6 py-4 font-bold text-red-600 hover:bg-red-50"
          >
            👁️ Preview News
          </button>

          {/* PUBLISH */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 px-6 py-4 font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading
              ? "Publishing..."
              : "Publish Article"}
          </button>
        </form>

        {/* PREVIEW */}

        {showPreview && (
          <div className="mt-8 rounded-xl border bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                👁️ News Preview
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowPreview(false)
                }
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Close Preview
              </button>
            </div>

            {heroImage && (
              <Image
                src={heroImage}
                alt={title}
                className="mb-6 h-auto w-full rounded-xl"
              />
            )}

            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              {title ||
                "Headline यहाँ दिखाई जाएगी"}
            </h1>

            <p className="mt-3 text-sm font-semibold text-red-600">
              {category}
            </p>

            {summary && (
              <p className="mt-4 text-lg leading-8 text-gray-600">
                {summary}
              </p>
            )}

            <div className="mt-8 space-y-6">
              {blocks.map((block) => {
                if (
                  block.type ===
                  "text"
                ) {
                  return (
                    <p
                      key={block.id}
                      className="whitespace-pre-line text-lg leading-8 text-gray-800"
                    >
                      {block.content}
                    </p>
                  );
                }

                if (
                  block.type ===
                  "image"
                ) {
                  return (
                    <figure
                      key={block.id}
                    >
                      {block.url && (
                        <Image
                          src={
                            block.url
                          }
                          alt={
                            block.title ||
                            ""
                          }
                          className="w-full rounded-xl"
                        />
                      )}

                      {block.title && (
                        <figcaption className="mt-2 text-center text-sm text-gray-500">
                          {
                            block.title
                          }
                        </figcaption>
                      )}
                    </figure>
                  );
                }

                if (
                  block.type ===
                  "youtube"
                ) {
                  if (
                    !block.url?.trim()
                  ) {
                    return (
                      <div
                        key={
                          block.id
                        }
                        className="rounded-xl border bg-gray-50 p-5 text-gray-500"
                      >
                        ▶️ YouTube URL
                        डालें
                      </div>
                    );
                  }

                  return (
                    <div
                      key={
                        block.id
                      }
                      className="aspect-video overflow-hidden rounded-xl bg-black"
                    >
                      <iframe
                        src={getYouTubeEmbedUrl(
                          block.url
                        )}
                        className="h-full w-full"
                        allowFullScreen
                        title="YouTube video"
                      />
                    </div>
                  );
                }

                if (
                  block.type ===
                  "instagram"
                ) {
                  return (
                    <div
                      key={
                        block.id
                      }
                      className="rounded-xl border bg-white p-5"
                    >
                      <div className="mb-3 font-bold">
                        📱 Instagram
                      </div>

                      <a
                        href={
                          block.url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-blue-600"
                      >
                        {
                          block.url
                        }
                      </a>
                    </div>
                  );
                }

                if (
                  block.type ===
                  "facebook"
                ) {
                  return (
                    <div
                      key={
                        block.id
                      }
                      className="rounded-xl border bg-white p-5"
                    >
                      <div className="mb-3 font-bold">
                        📘 Facebook
                      </div>

                      <a
                        href={
                          block.url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-blue-600"
                      >
                        {
                          block.url
                        }
                      </a>
                    </div>
                  );
                }

                if (
                  block.type ===
                  "embed"
                ) {
                  return (
                    <div
                      key={
                        block.id
                      }
                      className="rounded-xl border p-4"
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

                if (
                  block.type ===
                  "internal_link"
                ) {
                  const article =
                    articles.find(
                      (item) =>
                        item.id ===
                        block.articleId
                    );

                  return (
                    <div
                      key={
                        block.id
                      }
                    >
                      {article && (
                        <a
                          href={`/news/${article.slug}`}
                          className="font-semibold text-red-600 underline"
                        >
                          🔗{" "}
                          {block.title ||
                            article.title}
                        </a>
                      )}
                    </div>
                  );
                }

                if (
                  block.type ===
                  "external_link"
                ) {
                  return (
                    <div
                      key={
                        block.id
                      }
                    >
                      <a
                        href={
                          block.url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-600 underline"
                      >
                        🌐{" "}
                        {block.title ||
                          block.url}
                      </a>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            <div className="mt-8 border-t pt-4 text-sm text-gray-500">
              By {author}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
