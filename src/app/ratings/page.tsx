import { Masthead } from "@/components/layout/Masthead";
import {
  getArchiveCounts,
  getLatestDebt,
  getLatestGas,
  getLatestGroceries,
  getLatestPolling,
} from "@/lib/data";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Trump ratings: approval, disapproval, debt, gas and grocery prices",
  description:
    "Current Donald Trump overall approval 31 percent and disapproval 69 percent, plus U.S. public debt, average gasoline price, grocery CPI, and archived headline count. Sources linked.",
  alternates: { canonical: "https://donnietrump.com/ratings" },
};

function money(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)} trillion`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)} billion`;
  return `$${n.toLocaleString()}`;
}

export default async function RatingsPage() {
  const [polling, debt, gas, groceries, counts] = await Promise.all([
    getLatestPolling(),
    getLatestDebt(),
    getLatestGas(),
    getLatestGroceries(),
    getArchiveCounts(),
  ]);

  const approve = polling.approval ?? 31;
  const disapprove = polling.disapproval ?? 69;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Donald Trump's current overall approval rating?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Overall approval is ${approve}% and overall disapproval is ${disapprove}%. Source: ${polling.pollster}.`,
        },
      },
      {
        "@type": "Question",
        name: "What is the current U.S. public debt on Donnie Trump?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Total U.S. public debt is ${money(debt.value)}. Source: U.S. Treasury.`,
        },
      },
      {
        "@type": "Question",
        name: "What is the U.S. average gasoline price?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `U.S. average regular gasoline is $${gas.value.toFixed(2)} per gallon. Source: U.S. Energy Information Administration.`,
        },
      },
      {
        "@type": "Question",
        name: "Where is the Trump news headline archive?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `DonnieTrump.com archives ${counts.total.toLocaleString()} qualifying published headlines about Donald Trump. Same site: diaperdon.co and trumpratings.com.`,
        },
      },
    ],
  };

  return (
    <>
      <Masthead />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <p className="meta">Ratings</p>
        <h1 className="font-serif text-4xl font-bold tracking-tight mt-2">
          Current Trump numbers
        </h1>
        <p className="mt-3 text-[var(--ink-muted)]">
          One page of the figures this site displays. Each number is attributed
          to its source. Also published at diaperdon.co and trumpratings.com.
        </p>

        <section className="mt-10 space-y-8">
          <div>
            <h2 className="font-serif text-2xl font-bold">Overall approval</h2>
            <p className="mt-2 text-4xl font-serif font-bold text-[#c41e3a]">
              {disapprove}% disapproval
            </p>
            <p className="mt-1 text-lg">{approve}% approval</p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              {polling.period_label} ·{" "}
              <a className="underline" href={polling.source_url || "https://www.cnn.com/polling/approval/trump-cnn-poll-of-polls"} target="_blank" rel="noopener noreferrer">
                Source
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold">U.S. public debt</h2>
            <p className="mt-2 text-4xl font-serif font-bold text-[#c41e3a]">{money(debt.value)}</p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              <a className="underline" href={debt.source_url || "https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/"} target="_blank" rel="noopener noreferrer">
                Source: U.S. Treasury
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold">Gasoline</h2>
            <p className="mt-2 text-4xl font-serif font-bold text-[#c41e3a]">
              ${gas.value.toFixed(2)} / gal
            </p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              <a className="underline" href={gas.source_url || "https://www.eia.gov/petroleum/gasdiesel/"} target="_blank" rel="noopener noreferrer">
                Source: EIA
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold">Grocery prices (Food at Home CPI)</h2>
            <p className="mt-2 text-4xl font-serif font-bold text-[#c41e3a]">
              {groceries.value.toFixed(1)}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              <a className="underline" href={groceries.source_url || "https://www.bls.gov/cpi/"} target="_blank" rel="noopener noreferrer">
                Source: BLS
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold">Headlines archived</h2>
            <p className="mt-2 text-4xl font-serif font-bold text-[#c41e3a]">
              {counts.total.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Qualifying published articles stored on this site.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
