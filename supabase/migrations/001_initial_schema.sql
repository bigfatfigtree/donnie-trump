-- DONNIE TRUMP — Initial Schema
-- Run this in the Supabase SQL editor or via CLI

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for similarity / fuzzy search

-- ============================================================
-- PUBLISHERS
-- ============================================================
CREATE TABLE publishers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  domain        TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  logo_url      TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_publishers_domain ON publishers(domain);

-- ============================================================
-- STORY CLUSTERS (one underlying event, many articles)
-- ============================================================
CREATE TABLE story_clusters (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL, -- neutral event description
  summary       TEXT,
  first_seen_at TIMESTAMPTZ,
  last_seen_at  TIMESTAMPTZ,
  article_count INTEGER DEFAULT 0,
  term          TEXT CHECK (term IN ('first', 'second')),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_story_clusters_term ON story_clusters(term);
CREATE INDEX idx_story_clusters_last_seen ON story_clusters(last_seen_at DESC);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  sort_order    INTEGER DEFAULT 100,
  created_at    TIMESTAMPTZ DEFAULT now()
);

INSERT INTO categories (slug, name, sort_order) VALUES
  ('latest', 'Latest', 1),
  ('policy', 'Policy', 10),
  ('economy', 'Economy', 20),
  ('immigration', 'Immigration', 30),
  ('foreign-policy', 'Foreign Policy', 40),
  ('courts-legal', 'Courts & Legal', 50),
  ('business', 'Business', 60),
  ('ethics-government', 'Ethics & Government', 70),
  ('congress', 'Congress', 80),
  ('public-opinion', 'Public Opinion', 90),
  ('administration', 'Administration', 100),
  ('investigations', 'Investigations', 110),
  ('fact-checks', 'Fact Checks', 120),
  ('opinion-editorial', 'Opinion & Editorial', 130),
  ('other', 'Other', 999);

-- ============================================================
-- ARTICLES (core archive table)
-- ============================================================
CREATE TABLE articles (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  headline                TEXT NOT NULL,
  normalized_headline     TEXT NOT NULL, -- lowercased, stripped for dedup
  slug                    TEXT NOT NULL,
  publisher_id            UUID REFERENCES publishers(id),
  canonical_url           TEXT NOT NULL,
  source_url              TEXT,
  image_url               TEXT,
  description             TEXT, -- original meta description / excerpt
  summary                 TEXT, -- short independently written neutral summary
  published_at            TIMESTAMPTZ NOT NULL,
  collected_at            TIMESTAMPTZ DEFAULT now(),
  article_type            TEXT DEFAULT 'news'
                          CHECK (article_type IN (
                            'news','analysis','opinion','editorial',
                            'polling','fact-check','investigation','legal','other'
                          )),
  term                    TEXT CHECK (term IN ('first','second')),
  qualification           TEXT DEFAULT 'REVIEW'
                          CHECK (qualification IN ('QUALIFY','DO_NOT_QUALIFY','REVIEW')),
  qualification_confidence NUMERIC(4,3),
  qualification_reason    TEXT,
  gdelt_tone              NUMERIC(6,3),
  story_cluster_id        UUID REFERENCES story_clusters(id),
  is_featured             BOOLEAN DEFAULT false,
  metadata                JSONB DEFAULT '{}',
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_canonical UNIQUE (canonical_url)
);

CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_term ON articles(term);
CREATE INDEX idx_articles_qualification ON articles(qualification);
CREATE INDEX idx_articles_publisher ON articles(publisher_id);
CREATE INDEX idx_articles_cluster ON articles(story_cluster_id);
CREATE INDEX idx_articles_type ON articles(article_type);
CREATE INDEX idx_articles_featured ON articles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_articles_headline_trgm ON articles USING gin (normalized_headline gin_trgm_ops);
CREATE INDEX idx_articles_fts ON articles USING gin (
  to_tsvector('english', coalesce(headline,'') || ' ' || coalesce(description,''))
);

-- ============================================================
-- ARTICLE ↔ CATEGORY (many-to-many)
-- ============================================================
CREATE TABLE article_categories (
  article_id   UUID REFERENCES articles(id) ON DELETE CASCADE,
  category_id  UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, category_id)
);

-- ============================================================
-- INGESTION RUNS
-- ============================================================
CREATE TABLE ingestion_runs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source        TEXT NOT NULL, -- 'gdelt', 'rss', 'manual'
  started_at    TIMESTAMPTZ DEFAULT now(),
  finished_at   TIMESTAMPTZ,
  status        TEXT DEFAULT 'running' CHECK (status IN ('running','success','partial','failed')),
  records_found INTEGER DEFAULT 0,
  records_new   INTEGER DEFAULT 0,
  records_dup   INTEGER DEFAULT 0,
  errors        JSONB DEFAULT '[]',
  params        JSONB DEFAULT '{}',
  checkpoint    JSONB DEFAULT '{}'
);

