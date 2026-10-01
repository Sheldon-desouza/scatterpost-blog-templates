import { describe, expect, it } from "vitest";
import { renderPostHtml } from "./render-post-html.ts";

describe("renderPostHtml", () => {
  it("highlights a fenced code block and keeps headings as linked anchors", async () => {
    const { html, toc } = await renderPostHtml([
      "## First heading",
      "",
      "```js",
      "const a = 1;",
      "```",
      "",
      "### Second heading",
    ].join("\n"));

    expect(html).toContain('class="shiki');
    expect(html).toContain('<h2 id="first-heading"><a href="#first-heading" class="heading-anchor">First heading</a></h2>');
    expect(html).toContain('<h3 id="second-heading"');
    expect(toc).toEqual([
      { id: "first-heading", text: "First heading", level: 2 },
      { id: "second-heading", text: "Second heading", level: 3 },
    ]);
  });

  it("gives duplicate headings unique anchor ids, matching the table of contents", async () => {
    const { toc } = await renderPostHtml(["## Setup", "", "text", "", "## Setup"].join("\n"));
    expect(toc.map((item) => item.id)).toEqual(["setup", "setup-1"]);
  });

  it("never lets a malicious code fence inject a script or an event handler", async () => {
    const { html } = await renderPostHtml([
      "```js",
      '<img src=x onerror=alert(1)>',
      "<script>alert(2)</script>",
      "```",
    ].join("\n"));

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("onerror=");
    expect(html).not.toContain("<img ");
    expect(html).toContain("&lt;");
  });

  it("never lets a malicious language tag inject an attribute", async () => {
    const { html } = await renderPostHtml([
      '```js"onload="evil(1)',
      "const a = 1;",
      "```",
    ].join("\n"));

    expect(html).not.toContain("onload=");
    expect(html).not.toContain('"evil(1)');
  });

  it("sanitises a heading that contains a raw script tag", async () => {
    const { html } = await renderPostHtml("## Hello <script>alert(1)</script>");
    expect(html).not.toContain("<script>");
  });
});
