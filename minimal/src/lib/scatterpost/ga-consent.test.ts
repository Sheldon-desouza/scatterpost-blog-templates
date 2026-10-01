import { describe, expect, it } from "vitest";
import {
  buildConsentCookie,
  buildExpiredCookie,
  gaCookieNamesIn,
  isValidGaMeasurementId,
  readConsentCookie,
  registrableDomainOf,
} from "./ga-consent.ts";

describe("isValidGaMeasurementId", () => {
  it("accepts a well-formed GA4 measurement id", () => {
    expect(isValidGaMeasurementId("G-ABC1234567")).toBe(true);
  });

  it("rejects an unset, empty or malformed value", () => {
    expect(isValidGaMeasurementId(undefined)).toBe(false);
    expect(isValidGaMeasurementId(null)).toBe(false);
    expect(isValidGaMeasurementId("")).toBe(false);
    expect(isValidGaMeasurementId("UA-12345-1")).toBe(false);
    expect(isValidGaMeasurementId("G-")).toBe(false);
    expect(isValidGaMeasurementId("not-a-measurement-id")).toBe(false);
  });
});

describe("readConsentCookie", () => {
  it("returns null when the cookie is absent", () => {
    expect(readConsentCookie("")).toBeNull();
    expect(readConsentCookie("other=value")).toBeNull();
  });

  it("reads granted or denied from a cookie header with other cookies around it", () => {
    expect(readConsentCookie("blog_consent=granted")).toBe("granted");
    expect(readConsentCookie("foo=bar; blog_consent=denied; baz=qux")).toBe("denied");
  });

  it("ignores an invalid value rather than returning it", () => {
    expect(readConsentCookie("blog_consent=maybe")).toBeNull();
  });
});

describe("buildConsentCookie", () => {
  it("sets a 12-month, SameSite=Lax, path-/ first-party cookie", () => {
    const cookie = buildConsentCookie("granted");
    expect(cookie).toContain("blog_consent=granted");
    expect(cookie).toContain("Max-Age=31536000");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("SameSite=Lax");
  });
});

describe("gaCookieNamesIn", () => {
  it("picks out _ga and every _ga_<container> cookie, ignoring others", () => {
    expect(gaCookieNamesIn("_ga=GA1.1.1; _ga_ABC123=GS1.1.1; blog_consent=granted; other=x")).toEqual([
      "_ga",
      "_ga_ABC123",
    ]);
  });

  it("returns an empty list when there are no GA cookies", () => {
    expect(gaCookieNamesIn("blog_consent=granted; other=x")).toEqual([]);
  });
});

describe("registrableDomainOf", () => {
  it("returns the last two labels for a normal host", () => {
    expect(registrableDomainOf("www.example.com")).toBe("example.com");
    expect(registrableDomainOf("example.com")).toBe("example.com");
  });

  it("returns null for a single-label host such as localhost", () => {
    expect(registrableDomainOf("localhost")).toBeNull();
  });
});

describe("buildExpiredCookie", () => {
  it("expires a cookie on Path=/ with Max-Age=0", () => {
    expect(buildExpiredCookie("_ga")).toBe("_ga=; Max-Age=0; Path=/");
  });

  it("includes a Domain when one is given", () => {
    expect(buildExpiredCookie("_ga", ".example.com")).toBe("_ga=; Max-Age=0; Path=/; Domain=.example.com");
  });
});
