import type { Metadata } from "next";

const configuredSiteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://scout.app";

export const SITE_URL = configuredSiteUrl.startsWith("http")
  ? configuredSiteUrl
  : `https://${configuredSiteUrl}`;
export const SITE_NAME = "Scout";
export const SITE_TITLE = "Scout | Small Business Influencer Marketplace";
export const SITE_DESCRIPTION =
  "Scout helps small businesses connect with micro-influencer creators for paid and in-kind collaborations.";
export const SITE_KEYWORDS = [
  "micro-influencer marketplace",
  "creator marketplace",
  "small business marketing",
  "local creator campaigns",
  "influencer collaborations",
  "UGC creators",
];

export const DEFAULT_OG_IMAGE = "/og/scout-og-marketplace.png";
export const DEFAULT_TWITTER_IMAGE = "/twitter-image.png";

export const NO_INDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function publicPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} preview image`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl("/android-chrome-512x512.png"),
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: SITE_DESCRIPTION,
};
