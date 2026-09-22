import Link from "next/link";
import type { PollingMetric, EconomicMetric } from "@/types";
import { SEED_ARCHIVE_COUNT } from "@/lib/seed";

interface Props {
  polling: PollingMetric;
  debt: EconomicMetric;
  gas: EconomicMetric;
  groceries: EconomicMetric;
  archiveCount?: typeof SEED_ARCHIVE_COUNT;
}

function formatDebt(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  return `$${n.toLocaleString()}`;
}

export function DataStrip({ polling, debt, gas, groceries, archiveCount = SEED_ARCHIVE_COUNT }: Props) {
  return (
    <section className="border-b border-[var(--rule)] bg-[var(--surface)]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        {/* Primary metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* CNN Poll of Polls */}
          <div className="text-center md:text-left">
            <p className="meta mb-2">CNN Poll of Polls · Job Approval</p>
            {polling.status === "unavailable" ? (
              <p className="font-serif text-xl text-[var(--ink-muted)]">
                CNN DATA TEMPORARILY UNAVAILABLE
              </p>
            ) : (
              <>
                <div className="flex items-baseline justify-center md:justify-start gap-3">
                  <span className="font-serif text-5xl md:text-6xl numeral font-bold tracking-tight">
                    {polling.approval?.toFixed(0)}%
                  </span>
                  <span className="text-sm text-[var(--ink-muted)]">
                    approval
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-[var(--ink-muted)]">
                  {polling.disapproval != null && (
                    <span>{polling.disapproval.toFixed(0)}% disapproval</span>
                  )}
                  {polling.net != null && (
                    <span>
                      Net {polling.net > 0 ? "+" : ""}
                      {polling.net.toFixed(0)}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-[var(--ink-muted)]">
                  {polling.period_label} ·{" "}
                  <a
                    href={polling.source_url || "https://www.cnn.com/politics/polls"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[var(--ink)]"
                  >
                    Source: CNN
                  </a>
                </p>
              </>
            )}
          </div>

          {/* Critical Coverage Count */}
          <div className="text-center border-y md:border-y-0 md:border-x border-[var(--rule)] py-6 md:py-0 md:px-6">
            <p className="meta mb-2">Negative Headlines Archived</p>
            <Link href="/archive" className="group block">
              <span className="font-serif text-5xl md:text-6xl numeral font-bold tracking-tight group-hover:text-[var(--accent)] transition-colors">
                {archiveCount.total.toLocaleString()}
              </span>
            </Link>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 text-sm text-[var(--ink-muted)]">
              <span>Today +{archiveCount.today}</span>
              <span>This week +{archiveCount.thisWeek}</span>
              <span>This month +{archiveCount.thisMonth}</span>
            </div>
            <p className="mt-2 text-[11px] text-[var(--ink-muted)]">
              Unique qualifying articles ·{" "}
              <Link href="/methodology" className="underline hover:text-[var(--ink)]">
                Methodology
              </Link>
            </p>
          </div>

          {/* National Debt */}
          <div className="text-center md:text-right">
            <p className="meta mb-2">Total U.S. Public Debt</p>
            <span className="font-serif text-5xl md:text-6xl numeral font-bold tracking-tight">
              {formatDebt(debt.value)}
            </span>
            <div className="mt-2 space-y-0.5 text-sm text-[var(--ink-muted)]">
              {debt.metadata?.change_since_2025_01_20 != null && (
                <p>
                  Since Jan 20, 2025: +
                  {formatDebt(Number(debt.metadata.change_since_2025_01_20))}
                </p>
              )}
              {debt.metadata?.change_since_2017_01_20 != null && (
                <p>
                  Since Jan 20, 2017: +
                  {formatDebt(Number(debt.metadata.change_since_2017_01_20))}
                </p>
              )}
            </div>
            <p className="mt-2 text-[11px] text-[var(--ink-muted)]">
              <a
                href={debt.source_url || "https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/"}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[var(--ink)]"
              >
                Source: U.S. Treasury
              </a>{" "}
              · Updated {debt.period_end}
            </p>
          </div>
        </div>

        {/* Cost of Living strip */}
        <div className="mt-10 pt-6 border-t border-[var(--rule)]">
          <p className="meta mb-4 text-center">What Things Cost</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Gas */}
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-[var(--ink-muted)] mb-1">
                Gasoline · Latest U.S. Average
              </p>
              <p className="font-serif text-3xl numeral font-bold">
                ${gas.value.toFixed(2)}
                <span className="text-base font-normal text-[var(--ink-muted)]"> / gal</span>
              </p>
              <div className="mt-1 text-sm text-[var(--ink-muted)] space-y-0.5">
                {gas.metadata?.change_1m != null && (
                  <p>
                    1 month: {Number(gas.metadata.change_1m) > 0 ? "+" : ""}
                    ${Number(gas.metadata.change_1m).toFixed(2)} (
                    {Number(gas.metadata.change_1m_pct) > 0 ? "+" : ""}
                    {Number(gas.metadata.change_1m_pct).toFixed(1)}%)
                  </p>
                )}
                {gas.metadata?.change_1y != null && (
                  <p>
                    1 year: {Number(gas.metadata.change_1y) > 0 ? "+" : ""}
                    ${Number(gas.metadata.change_1y).toFixed(2)} (
                    {Number(gas.metadata.change_1y_pct) > 0 ? "+" : ""}
                    {Number(gas.metadata.change_1y_pct).toFixed(1)}%)
                  </p>
                )}
              </div>
              <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
                <a
                  href={gas.source_url || "https://www.eia.gov/petroleum/gasdiesel/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[var(--ink)]"
                >
                  Source: EIA
                </a>{" "}
                · Data as of {gas.period_end}
              </p>
            </div>

            {/* Groceries */}
            <div className="text-center sm:text-right">
              <p className="text-xs uppercase tracking-wider text-[var(--ink-muted)] mb-1">
                Grocery Prices · Food at Home CPI
              </p>
              <p className="font-serif text-3xl numeral font-bold">
                {groceries.value.toFixed(1)}
              </p>
              <div className="mt-1 text-sm text-[var(--ink-muted)] space-y-0.5">
                {groceries.metadata?.mom != null && (
                  <p>
                    Month-over-month: {Number(groceries.metadata.mom) > 0 ? "+" : ""}
                    {Number(groceries.metadata.mom).toFixed(1)}%
                  </p>
                )}
                {groceries.metadata?.yoy != null && (
                  <p>
                    Year-over-year: {Number(groceries.metadata.yoy) > 0 ? "+" : ""}
                    {Number(groceries.metadata.yoy).toFixed(1)}%
                  </p>
                )}
              </div>
              <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
                <a
                  href={groceries.source_url || "https://www.bls.gov/cpi/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[var(--ink)]"
                >
                  Source: BLS
                </a>{" "}
                ·{" "}
                <span title="Based on the Bureau of Labor Statistics Food-at-Home Consumer Price Index.">
                  Index, not a basket price
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
