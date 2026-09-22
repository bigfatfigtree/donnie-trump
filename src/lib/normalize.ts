export function normalizeHeadline(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/-$/, "");
  return base || "story";
}

export function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function publisherNameFromDomain(domain: string): string {
  const known: Record<string, string> = {
    "nytimes.com": "The New York Times",
    "washingtonpost.com": "The Washington Post",
    "wsj.com": "The Wall Street Journal",
    "apnews.com": "Associated Press",
    "reuters.com": "Reuters",
    "bloomberg.com": "Bloomberg",
    "politico.com": "Politico",
    "cnn.com": "CNN",
    "nbcnews.com": "NBC News",
    "abcnews.go.com": "ABC News",
    "cbsnews.com": "CBS News",
    "theguardian.com": "The Guardian",
    "latimes.com": "Los Angeles Times",
    "usatoday.com": "USA Today",
    "npr.org": "NPR",
    "thehill.com": "The Hill",
    "axios.com": "Axios",
    "theatlantic.com": "The Atlantic",
    "newyorker.com": "The New Yorker",
    "time.com": "TIME",
    "forbes.com": "Forbes",
    "ft.com": "Financial Times",
    "bbc.com": "BBC",
    "bbc.co.uk": "BBC",
  };
  if (known[domain]) return known[domain];
  const stem = domain.split(".")[0] || domain;
  return stem.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function presidentialTerm(publishedAt: Date): "first" | "second" | null {
  const t = publishedAt.getTime();
  const firstStart = Date.parse("2017-01-20T12:00:00Z");
  const firstEnd = Date.parse("2021-01-20T17:00:00Z");
  const secondStart = Date.parse("2025-01-20T17:00:00Z");
  if (t >= firstStart && t < firstEnd) return "first";
  if (t >= secondStart) return "second";
  return null;
}

export function tokenSet(text: string): Set<string> {
  return new Set(
    normalizeHeadline(text)
      .split(" ")
      .filter((w) => w.length > 2)
  );
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  return inter / (a.size + b.size - inter);
}
