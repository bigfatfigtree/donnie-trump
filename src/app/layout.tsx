import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DONNIE TRUMP — An Archive of the Trump Presidencies",
    template: "%s | DONNIE TRUMP",
  },
  description:
    "A living historical archive of critical and negative news coverage involving Donald Trump during his presidential terms. Published journalism, organized and searchable.",
  openGraph: {
    title: "DONNIE TRUMP",
    description: "An archive of the Trump presidencies",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