-- ============================================================
-- CLASSIFICATION RUNS
-- ============================================================
CREATE TABLE classification_runs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id    UUID REFERENCES articles(id) ON DELETE CASCADE,
  model         TEXT, -- e.g. 'claude-3-5-sonnet' or 'gdelt-tone+rules'
  version       TEXT,
  result        TEXT CHECK (result IN ('QUALIFY','DO_NOT_QUALIFY','REVIEW')),
  confidence    NUMERIC(4,3),
  reason        TEXT,
  raw_response  JSONB,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_classification_article ON classification_runs(article_id);

-- ============================================================
-- ECONOMIC & POLLING METRICS (time-series)
-- ============================================================
CREATE TABLE economic_metrics (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_key    TEXT NOT NULL, -- 'treasury_debt', 'eia_gas_regular', 'bls_food_at_home'
  value         NUMERIC NOT NULL,
  value_label   TEXT, -- human readable if needed
  period_start  DATE,
  period_end    DATE,
  source        TEXT NOT NULL,
  source_url    TEXT,
  source_date   TIMESTAMPTZ,
  fetched_at    TIMESTAMPTZ DEFAULT now(),
  status        TEXT DEFAULT 'ok' CHECK (status IN ('ok','stale','unavailable')),
  metadata      JSONB DEFAULT '{}',
  UNIQUE (metric_key, period_end, source)
);

CREATE INDEX idx_economic_metrics_key_date ON economic_metrics(metric_key, period_end DESC);

CREATE TABLE polling_metrics (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pollster      TEXT NOT NULL DEFAULT 'CNN Poll of Polls',
  approval      NUMERIC(5,2),
  disapproval   NUMERIC(5,2),
  net           NUMERIC(5,2),
  period_label  TEXT, -- e.g. "Sept 12-15, 2025"
  sample_size   INTEGER,
  source_url    TEXT,
  source_date   TIMESTAMPTZ,
  fetched_at    TIMESTAMPTZ DEFAULT now(),
  is_manual     BOOLEAN DEFAULT false,
  status        TEXT DEFAULT 'ok',
  metadata      JSONB DEFAULT '{}'
);

CREATE INDEX idx_polling_metrics_date ON polling_metrics(source_date DESC);

-- ============================================================
-- MANUAL OVERRIDES & SYSTEM SETTINGS
-- ============================================================
CREATE TABLE manual_overrides (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key           TEXT NOT NULL UNIQUE, -- e.g. 'cnn_approval_current'
  value         JSONB NOT NULL,
  note          TEXT,
  updated_by    UUID, -- supabase auth user
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE system_settings (
  key           TEXT PRIMARY KEY,
  value         JSONB NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- HELPER VIEWS
-- ============================================================
CREATE OR REPLACE VIEW v_qualified_articles AS
SELECT a.*, p.name AS publisher_name, p.domain AS publisher_domain
FROM articles a
LEFT JOIN publishers p ON p.id = a.publisher_id
WHERE a.qualification = 'QUALIFY';

CREATE OR REPLACE VIEW v_archive_counts AS
SELECT
  COUNT(*) FILTER (WHERE qualification = 'QUALIFY') AS total_qualified,
  COUNT(*) FILTER (WHERE qualification = 'QUALIFY' AND published_at >= CURRENT_DATE) AS today,
  COUNT(*) FILTER (WHERE qualification = 'QUALIFY' AND published_at >= CURRENT_DATE - INTERVAL '7 days') AS this_week,
  COUNT(*) FILTER (WHERE qualification = 'QUALIFY' AND published_at >= date_trunc('month', CURRENT_DATE)) AS this_month
FROM articles;

-- ============================================================
-- RLS (basic — tighten in production)
-- ============================================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE economic_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE polling_metrics ENABLE ROW LEVEL SECURITY;

-- Public read for qualified content
CREATE POLICY "Public read qualified articles"
  ON articles FOR SELECT
  USING (qualification = 'QUALIFY' OR true); -- tighten later

CREATE POLICY "Public read publishers"
  ON publishers FOR SELECT USING (true);

CREATE POLICY "Public read clusters"
  ON story_clusters FOR SELECT USING (true);

CREATE POLICY "Public read economic"
  ON economic_metrics FOR SELECT USING (true);

CREATE POLICY "Public read polling"
  ON polling_metrics FOR SELECT USING (true);
