import { afterEach, describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { DemoBar } from "./DemoBar.tsx";

const ENV_KEYS = ["NEXT_PUBLIC_DEMO_TEMPLATE", "NEXT_PUBLIC_DEMO_DEPLOY_URL", "NEXT_PUBLIC_DEMO_GALLERY_URL"] as const;

describe("DemoBar", () => {
  const originals = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (originals[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originals[key];
      }
    }
  });

  it("renders nothing when NEXT_PUBLIC_DEMO_TEMPLATE is unset", () => {
    delete process.env.NEXT_PUBLIC_DEMO_TEMPLATE;
    expect(DemoBar()).toBeNull();
  });

  it("renders the bar, naming the template, with both links, when the flag is set", () => {
    process.env.NEXT_PUBLIC_DEMO_TEMPLATE = "Minimal";
    process.env.NEXT_PUBLIC_DEMO_DEPLOY_URL = "https://vercel.com/new/clone?x";
    process.env.NEXT_PUBLIC_DEMO_GALLERY_URL = "https://demo.scatterpost.io/";

    const bar = DemoBar() as ReactElement<{ children: [ReactElement, ReactElement] }>;
    expect(bar).not.toBeNull();

    const [paragraph, nav] = bar.props.children;
    expect((paragraph.props as { children: unknown[] }).children.join("")).toBe(
      "You are viewing the Minimal template.",
    );

    const [useLink, galleryLink] = (nav.props as { children: ReactElement[] }).children as [ReactElement, ReactElement];
    expect((useLink.props as { href: string }).href).toBe("https://vercel.com/new/clone?x");
    expect((useLink.props as { rel: string }).rel).toBe("noopener noreferrer");
    expect((galleryLink.props as { href: string }).href).toBe("https://demo.scatterpost.io/");
    expect((galleryLink.props as { rel: string }).rel).toBe("noopener noreferrer");
  });

  it("falls back to this template's own deploy-clone URL and the default gallery URL", () => {
    process.env.NEXT_PUBLIC_DEMO_TEMPLATE = "Minimal";
    delete process.env.NEXT_PUBLIC_DEMO_DEPLOY_URL;
    delete process.env.NEXT_PUBLIC_DEMO_GALLERY_URL;

    const bar = DemoBar() as ReactElement<{ children: [ReactElement, ReactElement] }>;
    const [, nav] = bar.props.children;
    const [useLink, galleryLink] = (nav.props as { children: ReactElement[] }).children as [ReactElement, ReactElement];
    expect((useLink.props as { href: string }).href).toContain("vercel.com/new/clone");
    expect((galleryLink.props as { href: string }).href).toBe("https://demo.scatterpost.io/");
  });
});
