import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { bingSiteVerification, googleSiteVerification, siteDescription, siteName, siteUrl } from "../lib/site.ts";
import { NAV_LINKS, showScatterpostBadge } from "../lib/config.ts";
import { ThemeToggle } from "../components/ThemeToggle.tsx";
import { ConsentBanner, CookieSettingsLink } from "../components/consent-banner.tsx";
import { SiteAnalytics } from "../components/site-analytics.tsx";

/**
 * Geist for everything (headings, body, UI chrome), Geist Mono for
 * dates, versions and code, ligatures off (set in globals.css): a
 * crisp, product-grade pairing, loaded once and applied through CSS
 * variables (next/font/google avoids a layout-shifting webfont flash).
 */
const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
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

// Applies a stored theme choice before first paint, so there is no
// flash of the wrong palette. Absent (the "system" default), the CSS
// media query in globals.css takes over. Inline and tiny on purpose:
// anything heavier would itself delay the paint it exists to avoid.
const noFlashThemeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="site-shell">
          <header className="site-header">
            <Link href="/" className="tap-target site-header-name">
              {siteName()}
            </Link>
            <nav className="site-nav">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="tap-target">
                  {link.label}
                </Link>
              ))}
              <ThemeToggle />
            </nav>
          </header>
          <main id="main-content" className="site-main">
            {children}
          </main>
          <footer className="site-footer">
            <p>
              &copy; {new Date().getFullYear()} {siteName()}
              {showScatterpostBadge() ? (
                <>
                  . Published with <a href="https://scatterpost.io">scatterpost</a>.
                </>
              ) : (
                "."
              )}
            </p>
            <div className="footer-links">
              <Link href="/feed.xml">RSS</Link>
              <Link href="/sitemap.xml">Sitemap</Link>
              <CookieSettingsLink />
            </div>
          </footer>
        </div>
        <ConsentBanner />
        <SiteAnalytics />
      </body>
    </html>
  );
}
