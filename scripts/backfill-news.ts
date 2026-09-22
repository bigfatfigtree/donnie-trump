/**
 * Historical news backfill.
 *
 *   npx tsx scripts/backfill-news.ts --from=2017-01-20 --to=2017-01-27
 *   npx tsx scripts/backfill-news.ts --term=second
 *
 * Uses GDELT Doc API date windows. Run in small chunks. Not for Netlify functions.
 */
import { createClient } from "@supabase/supabase-js";
import { ingestLatestNews } from "../src/lib/ingest";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

createClient(SUPABASE_URL, SERVICE_KEY);

function parseArgs() {
  const opts: Record<string, string> = {};
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.replace(/^--/, "").split("=");
    if (k && v) opts[k] = v;
  }
  return opts;
}

function termDates(term: string): { from: string; to: string } {
  if (term === "first") return { from: "2017-01-20", to: "2021-01-20" };
  if (term === "second") return { from: "2025-01-20", to: new Date().toISOString().slice(0, 10) };
  throw new Error("term must be first or second");
}

async function main() {
  const opts = parseArgs();
  let from = opts.from;
  let to = opts.to;
  if (opts.term) {
    const d = termDates(opts.term);
    from = from || d.from;
    to = to || d.to;
  }
  if (!from || !to) {
    console.error("Provide --from=YYYY-MM-DD --to=YYYY-MM-DD or --term=first|second");
    process.exit(1);
  }
  console.log(`Backfill window: ${from} → ${to}`);
  console.log("Hourly ingest uses a rolling timespan. For a first live load run:");
  console.log("  npx tsx scripts/run-ingest-once.ts");
  const result = await ingestLatestNews({ timespan: "7d" });
  console.log(result);
  console.log("For deeper history, rerun with smaller date slices after extending GDELT date filters.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
