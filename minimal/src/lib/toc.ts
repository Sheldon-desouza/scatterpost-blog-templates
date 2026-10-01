/**
 * Post-processes the already-sanitised post HTML (see
 * `scatterpost/render-markdown.ts`) for two presentational things the
 * renderer itself does not do: a stable `id` on every h2/h3 so a hover
 * anchor link can point at it, and the ordered list of h2s used to build
 * the sticky table of contents in the post page's right gutter.
 *
 * Deliberately a small regex pass rather than a DOM parser: the input
 * is this template's own sanitised output (a closed, known tag set), not
 * arbitrary HTML, and this keeps the template free of a DOM dependency.
 */

export interface TocEntry {
  id: string;
  text: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function textOf(headingInnerHtml: string): string {
  return headingInnerHtml.replace(/<[^>]+>/g, "").trim();
}

export function annotateHeadings(html: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const seen = new Map<string, number>();

  const annotated = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_match, level: string, inner: string) => {
    const text = textOf(inner);
    let id = slugify(text) || "section";
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;

    if (level === "2") toc.push({ id, text });

    return `<h${level} id="${id}">${inner}<a href="#${id}" class="heading-anchor" aria-label="Link to this section">#</a></h${level}>`;
  });

  return { html: annotated, toc };
}
