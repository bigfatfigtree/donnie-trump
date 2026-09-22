import Link from "next/link";
import type { Article } from "@/types";

interface Props {
  articles: Article[];
}

const typeBadge: Record<string, string> = {
  news: "badge-news",
  analysis: "badge-analysis",
  opinion: "badge-opinion",
  editorial: "badge-editorial",
  "fact-check": "badge-factcheck",
  investigation: "badge-investigation",
  legal: "badge-legal",
  polling: "badge-news",
};

function Card({ article, size }: { article: Article; size: "lg" | "md" | "sm" }) {
  const published = new Date(article.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (size === "lg") {
    return (
      <article className="col-span-12 md:col-span-8 lg:col-span-7 border-b border-[var(--rule)] pb-8 md:border-b-0 md:pb-0 md:pr-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${typeBadge[article.article_type] || "badge-news"}`}>
            {article.article_type.replace("-", " ")}
          </span>
          <span className="meta">{article.publisher_name}</span>
          <span className="meta">{published}</span>
        </div>
        <h3 className="font-serif text-2xl md:text-3xl font-bold leading-snug tracking-tight">
          <a
            href={article.canonical_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline decoration-1 underline-offset-2"
          >
            {article.headline}
          </a>
        </h3>
        {article.summary && (
          <p className="mt-3 text-base leading-relaxed text-[var(--ink-muted)] line-clamp-3">
            {article.summary}
          </p>
        )}
      </article>
    );
  }

  if (size === "md") {
    return (
      <article className="col-span-12 sm:col-span-6 lg:col-span-5 border-b border-[var(--rule)] pb-6 sm:border-b-0 sm:pb-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${typeBadge[article.article_type] || "badge-news"}`}>
            {article.article_type.replace("-", " ")}
          </span>
          <span className="meta">{article.publisher_name}</span>
        </div>
        <h3 className="font-serif text-xl font-bold leading-snug">
          <a
            href={article.canonical_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline decoration-1 underline-offset-2"
          >
            {article.headline}
          </a>
        </h3>
        {article.summary && (
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)] line-clamp-2">
            {article.summary}
          </p>
        )}
        <p className="mt-2 meta">{published}</p>
      </article>
    );
  }

  // sm — text-only column
  return (
    <article className="col-span-12 sm:col-span-6 lg:col-span-4 border-b border-[var(--rule)] pb-4 last:border-0">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="meta shrink-0">{article.publisher_name}</span>
        <span className="meta">{published}</span>
      </div>
      <h3 className="font-serif text-base font-bold leading-snug">
        <a
          href={article.canonical_url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline decoration-1 underline-offset-2"
        >
          {article.headline}
        </a>
      </h3>
    </article>
  );
}

export function MagazineGrid({ articles }: Props) {
  // Dramatic size variation: first large, next two medium, rest small
  const [hero, ...rest] = articles;
  const medium = rest.slice(0, 2);
  const small = rest.slice(2);

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="font-serif text-2xl font-bold tracking-tight">Latest</h2>
        <Link href="/archive" className="meta hover:text-[var(--ink)]">
          View full archive →
        </Link>
      </div>

      <div className="magazine-grid">
        {hero && <Card article={hero} size="lg" />}
        {medium.map((a) => (
          <Card key={a.id} article={a} size="md" />
        ))}
      </div>

      {small.length > 0 && (
        <>
          <hr className="editorial-rule my-10" />
          <div className="magazine-grid">
            {small.map((a) => (
              <Card key={a.id} article={a} size="sm" />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
