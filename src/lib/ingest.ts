import { getServiceClient } from "@/lib/supabase";
import { fetchGdeltDocs } from "@/lib/gdelt";
import { classifyArticle } from "@/lib/classify";
import {
  domainFromUrl,
  jaccard,
  normalizeHeadline,
  presidentialTerm,
  publisherNameFromDomain,
  slugify,
  tokenSet,
} from "@/lib/normalize";

export interface IngestSummary {
  found: number;
  inserted: number;
  duplicates: number;
  skippedOffTerm: number;
  errors: string[];
}

export async function ingestLatestNews(opts?: { timespan?: string }): Promise<IngestSummary> {
  const supabase = getServiceClient();
  const summary: IngestSummary = {
    found: 0,
    inserted: 0,
    duplicates: 0,
    skippedOffTerm: 0,
    errors: [],
  };
  if (!supabase) {
    summary.errors.push("Supabase service client is not configured");
    return summary;
  }

  const { data: run } = await supabase
    .from("ingestion_runs")
    .insert({ source: "gdelt", status: "running", params: { timespan: opts?.timespan || "3h" } })
    .select()
    .single();

  let docs;
  try {
    docs = await fetchGdeltDocs({ timespan: opts?.timespan || "3h", maxrecords: 75 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "GDELT fetch failed";
    summary.errors.push(msg);
    if (run?.id) {
      await supabase.from("ingestion_runs").update({ status: "failed", errors: summary.errors, finished_at: new Date().toISOString() }).eq("id", run.id);
    }
    return summary;
  }

  summary.found = docs.length;

  for (const doc of docs) {
    try {
      const published = new Date(doc.seendate || Date.now());
      const term = presidentialTerm(published);
      if (!term) {
        summary.skippedOffTerm += 1;
        continue;
      }

      const { data: existing } = await supabase
        .from("articles")
        .select("id")
        .eq("canonical_url", doc.url)
        .maybeSingle();
      if (existing) {
        summary.duplicates += 1;
        continue;
      }

      const normalized = normalizeHeadline(doc.title);
      const { data: near } = await supabase
        .from("articles")
        .select("id, normalized_headline")
        .gte("published_at", new Date(published.getTime() - 1000 * 60 * 60 * 36).toISOString())
        .limit(40);
      const dup = (near || []).some(
        (row) => jaccard(tokenSet(normalized), tokenSet(row.normalized_headline)) >= 0.72
      );
      if (dup) {
        summary.duplicates += 1;
        continue;
      }

      const domain = (doc.domain || domainFromUrl(doc.url)).replace(/^www\./, "");
      const publisherName = publisherNameFromDomain(domain);
      let publisherId: string | null = null;
      if (domain) {
        const { data: pub } = await supabase
          .from("publishers")
          .upsert(
            { name: publisherName, domain, slug: slugify(domain) },
            { onConflict: "domain" }
          )
          .select("id")
          .single();
        publisherId = pub?.id ?? null;
      }

      const classified = await classifyArticle({
        headline: doc.title,
        description: null,
        url: doc.url,
        gdeltTone: doc.tone ?? null,
      });

      const slug = `${slugify(doc.title)}-${published.getTime().toString(36)}`;

      let clusterId: string | null = null;
      const { data: clusters } = await supabase
        .from("story_clusters")
        .select("id, title, last_seen_at")
        .order("last_seen_at", { ascending: false })
        .limit(25);
      const match = (clusters || []).find(
        (c) => jaccard(tokenSet(c.title), tokenSet(doc.title)) >= 0.55
      );
      if (match) {
        clusterId = match.id;
        await supabase
          .from("story_clusters")
          .update({ last_seen_at: published.toISOString() })
          .eq("id", match.id);
      } else {
        const { data: created } = await supabase
          .from("story_clusters")
          .insert({
            slug: `${slugify(doc.title)}-${Math.random().toString(36).slice(2, 7)}`,
            title: doc.title,
            first_seen_at: published.toISOString(),
            last_seen_at: published.toISOString(),
            article_count: 1,
            term,
          })
          .select("id")
          .single();
        clusterId = created?.id ?? null;
      }

      const { data: article, error } = await supabase
        .from("articles")
        .insert({
          headline: doc.title,
          normalized_headline: normalized,
          slug,
          publisher_id: publisherId,
          canonical_url: doc.url,
          source_url: doc.url,
          image_url: doc.socialimage || null,
          description: null,
          summary: null,
          published_at: published.toISOString(),
          article_type: classified.articleType,
          term,
          qualification: classified.qualification,
          qualification_confidence: classified.confidence,
          qualification_reason: classified.reason,
          gdelt_tone: doc.tone ?? null,
          story_cluster_id: clusterId,
          is_featured: classified.qualification === "QUALIFY" && classified.confidence >= 0.9,
          metadata: { source: "gdelt", domain },
        })
        .select("id")
        .single();

      if (error) {
        if (String(error.message).includes("unique")) {
          summary.duplicates += 1;
        } else {
          summary.errors.push(error.message);
        }
        continue;
      }

      if (article?.id) {
        await supabase.from("classification_runs").insert({
          article_id: article.id,
          model: classified.model,
          version: "1",
          result: classified.qualification,
          confidence: classified.confidence,
          reason: classified.reason,
        });
      }

      if (clusterId) {
        const { count } = await supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("story_cluster_id", clusterId);
        await supabase
          .from("story_clusters")
          .update({ article_count: count || 1, last_seen_at: published.toISOString() })
          .eq("id", clusterId);
      }

      summary.inserted += 1;
    } catch (err) {
      summary.errors.push(err instanceof Error ? err.message : "row failed");
    }
  }

  if (run?.id) {
    await supabase
      .from("ingestion_runs")
      .update({
        status: summary.errors.length ? "partial" : "success",
        finished_at: new Date().toISOString(),
        records_found: summary.found,
        records_new: summary.inserted,
        records_dup: summary.duplicates,
        errors: summary.errors.slice(0, 20),
      })
      .eq("id", run.id);
  }

  return summary;
}
