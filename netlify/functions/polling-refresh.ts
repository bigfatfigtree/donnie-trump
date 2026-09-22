import { refreshPollingPlaceholder } from "../../src/lib/refreshMetrics";

export default async function handler() {
  const result = await refreshPollingPlaceholder();
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
