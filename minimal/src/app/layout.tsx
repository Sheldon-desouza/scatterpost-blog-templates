import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { authorName, bingSiteVerification, googleSiteVerification, siteName, siteUrl } from "../lib/site.ts";
import { NAV_LINKS, showScatterpostBadge } from "../lib/config.ts";
import { ThemeToggle } from "../components/ThemeToggle.tsx";
import { ConsentBanner, CookieSettingsLink } from "../components/consent-banner.tsx";
import { SiteAnalytics } from "../components/site-analytics.tsx";

/**
 * Three faces, loaded once and applied through CSS variables in
 * globals.css (next/font/google avoids a layout-shifting webfont
 * flash): Hanken Grotesk for headings and UI, Source Serif 4 for
 * article body copy, JetBrains Mono for code and meta.
 */
const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
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
    <html
      lang="en-GB"
      className={`${hankenGrotesk.variable} ${sourceSerif.variable} ${jetBrainsMono.variable}`}
    >
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
              &copy; {new Date().getFullYear()} {authorName()}
              {showScatterpostBadge() ? (
                <>
                  . Published with{" "}
                  <a href="https://scatterpost.io">scatterpost</a>.
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
