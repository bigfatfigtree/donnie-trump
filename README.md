# DONNIE TRUMP

**An Archive of the Trump Presidencies**

A production-oriented foundation for a living historical archive of critical and negative news coverage published during Donald Trump’s presidential terms (2017–2021 and 2025–present).

This repository provides:

- Editorial magazine-style frontend (Next.js + TypeScript + Tailwind)
- Complete Postgres/Supabase schema
- Provider architecture for Treasury, EIA, BLS, CNN polling, and news
- Netlify Functions stubs for scheduled ingestion
- Classification pipeline design (rules + optional LLM)
- Backfill script skeleton
- Seed data so the design renders immediately
- Full deployment and operations documentation

> **Important:** A complete multi-year live backfill of GDELT + classification of hundreds of thousands of articles requires real API keys, significant compute time, and careful rate-limit handling. The code here is structured so those pieces can be completed and operated; the seed data lets you see the visual and information architecture immediately.

---

## 1. Final Folder Structure

```
the-record/
├── netlify/
│   └── functions/          # Scheduled & API Netlify Functions
├── public/
├── scripts/
│   └── backfill-news.ts    # Historical import (run locally / GH Actions)
├── src/
│   ├── app/
│   │   ├── archive/        # Archive explorer (to be expanded)
│   │   ├── first-term/
│   │   ├── second-term/
│   │   ├── methodology/
│   │   ├── story/[slug]/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx        # Homepage
│   ├── components/
│   │   ├── home/
│   │   │   ├── DataStrip.tsx
│   │   │   ├── HeroStory.tsx
│   │   │   └── MagazineGrid.tsx
│   │   ├── layout/
│   │   │   └── Masthead.tsx
│   │   ├── archive/
│   │   ├── charts/
│   │   └── ui/
│   ├── lib/
│   │   ├── providers/      # treasury.ts, eia.ts, bls.ts, cnnPolling.ts, news.ts
│   │   ├── db/
│   │   ├── classification/
│   │   └── seed.ts
│   ├── types/
│   └── hooks/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.example
├── netlify.toml
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 2. Architecture Overview

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| Frontend | Next.js 15 App Router, TypeScript, Tailwind | Editorial UI, SEO, SSR/SSG where useful |
| Database | Supabase (Postgres) | Articles, clusters, publishers, metrics, classification history |
| Auth (admin) | Supabase Auth | Protected review/feature/override interface |
| Serverless | Netlify Functions | Hourly news ingestion, metric refreshes, admin actions |
| Historical import | Node script (`tsx`) | Large backfills that would exceed function timeouts |
| Classification | Rules + optional Anthropic Claude | QUALIFY / DO_NOT_QUALIFY / REVIEW |
| External data | Provider modules | Treasury, EIA, BLS, CNN (conservative), GDELT/RSS |

**Key design decisions**

- All secrets stay server-side (Netlify env / function context).
- Metrics are written only when the source value actually changes.
- Deduplication is first-class (canonical URL + normalized headline + cluster).
- Classification is pluggable so methodology can evolve without rewriting the app.
- Branding (“THE RECORD”) is centralized so a name change is one-line.

---

## 3. Required Environment Variables

Create `.env.local` (and set the same in Netlify):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # server only

# Optional LLM classification
ANTHROPIC_API_KEY=sk-ant-...

# Optional explicit overrides / config
CNN_POLLING_URL=https://www.cnn.com/politics/polls
GDELT_DOC_API=https://api.gdeltproject.org/api/v2/doc/doc

# Netlify (auto-injected in most cases)
URL=
DEPLOY_PRIME_URL=
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `ANTHROPIC_API_KEY` to the browser.

---

## 4. Supabase Setup & Migrations

1. Create a new Supabase project.
2. In the SQL Editor, run the contents of  
   `supabase/migrations/001_initial_schema.sql`
3. (Optional) Enable the `pg_trgm` extension if not already enabled by the script.
4. Create an admin user via Supabase Auth for the future admin UI.
5. Copy the project URL and keys into your `.env.local`.

The schema includes:

- `articles`, `publishers`, `story_clusters`, `categories`, `article_categories`
- `ingestion_runs`, `classification_runs`
- `economic_metrics`, `polling_metrics`
- `manual_overrides`, `system_settings`
- Useful indexes for time, term, qualification, full-text, and trigram search
- Basic RLS policies (tighten for production)

---

## 5. Historical Backfill

```bash
npm install
npm run backfill -- --from=2017-01-20 --to=2017-12-31
npm run backfill -- --term=first
npm run backfill -- --term=second
npm run backfill -- --year=2019
```

The script (skeleton in `scripts/backfill-news.ts`) is designed to:

- Resume from checkpoints stored in `ingestion_runs`
- Respect rate limits
- Deduplicate before insert
- Log failures and retry transient errors
- Avoid inserting duplicates

**Practical note:** Full first-term + second-term backfill is a multi-day (or multi-week) job depending on GDELT volume and classification throughput. Run it on a machine or GitHub Actions runner with sufficient time limits, not inside a Netlify function.

---

## 6. Deploying to Netlify

1. Push the repository to GitHub.
2. In Netlify: New site → Import from Git.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next` (or let the Next.js plugin handle it)
4. Install the official Netlify Next.js runtime / plugin if prompted.
5. Add all environment variables from section 3.
6. Under Functions, confirm `netlify/functions` is detected.
7. Add scheduled functions (Netlify UI or `netlify.toml`):

