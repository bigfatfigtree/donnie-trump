import Link from "next/link";

export function Masthead() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--rule)] bg-[var(--paper)]/90 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="DONNIE TRUMP" className="h-7 w-auto" />
        </Link>
        <nav className="flex items-center gap-6 text-[12px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          <Link href="/archive" className="hover:text-[var(--ink)]">Archive</Link>
          <Link href="/first-term" className="hidden sm:inline hover:text-[var(--ink)]">First Term</Link>
          <Link href="/second-term" className="hidden sm:inline hover:text-[var(--ink)]">Second Term</Link>
          <Link href="/methodology" className="hover:text-[var(--ink)]">Methodology</Link>
        </nav>
      </div>
    </header>
  );
}
