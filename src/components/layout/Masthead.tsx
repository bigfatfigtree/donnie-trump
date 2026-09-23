import Link from "next/link";

export function Masthead() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--rule)] bg-[var(--paper)]/90 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="shrink-0">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)]">
              donnietrump.com
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            <span className="h-3 w-px bg-[var(--rule)]" />
            <span title="Also this site">diaperdon.co</span>
            <span className="h-3 w-px bg-[var(--rule)]" />
            <span title="Also this site">trumpratings.com</span>
          </div>
        </div>
        <nav className="flex items-center gap-5 text-[12px] uppercase tracking-[0.14em] text-[var(--ink-muted)] shrink-0">
          <Link href="/ratings" className="hover:text-[var(--ink)]">Ratings</Link>
          <Link href="/archive" className="hover:text-[var(--ink)]">Archive</Link>
          <Link href="/methodology" className="hover:text-[var(--ink)]">Method</Link>
        </nav>
      </div>
    </header>
  );
}
