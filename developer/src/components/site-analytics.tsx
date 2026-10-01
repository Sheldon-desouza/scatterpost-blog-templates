"use client";

import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import {
  buildExpiredCookie,
  gaCookieNamesIn,
  getConsentSnapshot,
  getServerConsentSnapshot,
  isValidGaMeasurementId,
  registrableDomainOf,
  subscribeToConsentChange,
} from "../lib/scatterpost/ga-consent.ts";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Expires any `_ga`/`_ga_<container>` cookies GA already set, on both
 * the exact host and the leading-dot registrable domain, on
 * withdrawal (security re-review MED-2): the `gtag('consent',
 * 'update', ...)` call below stops further collection, but does not
 * remove cookies GA already wrote.
 */
function expireGaCookies(): void {
  if (typeof document === "undefined") return;
  const registrableDomain = registrableDomainOf(window.location.hostname);
  for (const name of gaCookieNamesIn(document.cookie)) {
    document.cookie = buildExpiredCookie(name);
    if (registrableDomain) {
      document.cookie = buildExpiredCookie(name, `.${registrableDomain}`);
    }
  }
}

/**
 * Loads GA4 (gtag.js from googletagmanager.com) once, and only once,
 * the visitor has accepted via `ConsentBanner`. When
 * `NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset or malformed, this renders
 * nothing and makes no `gtag` call at all. Google Consent Mode v2's
 * defaults (`denied`) are set before the GA script tag ever runs, and
 * withdrawing consent (Decline, or reopening and declining again) sends
 * `gtag('consent', 'update', ...)` with `denied` rather than reloading
 * or removing the script: Google's own guidance is that the update call
 * is what stops further collection, not the script's presence.
 */
export function SiteAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const consent = useSyncExternalStore(subscribeToConsentChange, getConsentSnapshot, getServerConsentSnapshot);
  const configured = isValidGaMeasurementId(measurementId);

  useEffect(() => {
    if (!configured || typeof window === "undefined") return;
    window.dataLayer = window.dataLayer ?? [];
    // gtag.js only recognises an `arguments` object pushed onto
    // dataLayer, not a real array (security re-review MED-1): the real
    // script, once loaded, silently ignores anything else, which would
    // have dropped this stub's `consent` calls.
    window.gtag =
      window.gtag ??
      function gtag() {
        // eslint-disable-next-line prefer-rest-params -- gtag.js's own stub relies on `arguments`, not a rest array.
        window.dataLayer!.push(arguments);
      };
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  }, [configured]);

  useEffect(() => {
    if (!configured || typeof window === "undefined" || !window.gtag) return;
    const granted = consent === "granted";
    window.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
    });
    if (consent === "denied") {
      expireGaCookies();
    }
  }, [configured, consent]);

  // The GA4 init calls (`gtag('js', ...)` and `gtag('config', ...)`)
  // run from here rather than an inline `<Script>` body (security
  // re-review LOW-4, CSP-friendly): they queue onto `dataLayer`
  // through the stub above regardless of whether gtag.js, loaded
  // below, has finished fetching yet.
  useEffect(() => {
    if (!configured || consent !== "granted" || typeof window === "undefined" || !window.gtag) return;
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
  }, [configured, consent, measurementId]);

  if (!configured || consent !== "granted") return null;

  return <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />;
}
