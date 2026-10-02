/**
 * Renders a post's Markdown body for the post page: `marked` walks the
 * same token list twice (once here to build the table of contents,
 * once inside `marked.parser` to build the HTML), with syntax
 * highlighting of fenced code blocks by Shiki run at render time on
 * the server, and the result sanitised with `sanitize-html` exactly
 * like the plain `renderMarkdown` every other template uses.
 *
 * Highlighting never weakens sanitisation: Shiki itself HTML-escapes
 * the code it tokenises (a fenced block of `<script>...</script>` is
 * rendered as literal text, never executed), the language tag is
 * restricted to a safe character set before it ever reaches Shiki, and
 * the highlighted markup is still passed through `sanitize-html`
 * afterwards. See `render-post-html.test.ts`.
 */
import { marked, type Tokens } from "marked";
import sanitizeHtml from "sanitize-html";
import { codeToHtml } from "shiki";
import { slugify } from "./scatterpost/slugify.ts";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface RenderedPost {
  html: string;
  toc: TocItem[];
}

/** Strips the handful of inline Markdown marks a heading is likely to
 * use, so the table of contents and the anchor id are built from plain
 * text rather than `**bold**` or `` `code` ``. */
function plainText(raw: string): string {
  return raw.replace(/[*_`~]/g, "").trim();
}

/** A fresh counter per render: the same (text, level) sequence, walked
 * in the same document order by the table-of-contents pass and by the
 * renderer's own heading pass, always produces the same ids, so the
 * two never drift apart without needing to share state directly. */
function createSlugger(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = slugify(text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

// Only word characters, `+`, `#` and `.` ever name a real Shiki
// language (`c++`, `c#`, `.env`); anything else is almost certainly not
// a language at all, so it is dropped rather than passed through to
// Shiki or into the rendered markup.
const SAFE_LANGUAGE = /^[A-Za-z0-9+#.-]*$/;

function safeLanguage(lang: string | undefined): string {
  const first = (lang ?? "").trim().split(/\s+/)[0] ?? "";
  return SAFE_LANGUAGE.test(first) ? first : "";
}

/**
 * A fenced block's info string can name a filename after the language
 * (e.g. ```ts src/app.ts```), which the code tab shows instead of the
 * bare language when present. Restricted to a safe, printable filename
 * shape for the same reason as `safeLanguage`: this reaches the page as
 * a plain text label, but it still should never carry markup or control
 * characters through to the rendered HTML attribute.
 */
const SAFE_FILENAME = /^[A-Za-z0-9+#._/-]{1,80}$/;

function safeFilename(lang: string | undefined): string {
  const rest = (lang ?? "").trim().split(/\s+/).slice(1).join(" ");
  return SAFE_FILENAME.test(rest) ? rest : "";
}

/**
 * Escapes a value for use inside a double-quoted HTML attribute. The
 * language and filename labels below are plain text, not markup, but
 * are concatenated straight into the rendered HTML string rather than
 * set through the DOM, so this closes off the same injection the rest
 * of this file sanitises against.
 */
function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function highlight(code: string, lang: string): Promise<string> {
  try {
    return await codeToHtml(code, {
      lang: lang || "text",
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    });
  } catch {
    // Unknown language (or one Shiki does not ship a grammar for):
    // fall back to plain text rather than fail the whole post.
    return codeToHtml(code, {
      lang: "text",
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    });
  }
}

export async function renderPostHtml(bodyMarkdown: string): Promise<RenderedPost> {
  const tokens = marked.lexer(bodyMarkdown);

  const toc: TocItem[] = [];
  const tocSlugger = createSlugger();
  for (const token of tokens) {
    if (token.type === "heading" && (token.depth === 2 || token.depth === 3)) {
      toc.push({ id: tocSlugger(plainText(token.text)), text: plainText(token.text), level: token.depth });
    }
  }

  const codeBlocks = new Map<string, { code: string; lang: string; filename: string }>();
  let codeBlockIndex = 0;
  const headingSlugger = createSlugger();

  const renderer = new marked.Renderer();

  renderer.heading = function heading(token: Tokens.Heading): string {
    const html = this.parser.parseInline(token.tokens);
    if (token.depth !== 2 && token.depth !== 3) {
      return `<h${token.depth}>${html}</h${token.depth}>`;
    }
    const id = headingSlugger(plainText(token.text));
    return `<h${token.depth} id="${id}"><a href="#${id}" class="heading-anchor">${html}</a></h${token.depth}>`;
  };

  renderer.code = function code(token: Tokens.Code): string {
    const id = `code-placeholder-${codeBlockIndex++}`;
    codeBlocks.set(id, { code: token.text, lang: safeLanguage(token.lang), filename: safeFilename(token.lang) });
    return `<div data-code-placeholder="${id}"></div>`;
  };

  // A blockquote whose first line reads "Note:" or "Warning:" becomes a
  // tinted callout box instead of a plain quote: the label is lifted out
  // of the paragraph into its own kicker, so the remaining text reads as
  // the body of the note rather than repeating the word.
  renderer.blockquote = function blockquote(token: Tokens.Blockquote): string {
    const inner = this.parser.parse(token.tokens);
    const match = inner.match(/^<p>(Note|Warning):\s*/);
    if (!match) {
      return `<blockquote>${inner}</blockquote>`;
    }
    const kind = match[1] === "Note" ? "note" : "warning";
    const stripped = inner.replace(/^<p>(Note|Warning):\s*/, "<p>");
    return `<div class="callout callout-${kind}"><p class="callout-label">${match[1]}</p>${stripped}</div>`;
  };

  let rendered = marked.parser(tokens, { renderer });

  for (const [id, { code, lang, filename }] of codeBlocks) {
    const highlighted = await highlight(code, lang);
    const label = filename || lang;
    const tab = label
      ? `<div class="code-tab"><span class="code-tab-label">${escapeAttribute(label)}</span></div>`
      : "";
    const wrapped = `<div class="code-block"${lang ? ` data-lang="${escapeAttribute(lang)}"` : ""}${filename ? ` data-filename="${escapeAttribute(filename)}"` : ""}>${tab}${highlighted}</div>`;
    // A plain string second argument to `String.replace` treats `$&`,
    // `$1`, `` $` `` etc. in it as replacement patterns, not literal
    // text (security review L1): a code block whose highlighted output
    // happens to contain one of those sequences (nothing stops a code
    // sample from containing the literal text "$&") would corrupt the
    // rendered HTML around it. A replacer function's return value is
    // always used verbatim.
    const placeholder = `<div data-code-placeholder="${id}"></div>`;
    rendered = rendered.replace(placeholder, () => wrapped);
  }

  const html = sanitizeHtml(rendered, {
    // `kbd` has no fenced-code or inline-markdown syntax of its own, so
    // it only ever reaches a post through raw HTML scatterpost's render
    // already allows through (see `renderMarkdown`'s own allowlist);
    // listed here so the keyboard-key styling in globals.css has
    // something to target rather than the tag being stripped.
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "kbd"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title"],
      a: ["href", "name", "target", "rel", "class"],
      h2: ["id"],
      h3: ["id"],
      pre: ["class", "style", "tabindex"],
      code: ["class", "style"],
      span: ["class", "style"],
      div: ["class", "data-lang", "data-filename"],
      p: ["class"],
    },
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-fA-F]{3,8}$/],
        "background-color": [/^#[0-9a-fA-F]{3,8}$/],
        "--shiki-dark": [/^#[0-9a-fA-F]{3,8}$/],
        "--shiki-light": [/^#[0-9a-fA-F]{3,8}$/],
        "--shiki-dark-bg": [/^#[0-9a-fA-F]{3,8}$/],
        "--shiki-light-bg": [/^#[0-9a-fA-F]{3,8}$/],
      },
    },
    // Restricted to the exact classes this renderer and Shiki ever put
    // on these tags: a raw `<pre class="...">` or `<span class="...">`
    // in the Markdown (scatterpost's own render, or an agent's raw
    // HTML) cannot smuggle an arbitrary class through to the page's own
    // CSS (security review L7). Any other class token is dropped, the
    // tag and its other attributes are kept. `code` is listed with no
    // classes at all: Shiki's own output never puts one there (the
    // highlighting lives on `pre` and `span`), and `code` still has
    // `class` in `allowedAttributes` above for the sanitiser to
    // recognise the tag, so leaving it out of `allowedClasses` would
    // otherwise let any class value through unrestricted (security
    // re-review L7).
    allowedClasses: {
      a: ["heading-anchor"],
      pre: ["shiki", "shiki-themes", "github-light", "github-dark"],
      code: [],
      span: ["line", "code-tab-label"],
      div: ["code-block", "code-tab", "callout", "callout-note", "callout-warning"],
      p: ["callout-label"],
    },
    // A raw `<a target="_blank">` shares `window.opener` with this page
    // unless `rel="noopener noreferrer"` is present; forced here rather
    // than merely allowed (security review L7).
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.target ? { ...attribs, rel: "noopener noreferrer" } : attribs,
      }),
    },
  });

  return { html, toc };
}
