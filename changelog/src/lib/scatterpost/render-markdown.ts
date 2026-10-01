/**
 * Renders post Markdown to HTML for the page and the RSS feed. `marked`
 * plus `sanitize-html` runs in plain Node with no DOM/jsdom dependency.
 */
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export function renderMarkdown(bodyMarkdown: string): string {
  const rendered = marked.parse(bodyMarkdown, { async: false }) as string;
  return sanitizeHtml(rendered, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title"],
      a: ["href", "name", "target", "rel"],
    },
  });
}
