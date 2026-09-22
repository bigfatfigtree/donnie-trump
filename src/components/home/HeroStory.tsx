import Link from "next/link";
import type { Article } from "@/types";

interface Props {
  article: Article;
}

const typeBadge: Record<string, string> = {
  news: "badge-news",
  analysis: "badge-analysis",
  opinion: "badge-opinion",
  editorial: "badge-editorial",
  "fact-check": "badge-factcheck",
  investigation: "badge-investigation",
  legal: "badge-legal",
};

export function HeroStory({ article }: Props) {
  const published = new Date(article.published_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="border-b border-[var(--rule)]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium ${
                typeBadge[article.article_type] || "badge-news"
              }`}
            >
              {article.article_type.replace("-", " ")}
            </span>
            <span className="meta">{article.publisher_name}</span>
            <span className="text-[var(--rule)]">·</span>
            <time className="meta" dateTime={article.published_at}>
              {published}
            </time>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.15] tracking-tight text-[var(--ink)]">
            <a
              href={article.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline decoration-1 underline-offset-4"
            >
              {article.headline}
            </a>
          </h2>

          {article.summary && (
            <p className="mt-5 text-lg md:text-xl leading-relaxed text-[var(--ink-muted)] max-w-3xl">
              {article.summary}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <a
              href={article.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2 hover:text-[var(--accent)]"
            >
              Read at {article.publisher_name} →
            </a>
            {article.categories && article.categories.length > 0 && (
              <div className="flex gap-2">
                {article.categories.map((c) => (
                  <Link
                    key={c}
                    href={`/archive?category=${c}`}
                    className="meta hover:text-[var(--ink)]"
                  >
                    {c.replace("-", " ")}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
