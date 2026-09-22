export interface BlsFoodResult {
  value: number;
  period: string;
  yoy?: number;
  mom?: number;
  source: string;
  source_url: string;
  fetched_at: string;
  status: "ok" | "unavailable";
}

function periodToDate(year: string, period: string): string {
  const month = Number(String(period).replace("M", ""));
  if (!month) return `${year}-01-01`;
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

export async function fetchFoodAtHomeCpi(): Promise<BlsFoodResult> {
  const source_url = "https://www.bls.gov/cpi/";
  const fetched_at = new Date().toISOString();
  try {
    const body: Record<string, unknown> = {
      seriesid: ["CUSR0000SAF11"],
      startyear: String(new Date().getFullYear() - 2),
      endyear: String(new Date().getFullYear()),
    };
    if (process.env.BLS_API_KEY) body.registrationkey = process.env.BLS_API_KEY;
    const res = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`BLS ${res.status}`);
    const json = await res.json();
    const series = json?.Results?.series?.[0]?.data || [];
    const monthly = series.filter((d: { period: string }) => String(d.period).startsWith("M"));
    if (!monthly.length) throw new Error("No BLS rows");
    const latest = monthly[0];
    const prev = monthly[1];
    const yearAgo = monthly.find(
      (d: { year: string; period: string }) =>
        d.period === latest.period && Number(d.year) === Number(latest.year) - 1
    );
    const value = Number(latest.value);
    const mom = prev ? ((value - Number(prev.value)) / Number(prev.value)) * 100 : undefined;
    const yoy = yearAgo ? ((value - Number(yearAgo.value)) / Number(yearAgo.value)) * 100 : undefined;
    return {
      value,
      period: periodToDate(latest.year, latest.period),
      yoy,
      mom,
      source: "U.S. Bureau of Labor Statistics",
      source_url,
      fetched_at,
      status: "ok",
    };
  } catch {
    return {
      value: 0,
      period: "",
      source: "U.S. Bureau of Labor Statistics",
      source_url,
      fetched_at,
      status: "unavailable",
    };
  }
}