```toml
# netlify.toml (example)
[functions]
  directory = "netlify/functions"

[[plugins]]
  package = "@netlify/plugin-nextjs"

# Example schedule (configure in Netlify UI for production)
# news-ingest: hourly
# polling-refresh: every 6 hours
# treasury-refresh: 0 12 * * 1-5   (business days)
# eia-bls-check: daily
```

8. Deploy. The homepage will render with seed data until live providers and backfill are running.

---

## 7. Services That Require API Keys / Accounts

| Service | Required? | Notes |
|---------|-----------|-------|
| Supabase | Yes | Database + Auth |
| Anthropic | Optional | LLM classification; rules-only mode works without it |
| GDELT | No key for basic Doc API | Rate limits apply; be conservative |
| U.S. Treasury Fiscal Data | No key | Public API |
| EIA | Free API key recommended | https://www.eia.gov/opendata/ |
| BLS | Free registration | https://www.bls.gov/developers/ |
| CNN | No official API | Conservative page/RSS parsing + manual override |

---

## 8. What Cannot Be Fully Automated

- **CNN Poll of Polls** – No stable public API. Parsing can break; manual override in Supabase is the safety valve.
- **Paywalled full text** – We never store full copyrighted articles. Metadata + headline + permitted excerpt only.
- **Perfect classification** – Edge cases go to REVIEW for human judgment.
- **Complete historical coverage** – GDELT is excellent but not exhaustive of every regional paper.
- **Real-time debt clock** – Treasury updates by business day; we animate only real published changes.
- **Admin review queue** – Requires a human operator for low-confidence items and feature curation.

---

## 9. Local Development

```bash
cp .env.example .env.local   # fill in keys
npm install
npm run dev
```

Open http://localhost:3000. The homepage uses seed data so the editorial design is immediately visible.

---

## 10. Adding New Pieces Later

- **New economic indicator** – Add a provider under `src/lib/providers/`, a metric_key, and a card in the DataStrip / Cost-of-Living section.
- **New publisher RSS** – Extend the news provider adapter; store domain + name in `publishers`.
- **Branding change** – Search for “THE RECORD” and the descriptor; they are intentionally centralized.
- **Classification methodology** – Edit the prompt / rules in the classification module; re-run classification on REVIEW items if desired.

---

## Design Notes

- Warm off-white paper background, near-black typography
- Libre Baskerville (serif) for headlines, Inter for UI/data
- Muted deep-red accent used sparingly
- No red/blue partisan coding, no campaign graphics, no flag clichés
- Oversized numerals, tight uppercase metadata, thin editorial rules
- Article type badges (News / Analysis / Opinion / Editorial / etc.) kept visible

---

## License & Attribution

This project is a technical and editorial framework. All archived headlines and claims remain the property of their original publishers. DONNIE TRUMP does not claim ownership of the underlying journalism.
