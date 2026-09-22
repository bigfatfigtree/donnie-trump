import { Masthead } from "@/components/layout/Masthead";
import { DataStrip } from "@/components/home/DataStrip";
import { PhotoHero } from "@/components/home/PhotoHero";
import { MagazineGrid } from "@/components/home/MagazineGrid";
import {
  getArchiveCounts,
  getHomepageArticles,
  getLatestDebt,
  getLatestGas,
  getLatestGroceries,
  getLatestPolling,
} from "@/lib/data";
import Link from "next/link";

export const revalidate = 300;

export default async function HomePage() {
  const [articles, polling, debt, gas, groceries, archiveCount] = await Promise.all([
    getHomepageArticles(),
    getLatestPolling(),
    getLatestDebt(),
    getLatestGas(),
    getLatestGroceries(),
    getArchiveCounts(),
  ]);

  return (
    <>
      <Masthead />
      <PhotoHero />
      <DataStrip
        polling={polling}
        debt={debt}
        gas={gas}
        groceries={groceries}
        archiveCount={archiveCount}
      />
      <MagazineGrid articles={articles} />

      <section className="border-t border-[var(--rule)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
          <p className="meta mb-4">Browse by topic</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              "Policy",
              "Economy",
              "Immigration",
              "Foreign Policy",
              "Courts & Legal",
              "Business",
              "Ethics & Government",
              "Congress",
              "Public Opinion",
              "Administration",
              "Investigations",
              "Fact Checks",
              "Opinion & Editorial",
            ].map((label) => (
              <Link
                key={label}
                href={`/archive?category=${label.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                className="text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--rule)] mt-auto">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <p className="font-serif text-xl font-bold">DONNIE TRUMP</p>
              <p className="mt-1 text-sm text-[var(--ink-muted)] max-w-md">
                A living historical archive of critical and negative news coverage
                published during the Trump presidencies. All headlines and claims
                remain attributed to their original publishers.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/methodology" className="hover:underline">Methodology</Link>
              <Link href="/archive" className="hover:underline">Full Archive</Link>
              <Link href="/first-term" className="hover:underline">First Term</Link>
              <Link href="/second-term" className="hover:underline">Second Term</Link>
            </div>
          </div>
          <p className="mt-8 text-[11px] text-[var(--ink-muted)]">
            Inclusion in this archive reflects the nature of published coverage and
            is not an independent determination that every claim in an article is true.
            © {new Date().getFullYear()} DONNIE TRUMP
          </p>
        </div>
      </footer>
    </>
  );
}
