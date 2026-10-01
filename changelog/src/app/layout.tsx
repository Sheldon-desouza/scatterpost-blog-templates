import type { Metadata } from "next";
import { Sora } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { bingSiteVerification, googleSiteVerification, siteDescription, siteName, siteUrl } from "../lib/site.ts";
import { ConsentBanner, CookieSettingsLink } from "../components/consent-banner.tsx";
import { SiteAnalytics } from "../components/site-analytics.tsx";

/**
 * Sora: a crisp, geometric grotesk built for product UI, with tall
 * x-height and tidy numerals, so version labels and dates in the
 * changelog timeline line up cleanly. Loaded once here and applied
 * through the `--font-body` CSS variable in globals.css, which is how
 * next/font avoids a layout-shifting webfont flash.
 */
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: siteName(), template: `%s | ${siteName()}` },
  description: siteDescription(),
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: `${siteName()} - all updates` },
        { url: "/changelog/feed.xml", title: `${siteName()} - changelog` },
      ],
    },
  },
  verification: {
    google: googleSiteVerification(),
    other: bingSiteVerification() ? { "msvalidate.01": bingSiteVerification()! } : undefined,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={sora.variable}>
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-4 py-8 sm:px-6">
          <header className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <Link href="/" className="tap-target text-lg font-semibold">
              {siteName()}
            </Link>
            <nav className="flex gap-4">
              <Link href="/changelog" className="tap-target underline">
                Changelog
              </Link>
              <Link href="/blog" className="tap-target underline">
                Blog
              </Link>
            </nav>
          </header>
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <footer className="border-t border-[var(--border)] pt-4 text-sm text-[var(--muted-foreground)]">
            <p>
              {siteName()} is published with{" "}
              <a href="https://scatterpost.io" className="underline">
                scatterpost
              </a>
              . <CookieSettingsLink />
            </p>
          </footer>
        </div>
        <ConsentBanner />
        <SiteAnalytics />
      </body>
    </html>
  );
}
