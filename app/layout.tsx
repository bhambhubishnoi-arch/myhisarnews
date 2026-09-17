import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://myhisarnews.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "MyHisarNews",
    template: "%s | MyHisarNews",
  },

  description:
    "Hisar aur Haryana ki latest news, breaking news, local news, politics, crime, education, sports aur entertainment updates.",

  keywords: [
    "Hisar News",
    "Hisar News Today",
    "Haryana News",
    "Hisar Breaking News",
    "Haryana Breaking News",
    "MyHisarNews",
    "Hisar Local News",
  ],

  applicationName: "MyHisarNews",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    siteName: "MyHisarNews",
    title: "MyHisarNews",
    description:
      "Hisar aur Haryana ki latest news aur breaking updates.",
    url: siteUrl,
    images: [
      {
        url: "/logo.jpeg",
        width: 1200,
        height: 630,
        alt: "MyHisarNews",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "MyHisarNews",
    description:
      "Hisar aur Haryana ki latest news aur breaking updates.",
    images: ["/logo.jpeg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}
