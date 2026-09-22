import { readFileSync } from "fs";
import { resolve } from "path";
import { ingestLatestNews } from "../src/lib/ingest";
import { refreshTreasury, refreshEiaBls } from "../src/lib/refreshMetrics";

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    try {
      const text = readFileSync(resolve(process.cwd(), name), "utf8");
      for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const i = trimmed.indexOf("=");
        if (i < 1) continue;
        const key = trimmed.slice(0, i).trim();
        const val = trimmed.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
    } catch {
      // file missing
    }
  }
}

async function main() {
  loadEnv();
  console.log("Refreshing Treasury / EIA / BLS…");
  console.log(await refreshTreasury());
  console.log(await refreshEiaBls());
  console.log("Ingesting news (GDELT, then RSS fallback)…");
  console.log(await ingestLatestNews({ timespan: "24h" }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
