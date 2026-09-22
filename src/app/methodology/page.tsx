import { Masthead } from "@/components/layout/Masthead";
import Link from "next/link";

export const metadata = {
  title: "Methodology",
};

export default function MethodologyPage() {
  return (
    <>
      <Masthead />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-2">
          Methodology
        </h1>
        <p className="text-[var(--ink-muted)] mb-10">
          How DONNIE TRUMP collects, classifies, and presents coverage.
        </p>

        <section className="prose prose-neutral max-w-none space-y-8 text-[15px] leading-relaxed">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">What this archive is</h2>
            <p>
              DONNIE TRUMP is a searchable historical repository of published journalism
              that is critical, adverse, or negative in subject matter regarding Donald
              Trump during his two presidential terms (January 20, 2017 – January 20, 2021
              and January 20, 2025 – present).
            </p>
            <p className="mt-3">
              It does not write original political accusations. It does not present
              generated opinions as facts. Every headline remains the exact published
              headline of the original publisher, with full attribution.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">What is included</h2>
            <p>
              Coverage centered on criticism, adverse economic developments, legal
              setbacks, investigations, ethics concerns, policy backlash, negative
              polling, documented negative consequences of policy, fact checks identifying
              false or misleading claims, and similar materially critical or adverse
              reporting.
            </p>
            <p className="mt-3">
              Inclusion reflects the nature of the published coverage. It is not an
              independent determination that every claim inside an article is true.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">What is not included</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Routine neutral process stories without critical framing</li>
              <li>Positive or celebratory coverage</li>
              <li>Full-text copyrighted articles (we store metadata, headline, URL, and short neutral summaries only)</li>
              <li>Content behind paywalls that we cannot access via permitted means</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">How articles are discovered</h2>
            <p>
              Primary discovery uses GDELT and optional RSS/Atom feeds from recognized
              publishers. Queries are restricted to the relevant presidential periods and
              broken into manageable time windows. We respect robots.txt and publisher terms.
              We do not evade paywalls or bypass technical protections.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">Classification</h2>
            <p>
              A two-stage system is used. Stage one discovers broad Trump-related coverage.
              Stage two determines whether the item qualifies as critical/adverse coverage.
              Classification examines headline, description, available metadata, and source
              tone signals. Possible results: QUALIFY, DO_NOT_QUALIFY, REVIEW.
            </p>
            <p className="mt-3">
              When an Anthropic API key is present, an optional LLM classifier may be used.
              The prompt is politically neutral and asks only whether the article itself
              constitutes materially critical or adverse coverage. It never asks the model
              whether Trump is good, bad, successful, or likable.
            </p>
            <p className="mt-3">
              Without an LLM key, the system falls back to GDELT tone scores plus transparent
              keyword and metadata rules. Low-confidence items go to REVIEW for human
              inspection in the admin interface.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">Deduplication</h2>
            <p>
              Syndication creates massive duplication. We deduplicate on canonical URL,
              normalized headline, publisher, and publication timestamp, with similarity
              matching. One underlying news event may produce many distinct publisher
              articles; these are grouped into story clusters so the interface can show
              “Covered by N outlets.”
            </p>
            <p className="mt-3">
              The master archive count primarily counts unique qualifying articles, not
              scraper duplicates.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">Data sources for metrics</h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>CNN Poll of Polls</strong> — Job approval figures are taken from
                CNN’s published Poll of Polls. If the page structure changes or data is
                unavailable, the site displays “CNN DATA TEMPORARILY UNAVAILABLE” rather
                than substituting another pollster. Manual override is available in admin.
              </li>
              <li>
                <strong>National Debt</strong> — U.S. Treasury Fiscal Data “Debt to the
                Penny” dataset. Updated on business days. We do not invent a continuous
                fake clock.
              </li>
              <li>
                <strong>Gasoline</strong> — U.S. Energy Information Administration national
                average retail price for regular gasoline (generally weekly).
              </li>
              <li>
                <strong>Grocery prices</strong> — Bureau of Labor Statistics CPI-U Food at
                Home index. This is an index, not the exact dollar cost of a universal
                basket.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">Article types</h2>
            <p>
              News, Analysis, Opinion, Editorial, Polling, Fact Check, Investigation, and
              Legal are distinguished visually throughout the site so readers can see the
              nature of each item at a glance.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">Known limitations</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>GDELT coverage is strong but not exhaustive of every local outlet.</li>
              <li>Paywalled content may appear only as metadata.</li>
              <li>Classification is probabilistic; REVIEW queue exists for edge cases.</li>
              <li>Historical backfill of multi-year periods requires significant compute and time.</li>
              <li>CNN Poll of Polls does not offer a stable public API; ingestion is conservative.</li>
            </ul>
          </div>

          <div className="pt-6 border-t border-[var(--rule)]">
            <Link href="/" className="text-sm font-medium underline">
              ← Back to DONNIE TRUMP
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
