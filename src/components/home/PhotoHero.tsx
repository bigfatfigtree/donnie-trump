import Link from "next/link";

export function PhotoHero() {
  return (
    <section className="relative overflow-hidden bg-[#0b0b0c]">
      <div className="mx-auto max-w-[1400px] grid md:grid-cols-2 min-h-[72vh]">
        <div className="relative min-h-[420px] md:min-h-full">
          <img
            src="/hero.png"
            alt="Donald Trump"
            className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0b0b0c]/40 hidden md:block" />
        </div>
        <div className="relative flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-14 text-white">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">
            A living presidential archive
          </p>
          <h2 className="mt-4 font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
            The face
            <br />
            of the record.
          </h2>
          <p className="mt-6 max-w-md text-base sm:text-lg leading-relaxed text-white/70">
            Critical and negative coverage from the Trump presidencies, stored
            as published — headline, publisher, date. No spin added. No claims
            rewritten.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/archive"
              className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#0b0b0c] hover:bg-white/90"
            >
              Open the archive
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-white hover:border-white/60"
            >
              How it works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
