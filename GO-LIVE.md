# DONNIE TRUMP — Do these steps in this exact order

You now have the full working codebase (not just the demo shell).
Follow every numbered step. Do not skip.

---

## STEP 1 — Put this folder on your computer

Use the completed project folder named `the-record`.
Open Terminal and go into it:

```bash
cd the-record
```

---

## STEP 2 — Create the free database (Supabase)

1. Go to https://supabase.com and sign up / log in.
2. Click **New project**.
3. Name it `the-record`.
4. Choose a database password. Write it down.
5. Choose a region close to you.
6. Click **Create new project**. Wait until it says the project is ready.

### Copy three keys
1. Click the gear **Project Settings**.
2. Click **API**.
3. Copy:
   - Project URL
   - anon public key
   - service_role key (click Reveal first)

### Run the database setup
1. In Supabase, click **SQL Editor**.
2. Click **New query**.
3. Open the file `supabase/migrations/001_initial_schema.sql` on your computer.
4. Copy ALL of it. Paste into the SQL editor. Click **Run**.
5. Open `supabase/migrations/002_admin_and_policies.sql`.
6. Copy ALL of it. Paste into a new query. Click **Run**.

If both say success, the database is ready.

---

## STEP 3 — Create two free API keys (recommended)

### EIA (gas prices)
1. Go to https://www.eia.gov/opendata/register.php
2. Register and copy the API key.

### Admin password
Invent a long password you will use at `/admin`. Example: a random sentence.

Anthropic and BLS keys are optional. The site works without them.

---

## STEP 4 — Put the code on GitHub

1. Go to https://github.com and sign in.
2. Click **New repository**.
3. Name it `the-record`. Do not add a README.
4. Click **Create repository**.

On your computer, inside the `the-record` folder:

```bash
git init
git add .
git commit -m "DONNIE TRUMP production codebase"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/the-record.git
git push -u origin main
```

Replace YOUR-USERNAME with your GitHub name.

---

## STEP 5 — Put the site on Netlify

1. Go to https://www.netlify.com and sign in with GitHub.
2. Click **Add new site** → **Import an existing project**.
3. Choose GitHub → the `the-record` repo.
4. Click **Deploy site** (build settings are already in netlify.toml).

The first deploy may finish before you add keys. That is fine.

---

## STEP 6 — Add the secret keys on Netlify

In Netlify: **Site configuration → Environment variables → Add a variable**.
Add each of these:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_SECRET
- EIA_API_KEY   (if you have it)
- ANTHROPIC_API_KEY  (only if you have it)
- BLS_API_KEY  (only if you have it)

Then go to **Deploys** and click **Trigger deploy → Deploy site**.

When it finishes, Netlify will give you a URL like
`https://something.netlify.app`

That is the live site.

---

## STEP 7 — Fill the database with real numbers and news

On your computer, create a file named `.env.local` in the project folder
and paste the same keys you put on Netlify.

Then run:

```bash
npm install
npx tsx scripts/run-ingest-once.ts
```

This will:
- pull the latest U.S. Treasury debt
- pull gas and grocery indexes if keys exist
- pull recent GDELT headlines, classify them, and store them

Refresh your live site. If articles were qualified, they replace the seed stories.

You can also trigger the Netlify functions by hand the first time:
Site → Functions → news-ingest / treasury-refresh / eia-bls-check → Run.

Scheduled runs after that:
- news every hour
- polling check every 6 hours
- Treasury on weekdays
- EIA/BLS daily

---

## STEP 8 — Enter the CNN number by hand

CNN has no public API that we can trust.

1. Open https://www.cnn.com/politics/polls
2. Write down the current approval and disapproval.
3. Go to `https://YOUR-SITE.netlify.app/admin`
4. Type your ADMIN_SECRET.
5. Fill in the CNN override form and save.

The homepage will use that number until you change it.

---

## STEP 9 — Review borderline stories

Same `/admin` page.
For each queued headline:
- Qualify = it belongs in the archive
- Do not qualify = keep it out of the public archive

---

## What is now real vs still human

Real / automatic
- Homepage and archive read from Supabase
- GDELT news ingest + rules classification + optional Anthropic
- Dedup by URL and similar headlines
- Story clusters
- Treasury debt
- EIA gas (with key)
- BLS groceries (works without a key, better with one)

Human / unavoidable
- CNN Poll of Polls number
- Final call on REVIEW items
- Historical backfill of 2017–2021 (run `npm run backfill` later in batches)

Seed data is only used when the database is empty or unreachable.
