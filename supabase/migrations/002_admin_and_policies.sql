ALTER TABLE manual_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE classification_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read overrides"
  ON manual_overrides FOR SELECT USING (true);

CREATE POLICY "Public read settings"
  ON system_settings FOR SELECT USING (true);

CREATE POLICY "Public read categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Public read article categories"
  ON article_categories FOR SELECT USING (true);
