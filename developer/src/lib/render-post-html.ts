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

  const codeBlocks = new Map<string, { code: string; lang: string }>();
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
    codeBlocks.set(id, { code: token.text, lang: safeLanguage(token.lang) });
    return `<div data-code-placeholder="${id}"></div>`;
  };

  let rendered = marked.parser(tokens, { renderer });

  for (const [id, { code, lang }] of codeBlocks) {
    const highlighted = await highlight(code, lang);
    rendered = rendered.replace(`<div data-code-placeholder="${id}"></div>`, highlighted);
  }

  const html = sanitizeHtml(rendered, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title"],
      a: ["href", "name", "target", "rel", "class"],
      h2: ["id"],
      h3: ["id"],
      pre: ["class", "style", "tabindex"],
      code: ["class", "style"],
      span: ["class", "style"],
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
  });

  return { html, toc };
}
