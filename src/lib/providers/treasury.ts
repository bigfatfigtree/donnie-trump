/**
 * U.S. Treasury Fiscal Data — Debt to the Penny
 * https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/
 *
 * Public API, no key required.
 * Updates on business days. Never invent continuous "live" values.
 */

export interface TreasuryDebtResult {
  value: number;
  record_date: string;
  source: string;
  source_url: string;
  fetched_at: string;
  status: "ok" | "stale" | "unavailable";
  metadata?: Record<string, number>;
}

const ENDPOINT =
  "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny";

export async function fetchLatestDebt(): Promise<TreasuryDebtResult> {
  try {
    const url = `${ENDPOINT}?sort=-record_date&page[size]=1`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Treasury API ${res.status}`);

    const json = await res.json();
    const row = json?.data?.[0];
    if (!row) throw new Error("No debt data returned");

    const value = parseFloat(row.tot_pub_debt_out_amt);
    return {
      value,
      record_date: row.record_date,
      source: "U.S. Treasury Fiscal Data — Debt to the Penny",
      source_url: "https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/",
      fetched_at: new Date().toISOString(),
      status: "ok",
    };
  } catch (err) {
    console.error("[treasury]", err);
    return {
      value: 0,
      record_date: "",
      source: "U.S. Treasury Fiscal Data — Debt to the Penny",
      source_url: "https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/",
      fetched_at: new Date().toISOString(),
      status: "unavailable",
    };
  }
}
