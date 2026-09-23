import type { ArticleType, Qualification } from "../types";

export interface ClassificationInput {
  headline: string;
  description?: string | null;
  url?: string;
  gdeltTone?: number | null;
}

export interface ClassificationResult {
  qualification: Qualification;
  confidence: number;
  reason: string;
  articleType: ArticleType;
  categories: string[];
  model: string;
}

const SUBJECT = /\b(trump|donald trump|president trump|trump administration|white house|maga)\b/i;

const CRITICAL = [
  /\b(indict|indicted|impeach|impeachment|convict|convicted|guilty|felony|sentenc)/i,
  /\b(scandal|ethics|conflict of interest|emolument|self-deal)/i,
  /\b(lie|lied|lying|false claim|mislead|misleading|fact.?check)/i,
  /\b(fail|fails|failed|failure|collapse|crisis|chaos|fiasco)/i,
  /\b(block|blocked|struck down|injunction|unlawful|illegal|unconstitutional)/i,
  /\b(probe|investigat|subpoena|oversight|inspector general)/i,
  /\b(recession|inflation|tariff|market (drop|fall|plunge|selloff))/i,
  /\b(deport|detention|family separation|asylum ban)/i,
  /\b(criticism|condemn|rebuke|backlash|outrage|protest)/i,
  /\b(approval (falls|slides|drops|sinks)|unpopular|underwater)/i,
];

const POSITIVE = [
  /\b(triumph|historic win|landslide|booming economy|record high jobs)\b/i,
  /\b(praise[ds]? (trump|president)|trump (hailed|praised))\b/i,
];

const OPINION = /\b(opinion|editorial|op-ed|column|commentary)\b/i;
const FACTCHECK = /\b(fact.?check|false claim)\b/i;
const LEGAL = /\b(court|judge|lawsuit|indict|subpoena|ruling|injunction)\b/i;
const INVEST = /\b(investigat|inspector general|probe)\b/i;

export function classifyByRules(input: ClassificationInput): ClassificationResult {
  const text = `${input.headline} ${input.description || ""}`;
  const aboutSubject = SUBJECT.test(text) || SUBJECT.test(input.url || "");
  const criticalHits = CRITICAL.filter((r) => r.test(text)).length;
  const positiveHits = POSITIVE.filter((r) => r.test(text)).length;
  const tone = input.gdeltTone ?? 0;

  let articleType: ArticleType = "news";
  if (FACTCHECK.test(text)) articleType = "fact-check";
  else if (OPINION.test(text) && /editorial/i.test(text)) articleType = "editorial";
  else if (OPINION.test(text)) articleType = "opinion";
  else if (LEGAL.test(text)) articleType = "legal";
  else if (INVEST.test(text)) articleType = "investigation";
  else if (/\bpoll\b/i.test(text)) articleType = "polling";
  else if (/\banaly/i.test(text)) articleType = "analysis";

  const categories: string[] = [];
  if (LEGAL.test(text)) categories.push("courts-legal");
  if (/\beconom|inflat|tariff|jobs|unemploy|market/i.test(text)) categories.push("economy");
  if (/\bimmigr|border|deport|asylum/i.test(text)) categories.push("immigration");
  if (/\bchina|nato|ukraine|israel|iran|foreign/i.test(text)) categories.push("foreign-policy");
  if (/\bethics|conflict/i.test(text)) categories.push("ethics-government");
  if (/\bcongress|senate|house/i.test(text)) categories.push("congress");
  if (/\bpoll|approval/i.test(text)) categories.push("public-opinion");
  if (FACTCHECK.test(text)) categories.push("fact-checks");
  if (articleType === "opinion" || articleType === "editorial") categories.push("opinion-editorial");
  if (!categories.length) categories.push("administration");

  if (!aboutSubject) {
    return {
      qualification: "DO_NOT_QUALIFY",
      confidence: 0.86,
      reason: "Does not clearly concern Donald Trump or his administrations.",
      articleType,
      categories,
      model: "rules-v1",
    };
  }

  const score = criticalHits * 0.22 + (tone < -1 ? 0.2 : 0) + (tone < -3 ? 0.15 : 0) - positiveHits * 0.25;

  if (score >= 0.45 && criticalHits >= 1) {
    return {
      qualification: "QUALIFY",
      confidence: Math.min(0.97, 0.62 + score),
      reason: `Critical coverage signals (${criticalHits}) and/or negative GDELT tone (${tone.toFixed(2)}).`,
      articleType,
      categories,
      model: "rules-v1",
    };
  }

  if (score <= 0.05 && positiveHits > criticalHits) {
    return {
      qualification: "DO_NOT_QUALIFY",
      confidence: 0.7,
      reason: "Subject is present but coverage is not clearly critical or negative.",
      articleType,
      categories,
      model: "rules-v1",
    };
  }

  return {
    qualification: "QUALIFY",
    confidence: 0.72,
    reason: "Trump-related published coverage auto-archived without review.",
    articleType,
    categories,
    model: "rules-v2-auto",
  };
}

export async function classifyArticle(input: ClassificationInput): Promise<ClassificationResult> {
  const rules = classifyByRules(input);
  if (rules.qualification !== "REVIEW" || !process.env.ANTHROPIC_API_KEY) {
    return rules;
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content:
              "Classify this published headline for an archive of critical/negative coverage of Donald Trump during his presidential terms. Reply JSON only: {qualification: QUALIFY|DO_NOT_QUALIFY|REVIEW, confidence: 0-1, reason: string, articleType: news|analysis|opinion|editorial|polling|fact-check|investigation|legal|other}. Headline: " +
              input.headline +
              " Description: " +
              (input.description || ""),
          },
        ],
      }),
    });
    if (!res.ok) return rules;
    const json = await res.json();
    const text: string = json?.content?.[0]?.text || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return rules;
    const parsed = JSON.parse(match[0]);
    const q = parsed.qualification as Qualification;
    if (!["QUALIFY", "DO_NOT_QUALIFY", "REVIEW"].includes(q)) return rules;
    return {
      qualification: q,
      confidence: Number(parsed.confidence) || 0.6,
      reason: String(parsed.reason || "LLM classification"),
      articleType: (parsed.articleType as ArticleType) || rules.articleType,
      categories: rules.categories,
      model: "claude-haiku+rules-v1",
    };
  } catch {
    return rules;
  }
}
