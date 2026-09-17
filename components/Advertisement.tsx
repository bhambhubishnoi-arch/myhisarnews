import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

type AdvertisementProps = {
  position: string;
  className?: string;
};

type Advertisement = {
  id: number;
  sponsor_name: string;
  title: string | null;
  image_url: string;
  target_url: string | null;
};

export default async function Advertisement({
  position,
  className = "",
}: AdvertisementProps) {
  const supabase = await createClient();

  const now = new Date().toISOString();

  const { data: ads, error } = await supabase
    .from("advertisements")
    .select(
      "id, sponsor_name, title, image_url, target_url"
    )
    .contains("position", [position])
    .eq("is_active", true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order("priority", {
      ascending: false,
    })
    .limit(1);

  if (error) {
    console.error(
      "ADVERTISEMENT ERROR:",
      error.message
    );

    return null;
  }

  const ad = ads?.[0] as Advertisement | undefined;

  if (!ad || !ad.image_url) {
    return null;
  }

  const content = (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm ${className}`}
    >
      <Image
        src={ad.image_url}
        alt={
          ad.title ||
          ad.sponsor_name ||
          "Advertisement"
        }
        width={1200}
        height={300}
        unoptimized
        className="block h-[100px] w-full object-cover md:h-[180px]"
      />
    </div>
  );

  if (ad.target_url) {
    return (
      <a
        href={ad.target_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label={
          ad.title ||
          ad.sponsor_name ||
          "Advertisement"
        }
      >
        {content}
      </a>
    );
  }

  return content;
}