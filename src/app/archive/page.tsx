import { Masthead } from "@/components/layout/Masthead";
import { getArchiveArticles } from "@/lib/data";
import Link from "next/link";

export const revalidate = 120;
export const metadata = { title: "Archive" };

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ term?: string; type?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page || "1");
  const { articles, total, usingSeed } = await getArchiveArticles({
    term: params.term,
    type: params.type,
    q: params.q,
    page,
  });

  return (
    <>
      <Masthead />
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          <aside className="md:w-56 shrink-0">
            <h2 className="meta mb-4">Filters</h2>
            <div className="space-y-6 text-sm">
              <form action="/archive" className="space-y-2">
                <input
                  type="search"
                  name="q"
                  defaultValue={params.q || ""}
                  placeholder="Search headlines"
                  className="w-full border border-[var(--rule)] bg-[var(--surface)] px-2 py-1.5 text-sm"
                />
                <button className="text-xs underline" type="submit">Search</button>
              </form>
              <div>
                <p className="font-medium mb-2">Term</p>
                <ul className="space-y-1 text-[var(--ink-muted)]">
                  <li><Link href="/archive?term=first" className="hover:text-[var(--ink)]">First Term</Link></li>
                  <li><Link href="/archive?term=second" className="hover:text-[var(--ink)]">Second Term</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Article type</p>
                <ul className="space-y-1 text-[var(--ink-muted)]">
                  {["news", "analysis", "opinion", "editorial", "fact-check", "investigation", "legal"].map((t) => (
                    <li key={t}>
                      <Link href={`/archive?type=${t}`} className="hover:text-[var(--ink)] capitalize">
                        {t.replace("-", " ")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-6">
              <h1 className="font-serif text-3xl font-bold">Archive</h1>
              <p className="meta">{total.toLocaleString()} qualifying articles{usingSeed ? " (seed fallback)" : ""}</p>
            </div>
            <div className="space-y-6">
              {articles.map((a) => (
                <article key={a.id} className="border-b border-[var(--rule)] pb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="meta">{a.publisher_name}</span>
                    <span className="meta">
                      {new Date(a.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="meta capitalize">{a.article_type}</span>
                  </div>
                  <h2 className="font-serif text-xl font-bold leading-snug">
                    <a href={a.canonical_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {a.headline}
                    </a>
                  </h2>
                  {a.summary && (
                    <p className="mt-2 text-sm text-[var(--ink-muted)] line-clamp-2">{a.summary}</p>
                  )}
                </article>
              ))}
            </div>
            <div className="mt-8 flex gap-4 text-sm">
              {page > 1 && (
                <Link href={`/archive?page=${page - 1}`} className="underline">Previous</Link>
              )}
              {articles.length >= 25 && (
                <Link href={`/archive?page=${page + 1}`} className="underline">Next</Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
