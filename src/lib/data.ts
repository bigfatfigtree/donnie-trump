import type { Article, EconomicMetric, PollingMetric } from "@/types";
import { getAnonClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  SEED_ARTICLES,
  SEED_ARCHIVE_COUNT,
  SEED_DEBT,
  SEED_GAS,
  SEED_GROCERIES,
  SEED_POLLING,
} from "@/lib/seed";

function mapArticle(row: Record<string, unknown>): Article {
  const publisher = row.publishers as { name?: string; domain?: string } | null;
  return {
    id: String(row.id),
    headline: String(row.headline),
    normalized_headline: String(row.normalized_headline || ""),
    slug: String(row.slug || ""),
    publisher_id: row.publisher_id ? String(row.publisher_id) : null,
    publisher_name: publisher?.name || undefined,
    publisher_domain: publisher?.domain || undefined,
    canonical_url: String(row.canonical_url),
    source_url: row.source_url ? String(row.source_url) : null,
    image_url: row.image_url ? String(row.image_url) : null,
    description: row.description ? String(row.description) : null,
    summary: row.summary ? String(row.summary) : row.description ? String(row.description) : null,
    published_at: String(row.published_at),
    collected_at: String(row.collected_at || row.published_at),
    article_type: (row.article_type as Article["article_type"]) || "news",
    term: (row.term as Article["term"]) || "second",
    qualification: (row.qualification as Article["qualification"]) || "QUALIFY",
    qualification_confidence: row.qualification_confidence != null ? Number(row.qualification_confidence) : null,
    qualification_reason: row.qualification_reason ? String(row.qualification_reason) : null,
    gdelt_tone: row.gdelt_tone != null ? Number(row.gdelt_tone) : null,
    story_cluster_id: row.story_cluster_id ? String(row.story_cluster_id) : null,
    is_featured: Boolean(row.is_featured),
    metadata: (row.metadata as Record<string, unknown>) || {},
  };
}

export async function getHomepageArticles(): Promise<Article[]> {
  const supabase = getAnonClient();
  if (!supabase || !isSupabaseConfigured()) return SEED_ARTICLES;
  const { data, error } = await supabase
    .from("articles")
    .select("*, publishers(name, domain)")
    .eq("qualification", "QUALIFY")
    .order("published_at", { ascending: false })
    .limit(12);
  if (error || !data?.length) return SEED_ARTICLES;
  return data.map(mapArticle);
}

export async function getArchiveArticles(filters: {
  term?: string;
  type?: string;
  q?: string;
  page?: number;
}): Promise<{ articles: Article[]; total: number; usingSeed: boolean }> {
  const supabase = getAnonClient();
  if (!supabase || !isSupabaseConfigured()) {
    let rows = SEED_ARTICLES;
    if (filters.term === "first" || filters.term === "second") {
      rows = rows.filter((a) => a.term === filters.term);
    }
    if (filters.type) rows = rows.filter((a) => a.article_type === filters.type);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      rows = rows.filter((a) => a.headline.toLowerCase().includes(q));
    }
    return { articles: rows, total: SEED_ARCHIVE_COUNT.total, usingSeed: true };
  }

  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = 25;
  const from = (page - 1) * limit;
  let query = supabase
    .from("articles")
    .select("*, publishers(name, domain)", { count: "exact" })
    .eq("qualification", "QUALIFY")
    .order("published_at", { ascending: false })
    .range(from, from + limit - 1);
  if (filters.term === "first" || filters.term === "second") query = query.eq("term", filters.term);
  if (filters.type) query = query.eq("article_type", filters.type);
  if (filters.q) query = query.ilike("headline", `%${filters.q}%`);
  const { data, error, count } = await query;
  if (error || !data) {
    return { articles: SEED_ARTICLES, total: SEED_ARCHIVE_COUNT.total, usingSeed: true };
  }
  return { articles: data.map(mapArticle), total: count || data.length, usingSeed: false };
}

