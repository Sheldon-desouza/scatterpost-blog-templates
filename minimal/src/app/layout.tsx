import type { Metadata } from "next";
import { Literata } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { authorName, siteName, siteUrl } from "../lib/site.ts";

/**
 * Literata: a humanist serif made for long-form reading on screen, with
 * good x-height and open apertures at body sizes. Loaded once here and
 * applied through the `--font-body` CSS variable in globals.css, which
 * is how next/font avoids a layout-shifting webfont flash.
 */
const literata = Literata({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: siteName(), template: `%s | ${siteName()}` },
  description: `${siteName()}, a blog by ${authorName()}, published with scatterpost.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={literata.variable}>
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-4 py-8 sm:px-6">
          <header className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <Link href="/" className="tap-target text-lg font-semibold">
              {siteName()}
            </Link>
            <nav>
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
              .
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
