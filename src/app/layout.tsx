import type { Metadata } from "next";
import "./globals.css";

const site = "https://donnietrump.com";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "Donnie Trump — Trump news archive, approval, debt, gas and grocery prices",
    template: "%s | Donnie Trump",
  },
  description:
    "Searchable archive of published news about Donald Trump. Live CNN-style overall approval and disapproval, U.S. public debt, gasoline prices, grocery CPI, and dated headlines attributed to original publishers. Also at diaperdon.co and trumpratings.com.",
  keywords: [
    "Donald Trump news",
    "Trump approval rating",
    "Trump disapproval",
    "Trump headlines",
    "Trump archive",
    "national debt Trump",
    "gas prices Trump",
    "grocery prices Trump",
    "donnietrump",
    "diaperdon",
    "trumpratings",
    "Trump second term news",
  ],
  alternates: {
    canonical: site,
  },
  openGraph: {
    type: "website",
    url: site,
    siteName: "Donnie Trump",
    title: "Donnie Trump — Trump news archive and live ratings",
    description:
      "Archive of Trump coverage plus live disapproval, public debt, gasoline and grocery prices.",
    images: [{ url: "/hero.png", width: 1200, height: 630, alt: "Donnie Trump archive" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Donnie Trump — Trump news archive",
    description: "Headlines, disapproval, debt, gas and grocery prices.",
    images: ["/hero.png"],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": site + "/#website",
      url: site,
      name: "Donnie Trump",
      alternateName: ["diaperdon.co", "trumpratings.com", "DONNIE TRUMP"],
      description: "Living archive of published news coverage of Donald Trump.",
      potentialAction: {
        "@type": "SearchAction",
        target: site + "/archive?q={query}",
        "query-input": "required name=query",
      },
    },
    {
      "@type": "Organization",
      name: "Donnie Trump",
      url: site,
      sameAs: [
        "https://diaperdon.co",
        "https://trumpratings.com",
        "https://www.donnietrump.com",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Donald Trump's current overall approval rating on Donnie Trump?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "This site currently displays 31 percent overall approval and 69 percent overall disapproval, entered from public polling aggregates and shown on the homepage.",
          },
        },
        {
          "@type": "Question",
          name: "Where can I find an archive of Trump news headlines?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DonnieTrump.com archives published headlines about Donald Trump with the original publisher, date, and link. The same archive is available at diaperdon.co and trumpratings.com.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
