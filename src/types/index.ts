export type PresidentialTerm = "first" | "second";

export type ArticleType =
  | "news"
  | "analysis"
  | "opinion"
  | "editorial"
  | "polling"
  | "fact-check"
  | "investigation"
  | "legal"
  | "other";

export type Qualification = "QUALIFY" | "DO_NOT_QUALIFY" | "REVIEW";

export interface Publisher {
  id: string;
  name: string;
  domain: string;
  slug: string;
  logo_url?: string | null;
}

export interface Article {
  id: string;
  headline: string;
  normalized_headline: string;
  slug: string;
  publisher_id?: string | null;
  publisher?: Publisher;
  publisher_name?: string;
  publisher_domain?: string;
  canonical_url: string;
  source_url?: string | null;
  image_url?: string | null;
  description?: string | null;
  summary?: string | null;
  published_at: string;
  collected_at: string;
  article_type: ArticleType;
  term: PresidentialTerm;
  qualification: Qualification;
  qualification_confidence?: number | null;
  qualification_reason?: string | null;
  gdelt_tone?: number | null;
  story_cluster_id?: string | null;
  is_featured: boolean;
  metadata?: Record<string, unknown>;
  categories?: string[];
}

export interface StoryCluster {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  first_seen_at?: string | null;
  last_seen_at?: string | null;
  article_count: number;
  term?: PresidentialTerm | null;
}

export interface PollingMetric {
  id: string;
  pollster: string;
  approval: number | null;
  disapproval: number | null;
  net: number | null;
  period_label?: string | null;
  source_url?: string | null;
  source_date?: string | null;
  fetched_at: string;
  is_manual: boolean;
  status: "ok" | "stale" | "unavailable";
}

export interface EconomicMetric {
  id: string;
  metric_key: string;
  value: number;
  value_label?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  source: string;
  source_url?: string | null;
  source_date?: string | null;
  fetched_at: string;
  status: "ok" | "stale" | "unavailable";
  metadata?: Record<string, unknown>;
}

export interface ArchiveFilters {
  term?: PresidentialTerm | "all";
  year?: number;
  publisher?: string;
  category?: string;
  article_type?: ArticleType;
  q?: string;
  from?: string;
  to?: string;
  sort?: "newest" | "oldest";
  page?: number;
  limit?: number;
}

export interface ArchiveResult {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
