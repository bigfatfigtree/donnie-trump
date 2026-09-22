import { refreshEiaBls } from "../../src/lib/refreshMetrics";

export default async function handler() {
  const result = await refreshEiaBls();
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
