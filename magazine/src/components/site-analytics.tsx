"use client";

import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  isValidGaMeasurementId,
  subscribeToConsentChange,
} from "../lib/scatterpost/ga-consent.ts";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
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
    window.gtag =
      window.gtag ??
      function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
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
    window.gtag("consent", "update", {
      analytics_storage: consent === "granted" ? "granted" : "denied",
    });
  }, [configured, consent]);

  if (!configured || consent !== "granted") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`}
      </Script>
    </>
  );
}
