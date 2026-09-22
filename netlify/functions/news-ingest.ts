import { ingestLatestNews } from "../../src/lib/ingest";

export default async function handler() {
  const result = await ingestLatestNews({ timespan: "3h" });
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