export async function getArchiveCounts() {
  const supabase = getAnonClient();
  if (!supabase || !isSupabaseConfigured()) return SEED_ARCHIVE_COUNT;

  const sinceDay = new Date();
  sinceDay.setHours(0, 0, 0, 0);
  const sinceWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const sinceMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const base = () =>
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("qualification", "QUALIFY");

  const [totalRes, todayRes, weekRes, monthRes] = await Promise.all([
    base(),
    base().gte("published_at", sinceDay.toISOString()),
    base().gte("published_at", sinceWeek.toISOString()),
    base().gte("published_at", sinceMonth.toISOString()),
  ]);

  const total = totalRes.count ?? 0;
  if (totalRes.error) return SEED_ARCHIVE_COUNT;
  return {
    total,
    today: todayRes.count ?? 0,
    thisWeek: weekRes.count ?? 0,
    thisMonth: monthRes.count ?? 0,
  };
}

export async function getLatestPolling(): Promise<PollingMetric> {
  const supabase = getAnonClient();
  if (!supabase || !isSupabaseConfigured()) return SEED_POLLING;
  const { data: override } = await supabase
    .from("manual_overrides")
    .select("value, updated_at")
    .eq("key", "cnn_approval_current")
    .maybeSingle();
  if (override?.value) {
    const v = override.value as Record<string, unknown>;
    return {
      id: "manual-cnn",
      pollster: "CNN Poll of Polls",
      approval: v.approval != null ? Number(v.approval) : null,
      disapproval: v.disapproval != null ? Number(v.disapproval) : null,
      net: v.net != null ? Number(v.net) : null,
      period_label: v.period_label ? String(v.period_label) : "Manual override",
      source_url: "https://www.cnn.com/politics/polls",
      source_date: override.updated_at,
      fetched_at: override.updated_at,
      is_manual: true,
      status: "ok",
    };
  }
  const { data } = await supabase
    .from("polling_metrics")
    .select("*")
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return SEED_POLLING;
  if (data.status === "unavailable") return { ...SEED_POLLING, status: "unavailable" };
  return {
    id: data.id,
    pollster: data.pollster,
    approval: data.approval != null ? Number(data.approval) : null,
    disapproval: data.disapproval != null ? Number(data.disapproval) : null,
    net: data.net != null ? Number(data.net) : null,
    period_label: data.period_label,
    source_url: data.source_url,
    source_date: data.source_date,
    fetched_at: data.fetched_at,
    is_manual: Boolean(data.is_manual),
    status: (data.status as PollingMetric["status"]) || "ok",
  };
}

async function latestMetric(key: string, fallback: EconomicMetric): Promise<EconomicMetric> {
  const supabase = getAnonClient();
  if (!supabase || !isSupabaseConfigured()) return fallback;
  const { data } = await supabase
    .from("economic_metrics")
    .select("*")
    .eq("metric_key", key)
    .order("period_end", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return fallback;
  return {
    id: data.id,
    metric_key: data.metric_key,
    value: Number(data.value),
    value_label: data.value_label,
    period_start: data.period_start,
    period_end: data.period_end,
    source: data.source,
    source_url: data.source_url,
    source_date: data.source_date,
    fetched_at: data.fetched_at,
    status: (data.status as EconomicMetric["status"]) || "ok",
    metadata: data.metadata || {},
  };
}

export async function getLatestDebt() {
  return latestMetric("treasury_debt", SEED_DEBT);
}
export async function getLatestGas() {
  return latestMetric("eia_gas_regular", SEED_GAS);
}
export async function getLatestGroceries() {
  return latestMetric("bls_food_at_home", SEED_GROCERIES);
}

export async function getReviewQueue(): Promise<Article[]> {
  const supabase = getAnonClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("articles")
    .select("*, publishers(name, domain)")
    .eq("qualification", "REVIEW")
    .order("published_at", { ascending: false })
    .limit(50);
  return (data || []).map(mapArticle);
}
