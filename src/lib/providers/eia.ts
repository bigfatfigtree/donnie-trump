export interface EiaGasResult {
  value: number;
  period: string;
  source: string;
  source_url: string;
  fetched_at: string;
  status: "ok" | "unavailable";
}

export async function fetchRegularGasoline(): Promise<EiaGasResult> {
  const key = process.env.EIA_API_KEY;
  const source_url = "https://www.eia.gov/petroleum/gasdiesel/";
  const fetched_at = new Date().toISOString();
  if (!key) {
    return {
      value: 0,
      period: "",
      source: "U.S. Energy Information Administration",
      source_url,
      fetched_at,
      status: "unavailable",
    };
  }
  try {
    const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${key}&frequency=weekly&data[0]=value&facets[product][]=EPMR&facets[duoarea][]=NUS&sort[0][column]=period&sort[0][direction]=desc&length=8`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`EIA ${res.status}`);
    const json = await res.json();
    const rows = json?.response?.data || [];
    const latest = rows[0];
    if (!latest) throw new Error("No EIA rows");
    return {
      value: Number(latest.value),
      period: String(latest.period),
      source: "U.S. Energy Information Administration",
      source_url,
      fetched_at,
      status: "ok",
    };
  } catch {
    return {
      value: 0,
      period: "",
      source: "U.S. Energy Information Administration",
      source_url,
      fetched_at,
      status: "unavailable",
    };
  }
}
