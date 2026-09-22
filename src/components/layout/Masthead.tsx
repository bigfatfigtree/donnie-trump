import Link from "next/link";
import { Search } from "lucide-react";

export function Masthead() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="border-b border-[var(--rule)] bg-[var(--paper)]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 text-[11px] uppercase tracking-[0.15em] text-[var(--ink-muted)]">
          <span>{today}</span>
          <nav className="flex items-center gap-6">
            <Link href="/first-term" className="hover:text-[var(--ink)] transition-colors">
              First Term
            </Link>
            <Link href="/second-term" className="hover:text-[var(--ink)] transition-colors">
              Second Term
            </Link>
            <Link href="/archive" className="hover:text-[var(--ink)] transition-colors">
              Archive
            </Link>
            <Link href="/methodology" className="hover:text-[var(--ink)] transition-colors">
              Methodology
            </Link>
            <Link
              href="/archive"
              className="flex items-center gap-1.5 hover:text-[var(--ink)] transition-colors"
              aria-label="Search archive"
            >
              <Search size={14} strokeWidth={1.5} />
              <span className="hidden sm:inline">Search</span>
            </Link>
          </nav>
        </div>

        <div className="pb-6 pt-2 text-center">
          <Link href="/" className="inline-block">
            <img
              src="/logo.svg"
              alt="DONNIE TRUMP"
              className="mx-auto h-auto w-full max-w-[520px]"
            />
          </Link>
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-[var(--ink-muted)]">
            An Archive of the Trump Presidencies
          </p>
        </div>
      </div>
    </header>
  );
}
