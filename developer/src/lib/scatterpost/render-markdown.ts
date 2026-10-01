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
    // No tag here ever needs a class (this template has no syntax
    // highlighter to style), `code` included: an explicit empty list
    // closes the gap where a tag with no `allowedClasses` entry but an
    // allowed `class` attribute would otherwise let any class value
    // through unrestricted (security review L7).
    allowedClasses: {},
    // A raw `<a target="_blank">` in the Markdown (scatterpost's own
    // render, or an agent's raw HTML) opens a new tab that still shares
    // `window.opener` with this page unless `rel="noopener noreferrer"`
    // is present; forced here rather than merely allowed, so a missing
    // or wrong `rel` on the source link can never slip through
    // (security review L7).
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.target ? { ...attribs, rel: "noopener noreferrer" } : attribs,
      }),
    },
  });
}
