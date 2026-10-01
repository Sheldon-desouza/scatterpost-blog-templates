import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { Cover } from "./cover.tsx";

function imgProps(element: ReactElement): { alt?: string } {
  const div = element as unknown as { props: { children: ReactElement } };
  const img = div.props.children as unknown as { props: { alt?: string } };
  return img.props;
}

describe("Cover", () => {
  it("uses coverAlt as the cover image's alt text when present", () => {
    const element = Cover({ title: "Hello world", kicker: "Dispatch", cover: "https://example.com/cover.png", coverAlt: "A chart." });
    expect(imgProps(element).alt).toBe("A chart.");
  });

  it("falls back to an empty, decorative alt when coverAlt is absent (existing behaviour)", () => {
    const element = Cover({ title: "Hello world", kicker: "Dispatch", cover: "https://example.com/cover.png" });
    expect(imgProps(element).alt).toBe("");
  });
});
