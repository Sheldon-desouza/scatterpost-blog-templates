/**
 * Consent gating for the optional GA4 analytics script (UK PECR): GA
 * never loads, and no cookie is ever set, until a visitor actively
 * chooses. The choice itself lives in a first-party cookie
 * (`blog_consent`, 12 months, `SameSite=Lax`) rather than in GA's own
 * cookies, which only Accept ever sets.
 *
 * Pure helpers (validation, cookie parsing and building) are
 * DOM-independent so they can be unit tested without a browser; the
 * read/write/subscribe helpers below them are the client-only half,
 * used by `ConsentBanner` and `SiteAnalytics` via
 * `useSyncExternalStore`.
 */

export const CONSENT_COOKIE_NAME = "blog_consent";
export type ConsentValue = "granted" | "denied";

// A GA4 measurement id, e.g. "G-ABC1234567". Validated so a malformed
// or empty env value is treated the same as unset (no banner, no
// script) rather than reaching googletagmanager.com as a broken URL.
const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Za-z0-9]{4,}$/;

export function isValidGaMeasurementId(value: string | undefined | null): value is string {
  return typeof value === "string" && GA_MEASUREMENT_ID_PATTERN.test(value);
}

export function readConsentCookie(cookieHeader: string): ConsentValue | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE_NAME}=(granted|denied)`));
  return match ? (match[1] as ConsentValue) : null;
}

const TWELVE_MONTHS_IN_SECONDS = 60 * 60 * 24 * 365;

export function buildConsentCookie(value: ConsentValue): string {
  return `${CONSENT_COOKIE_NAME}=${value}; Max-Age=${TWELVE_MONTHS_IN_SECONDS}; Path=/; SameSite=Lax`;
}

const CONSENT_CHANGE_EVENT = "scatterpost:consent-change";
const CONSENT_REOPEN_EVENT = "scatterpost:consent-reopen";

/** Writes the visitor's choice and notifies every mounted
 * `ConsentBanner` and `SiteAnalytics` instance on the page. */
export function writeConsentCookie(value: ConsentValue): void {
  document.cookie = buildConsentCookie(value);
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

export function subscribeToConsentChange(callback: () => void): () => void {
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
}

/** Read on the client only: `document` is unavailable during SSR, so
 * `useSyncExternalStore`'s server snapshot (below) must stay `null`
 * rather than calling this, or hydration would mismatch. */
export function getConsentSnapshot(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  return readConsentCookie(document.cookie);
}

export function getServerConsentSnapshot(): null {
  return null;
}

/** The "Cookie settings" footer link calls this to reopen the banner
 * even though a choice was already made. */
export function requestReopenConsentBanner(): void {
  window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT));
}

export function subscribeToReopenRequest(callback: () => void): () => void {
  window.addEventListener(CONSENT_REOPEN_EVENT, callback);
  return () => window.removeEventListener(CONSENT_REOPEN_EVENT, callback);
}
