export interface GdeltDoc {
  url: string;
  title: string;
  seendate?: string;
  socialimage?: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
  tone?: number;
}

const DEFAULT_API = "https://api.gdeltproject.org/api/v2/doc/doc";

function parseSeenDate(raw?: string): string {
  if (!raw) return new Date().toISOString();
  // GDELT format often YYYYMMDDTHHMMSSZ
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (m) {
    return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`).toISOString();
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export async function fetchGdeltDocs(params?: {
  query?: string;
  timespan?: string;
  maxrecords?: number;
}): Promise<GdeltDoc[]> {
  const api = process.env.GDELT_DOC_API || DEFAULT_API;
  const query = params?.query || '(Trump OR "Donald Trump" OR "Trump administration") sourcelang:english';
  const timespan = params?.timespan || "3h";
  const maxrecords = params?.maxrecords ?? 75;
  const url = `${api}?query=${encodeURIComponent(query)}&mode=ArtList&maxrecords=${maxrecords}&timespan=${timespan}&sort=DateDesc&format=json`;

  const res = await fetch(url, {
    headers: { "user-agent": "THE-RECORD-archive/1.0" },
  });
  if (!res.ok) {
    throw new Error(`GDELT ${res.status}`);
  }
  const text = await res.text();
  if (!text.trim()) return [];
  let json: { articles?: Array<Record<string, unknown>> };
  try {
    json = JSON.parse(text);
  } catch {
    return [];
  }
  const articles = json.articles || [];
  return articles
    .map((a) => ({
      url: String(a.url || ""),
      title: String(a.title || ""),
      seendate: parseSeenDate(String(a.seendate || "")),
      socialimage: a.socialimage ? String(a.socialimage) : undefined,
      domain: a.domain ? String(a.domain) : undefined,
      language: a.language ? String(a.language) : undefined,
      sourcecountry: a.sourcecountry ? String(a.sourcecountry) : undefined,
      tone: a.tone != null ? Number(a.tone) : undefined,
    }))
    .filter((a) => a.url && a.title);
}
