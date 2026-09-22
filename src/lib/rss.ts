import type { GdeltDoc } from "./gdelt";

const FEEDS = [
  "https://feeds.reuters.com/reuters/topNews",
  "https://feeds.reuters.com/Reuters/PoliticsNews",
  "https://rsshub.app/apnews/topics/politics",
  "https://feeds.npr.org/1001/rss.xml",
  "https://rss.politico.com/politics-news.xml",
  "https://thehill.com/news/feed/",
  "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
  "https://www.theguardian.com/us-news/rss",
  "https://www.cbsnews.com/latest/rss/politics",
  "https://abcnews.go.com/abcnews/politicsheadlines",
];

const SUBJECT = /\b(trump|donald trump|white house|trump administration)\b/i;

function decode(xml: string): string {
  return xml
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]).trim() : "";
}

export async function fetchRssDocs(): Promise<GdeltDoc[]> {
  const out: GdeltDoc[] = [];
  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed, {
        headers: { "user-agent": "DONNIE-TRUMP-archive/1.1" },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = xml.split(/<item[\s>]/i).slice(1);
      for (const raw of items) {
        const title = tag(raw, "title");
        const url = tag(raw, "link") || (raw.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1] || "");
        const date = tag(raw, "pubDate") || tag(raw, "published");
        if (!title || !url) continue;
        if (!SUBJECT.test(title)) continue;
        out.push({
          url: url.trim(),
          title: title.replace(/\s+/g, " ").trim(),
          seendate: date ? new Date(date).toISOString() : new Date().toISOString(),
          domain: new URL(url).hostname.replace(/^www\./, ""),
        });
      }
    } catch {
      // skip broken feed
    }
  }
  const seen = new Set<string>();
  return out.filter((d) => {
    if (seen.has(d.url)) return false;
    seen.add(d.url);
    return true;
  });
}
