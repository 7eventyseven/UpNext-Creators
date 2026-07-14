import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://upnextcreators.com";
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${base}/subscribe`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/bookings`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}
