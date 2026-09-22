import { getServiceClient } from "@/lib/supabase";
import { fetchLatestDebt } from "@/lib/providers/treasury";
import { fetchRegularGasoline } from "@/lib/providers/eia";
import { fetchFoodAtHomeCpi } from "@/lib/providers/bls";

export async function refreshTreasury() {
  const supabase = getServiceClient();
  const debt = await fetchLatestDebt();
  if (!supabase || debt.status !== "ok") return debt;
  await supabase.from("economic_metrics").upsert(
    {
      metric_key: "treasury_debt",
      value: debt.value,
      value_label: `$${(debt.value / 1e12).toFixed(1)}T`,
      period_end: debt.record_date,
      source: debt.source,
      source_url: debt.source_url,
      source_date: debt.record_date,
      fetched_at: debt.fetched_at,
      status: "ok",
      metadata: debt.metadata || {},
    },
    { onConflict: "metric_key,period_end,source" }
  );
  return debt;
}

export async function refreshEiaBls() {
  const supabase = getServiceClient();
  const [gas, food] = await Promise.all([fetchRegularGasoline(), fetchFoodAtHomeCpi()]);
  if (!supabase) return { gas, food };
  if (gas.status === "ok") {
    await supabase.from("economic_metrics").upsert(
      {
        metric_key: "eia_gas_regular",
        value: gas.value,
        value_label: `$${gas.value.toFixed(2)} / gal`,
        period_end: gas.period,
        source: gas.source,
        source_url: gas.source_url,
        source_date: gas.fetched_at,
        fetched_at: gas.fetched_at,
        status: "ok",
      },
      { onConflict: "metric_key,period_end,source" }
    );
  }
  if (food.status === "ok") {
    await supabase.from("economic_metrics").upsert(
      {
        metric_key: "bls_food_at_home",
        value: food.value,
        value_label: `CPI-U Food at Home ${food.value.toFixed(1)}`,
        period_end: food.period,
        source: food.source,
        source_url: food.source_url,
        source_date: food.fetched_at,
        fetched_at: food.fetched_at,
        status: "ok",
        metadata: { mom: food.mom, yoy: food.yoy },
      },
      { onConflict: "metric_key,period_end,source" }
    );
  }
  return { gas, food };
}

export async function refreshPollingPlaceholder() {
  const supabase = getServiceClient();
  if (!supabase) return { status: "unavailable" as const };
  const { data: override } = await supabase
    .from("manual_overrides")
    .select("value, updated_at")
    .eq("key", "cnn_approval_current")
    .maybeSingle();
  if (override?.value) return { status: "ok" as const, source: "manual_override" };
  return { status: "unavailable" as const, note: "No official CNN API; set a manual override in /admin." };
}
