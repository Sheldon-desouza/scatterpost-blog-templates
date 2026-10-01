"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  isValidGaMeasurementId,
  requestReopenConsentBanner,
  subscribeToConsentChange,
  subscribeToReopenRequest,
  writeConsentCookie,
} from "../lib/scatterpost/ga-consent.ts";

/**
 * Shown only while `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set and the
 * visitor has not yet chosen (or has reopened their choice from the
 * footer's `CookieSettingsLink`). Neither GA nor the `blog_consent`
 * cookie is touched until a button is pressed; `SiteAnalytics` is what
 * actually loads GA, once the cookie says `"granted"`.
 *
 * `useSyncExternalStore`'s server snapshot is `null` (see
 * `getServerConsentSnapshot`), matching what the client reads before
 * hydration runs, so there is no hydration mismatch here.
 */
export function ConsentBanner() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const consent = useSyncExternalStore(subscribeToConsentChange, getConsentSnapshot, getServerConsentSnapshot);
  const [reopened, setReopened] = useState(false);

  useEffect(() => subscribeToReopenRequest(() => setReopened(true)), []);

  if (!isValidGaMeasurementId(measurementId)) return null;
  if (consent !== null && !reopened) return null;

  function choose(value: "granted" | "denied") {
    writeConsentCookie(value);
    setReopened(false);
  }

  return (
    <div
      role="region"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)] p-4"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          This site uses Google Analytics to understand how it is read. No tracking cookie is set unless you
          accept.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="tap-target rounded border border-[var(--border)] px-4"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="tap-target rounded bg-[var(--accent)] px-4 text-[var(--accent-foreground)]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/** Reopens `ConsentBanner` even after a choice was already made. Lives
 * in the footer; renders nothing when GA is not configured, since
 * there is then no choice to revisit. */
export function CookieSettingsLink() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!isValidGaMeasurementId(measurementId)) return null;

  return (
    <button
      type="button"
      onClick={() => requestReopenConsentBanner()}
      className="underline"
    >
      Cookie settings
    </button>
  );
}
