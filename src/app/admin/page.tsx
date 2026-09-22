import { cookies } from "next/headers";
import { Masthead } from "@/components/layout/Masthead";
import { getReviewQueue } from "@/lib/data";
import { getServiceClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review" };

async function login(formData: FormData) {
  "use server";
  const secret = String(formData.get("secret") || "");
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    redirect("/admin?error=1");
  }
  const jar = await cookies();
  jar.set("record_admin", process.env.ADMIN_SECRET, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  redirect("/admin");
}

async function decide(formData: FormData) {
  "use server";
  const jar = await cookies();
  if (jar.get("record_admin")?.value !== process.env.ADMIN_SECRET) redirect("/admin");
  const id = String(formData.get("id") || "");
  const action = String(formData.get("action") || "");
  const supabase = getServiceClient();
  if (!supabase || !id) return;
  if (action === "qualify" || action === "reject") {
    await supabase
      .from("articles")
      .update({
        qualification: action === "qualify" ? "QUALIFY" : "DO_NOT_QUALIFY",
        qualification_reason: "Manual admin review",
        qualification_confidence: 1,
      })
      .eq("id", id);
  }
  redirect("/admin");
}

async function saveCnn(formData: FormData) {
  "use server";
  const jar = await cookies();
  if (jar.get("record_admin")?.value !== process.env.ADMIN_SECRET) redirect("/admin");
  const approval = Number(formData.get("approval"));
  const disapproval = Number(formData.get("disapproval"));
  const period_label = String(formData.get("period_label") || "Manual override");
  const supabase = getServiceClient();
  if (!supabase || Number.isNaN(approval)) return;
  await supabase.from("manual_overrides").upsert({
    key: "cnn_approval_current",
    value: {
      approval,
      disapproval: Number.isNaN(disapproval) ? null : disapproval,
      net: Number.isNaN(disapproval) ? null : approval - disapproval,
      period_label,
    },
    note: "Updated from /admin",
    updated_at: new Date().toISOString(),
  });
  await supabase.from("polling_metrics").insert({
    pollster: "CNN Poll of Polls",
    approval,
    disapproval: Number.isNaN(disapproval) ? null : disapproval,
    net: Number.isNaN(disapproval) ? null : approval - disapproval,
    period_label,
    source_url: "https://www.cnn.com/politics/polls",
    source_date: new Date().toISOString(),
    is_manual: true,
    status: "ok",
  });
  redirect("/admin");
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const jar = await cookies();
  const authed = Boolean(process.env.ADMIN_SECRET) && jar.get("record_admin")?.value === process.env.ADMIN_SECRET;

  if (!authed) {
    return (
      <>
        <Masthead />
        <main className="mx-auto max-w-md px-4 py-16">
          <h1 className="font-serif text-3xl font-bold mb-4">Review desk</h1>
          <p className="text-sm text-[var(--ink-muted)] mb-6">
            Enter the admin password from your ADMIN_SECRET environment variable.
          </p>
          {params.error && <p className="text-sm text-[var(--accent)] mb-3">Password did not match.</p>}
          <form action={login} className="space-y-3">
            <input type="password" name="secret" className="w-full border border-[var(--rule)] px-3 py-2 bg-[var(--surface)]" />
            <button className="border border-[var(--ink)] px-4 py-2 text-sm" type="submit">
              Sign in
            </button>
          </form>
        </main>
      </>
    );
  }

  const queue = await getReviewQueue();

  return (
    <>
      <Masthead />
      <main className="mx-auto max-w-[900px] px-4 py-10">
        <h1 className="font-serif text-3xl font-bold mb-2">Review desk</h1>
        <p className="text-sm text-[var(--ink-muted)] mb-8">
          Low-confidence items wait here. Qualify or reject. CNN numbers can be overridden when the public page cannot be parsed.
        </p>

        <section className="border border-[var(--rule)] p-4 mb-10 bg-[var(--surface)]">
          <h2 className="meta mb-3">CNN Poll of Polls override</h2>
          <form action={saveCnn} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <label className="text-sm">
              Approval
              <input name="approval" type="number" step="0.1" className="mt-1 w-full border border-[var(--rule)] px-2 py-1" />
            </label>
            <label className="text-sm">
              Disapproval
              <input name="disapproval" type="number" step="0.1" className="mt-1 w-full border border-[var(--rule)] px-2 py-1" />
            </label>
            <label className="text-sm sm:col-span-2">
              Period label
              <input name="period_label" placeholder="Week of Sept 15, 2026" className="mt-1 w-full border border-[var(--rule)] px-2 py-1" />
            </label>
            <button className="border border-[var(--ink)] px-4 py-2 text-sm" type="submit">
              Save override
            </button>
          </form>
        </section>

        <h2 className="meta mb-4">{queue.length} items in review</h2>
        <div className="space-y-6">
          {queue.map((a) => (
            <article key={a.id} className="border-b border-[var(--rule)] pb-5">
              <p className="meta mb-1">
                {a.publisher_name} · {new Date(a.published_at).toLocaleDateString()} · {a.article_type}
              </p>
              <h3 className="font-serif text-xl font-bold leading-snug">
                <a href={a.canonical_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {a.headline}
                </a>
              </h3>
              {a.qualification_reason && (
                <p className="mt-2 text-sm text-[var(--ink-muted)]">{a.qualification_reason}</p>
              )}
              <div className="mt-3 flex gap-3">
                <form action={decide}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="action" value="qualify" />
                  <button className="text-sm underline" type="submit">Qualify</button>
                </form>
                <form action={decide}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="action" value="reject" />
                  <button className="text-sm underline" type="submit">Do not qualify</button>
                </form>
              </div>
            </article>
          ))}
          {queue.length === 0 && (
            <p className="text-sm text-[var(--ink-muted)]">No review items. Ingest has not queued anything yet.</p>
          )}
        </div>
      </main>
    </>
  );
}
