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

  it("does not corrupt the output when the highlighted code contains a $& replacement pattern (security review L1)", async () => {
    const { html } = await renderPostHtml(["```js", "const price = '$& off';", "```"].join("\n"));

    expect(html).toContain("$&amp;");
    expect(html).not.toContain("<div data-code-placeholder=");
  });

  it("forces rel=\"noopener noreferrer\" onto a link that opens a new tab, even one that already carries a different rel (security review L7)", async () => {
    const { html } = await renderPostHtml('<a href="https://example.com" target="_blank" rel="opener">Link</a>');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain('rel="opener"');
  });

  it("strips a class the renderer and Shiki never produce (security review L7)", async () => {
    const { html } = await renderPostHtml('<span class="line evil-exfil">text</span>');
    expect(html).toContain('class="line"');
    expect(html).not.toContain("evil-exfil");
  });

  it("strips any class from a code tag, since Shiki never puts one there (security re-review L7)", async () => {
    const { html } = await renderPostHtml('<code class="evil-exfil">x</code>');
    expect(html).not.toContain("evil-exfil");
    expect(html).not.toContain('<code class=');
  });
});
