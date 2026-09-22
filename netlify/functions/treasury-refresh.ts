import { refreshTreasury } from "../../src/lib/refreshMetrics";

export default async function handler() {
  const result = await refreshTreasury();
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
