import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./render-markdown.ts";

describe("renderMarkdown", () => {
  it("renders a heading and a paragraph", () => {
    const html = renderMarkdown("# Hello\n\nBody text.");
    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain("<p>Body text.</p>");
  });

  it("strips a script tag", () => {
    const html = renderMarkdown("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
  });

  it("forces rel=\"noopener noreferrer\" onto a link that opens a new tab, even one that already carries a different rel (security review L7)", () => {
    const html = renderMarkdown('<a href="https://example.com" target="_blank" rel="opener">Link</a>');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain('rel="opener"');
  });

  it("does not add rel to a link with no target", () => {
    const html = renderMarkdown('<a href="https://example.com">Link</a>');
    expect(html).not.toContain("rel=");
  });

  it("strips a class from a code tag, since this template has no highlighter to style (security review L7)", () => {
    const html = renderMarkdown('<code class="evil">x</code>');
    expect(html).not.toContain("class=");
  });
});
