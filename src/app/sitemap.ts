import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://donnietrump.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: base + "/archive", lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: base + "/first-term", lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: base + "/second-term", lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
    { url: base + "/methodology", lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];
}
