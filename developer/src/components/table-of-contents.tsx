import type { TocItem } from "../lib/render-post-html.ts";

/**
 * Server-rendered: a native `<details>` needs no JavaScript to be
 * collapsible on a narrow screen, and `globals.css` forces it open and
 * hides the toggle at 1280px and up, where it becomes the sticky
 * sidebar instead.
 */
export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <details className="toc" open>
      <summary className="toc-summary tap-target">Contents</summary>
      <nav aria-label="Table of contents">
        <ol className="toc-list">
          {items.map((item) => (
            <li key={item.id} className={item.level === 3 ? "toc-item toc-item-nested" : "toc-item"}>
              <a href={`#${item.id}`}>{item.text}</a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
