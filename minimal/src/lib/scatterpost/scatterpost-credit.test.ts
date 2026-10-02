import { afterEach, describe, expect, it } from "vitest";
import { showScatterpostCredit } from "./scatterpost-credit.ts";

describe("showScatterpostCredit", () => {
  const original = process.env.NEXT_PUBLIC_SHOW_SCATTERPOST_CREDIT;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_SHOW_SCATTERPOST_CREDIT;
    } else {
      process.env.NEXT_PUBLIC_SHOW_SCATTERPOST_CREDIT = original;
    }
  });

  it("is on by default when the env var is unset", () => {
    delete process.env.NEXT_PUBLIC_SHOW_SCATTERPOST_CREDIT;
    expect(showScatterpostCredit()).toBe(true);
  });

  it("is off only when the env var is exactly 'false'", () => {
    process.env.NEXT_PUBLIC_SHOW_SCATTERPOST_CREDIT = "false";
    expect(showScatterpostCredit()).toBe(false);
  });

  it("stays on for any other value", () => {
    process.env.NEXT_PUBLIC_SHOW_SCATTERPOST_CREDIT = "0";
    expect(showScatterpostCredit()).toBe(true);
  });
});
