import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { authorName, bingSiteVerification, googleSiteVerification, siteName, siteUrl } from "../lib/site.ts";
import { NAV_LINKS, showScatterpostBadge } from "../lib/config.ts";
import { showScatterpostCredit } from "../lib/scatterpost/scatterpost-credit.ts";
import { ThemeToggle } from "../components/theme-toggle.tsx";
import { DemoBar } from "../components/DemoBar.tsx";
import { ConsentBanner, CookieSettingsLink } from "../components/consent-banner.tsx";
import { SiteAnalytics } from "../components/site-analytics.tsx";

/**
 * Two faces, loaded once and applied through CSS variables in
 * globals.css (next/font/google avoids a layout-shifting webfont
 * flash): IBM Plex Sans for UI, body and headings, IBM Plex Mono for
 * code, meta, dates and tags, ligatures off (an engineering-notebook
 * look, not a code-ligature one).
 */
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl()}/`),
  title: { default: siteName(), template: `%s | ${siteName()}` },
  description: `${siteName()}, a blog by ${authorName()}, published with scatterpost.`,
  alternates: {
    types: { "application/rss+xml": [{ url: "feed.xml", title: siteName() }] },
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
    <html lang="en-GB" className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="site-shell">
          <DemoBar />
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
              &copy; {new Date().getFullYear()} {authorName()}
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
            {showScatterpostCredit() ? (
              <p className="footer-credit">
                <a href="https://scatterpost.io/templates">Built with a scatterpost template</a>
              </p>
            ) : null}
          </footer>
        </div>
        <ConsentBanner />
        <SiteAnalytics />
      </body>
    </html>
  );
}
