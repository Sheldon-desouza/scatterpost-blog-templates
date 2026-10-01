import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { authorName, siteName, siteUrl } from "../lib/site.ts";

/**
 * Fraunces: a characterful display serif with deliberate, slightly
 * dramatic curves, for headlines. Work Sans: a plain, highly readable
 * sans for body copy, so long articles do not fight the headline face.
 * Both are loaded once here and applied through `--font-display` and
 * `--font-body` CSS variables in globals.css, which is how next/font
 * avoids a layout-shifting webfont flash.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const workSans = Work_Sans({
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
    <html lang="en-GB" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="wide mx-auto flex min-h-screen flex-col gap-10 px-4 py-8 sm:px-6">
          <header className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <Link href="/" className="tap-target font-display text-lg font-semibold">
              {siteName()}
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/blog" className="tap-target underline">
                Blog
              </Link>
              <Link href="/tags" className="tap-target underline">
                Tags
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
