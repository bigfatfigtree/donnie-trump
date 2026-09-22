import { ingestLatestNews } from "../src/lib/ingest";
import { refreshTreasury, refreshEiaBls } from "../src/lib/refreshMetrics";

async function main() {
  console.log("Refreshing Treasury / EIA / BLS…");
  console.log(await refreshTreasury());
  console.log(await refreshEiaBls());
  console.log("Ingesting GDELT window…");
  console.log(await ingestLatestNews({ timespan: "24h" }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
