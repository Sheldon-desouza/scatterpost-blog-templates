"use client";

import { useEffect } from "react";

/**
 * Adds a "Copy code" button to every highlighted code block on the
 * page. The post body arrives as sanitised HTML from `renderPostHtml`
 * (via `dangerouslySetInnerHTML`), not as React elements, so the
 * button can't be rendered inline server-side; this client component
 * attaches one to each `pre.shiki` after the post mounts instead.
 */
export function CodeCopyButtons() {
  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll<HTMLPreElement>(".prose pre.shiki"));
    const cleanups: Array<() => void> = [];

    for (const pre of blocks) {
      if (pre.parentElement?.classList.contains("code-block")) {
        continue;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "code-block";
      pre.replaceWith(wrapper);
      wrapper.appendChild(pre);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-code-button tap-target";
      button.setAttribute("aria-label", "Copy code to clipboard");
      button.textContent = "Copy";

      let resetTimer: ReturnType<typeof setTimeout> | undefined;
      const onClick = () => {
        const code = pre.querySelector("code")?.textContent ?? "";
        void navigator.clipboard.writeText(code).then(() => {
          button.textContent = "Copied";
          button.setAttribute("aria-label", "Code copied to clipboard");
          clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            button.textContent = "Copy";
            button.setAttribute("aria-label", "Copy code to clipboard");
          }, 2000);
        });
      };
      button.addEventListener("click", onClick);
      wrapper.appendChild(button);

      cleanups.push(() => {
        clearTimeout(resetTimer);
        button.removeEventListener("click", onClick);
      });
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, []);

  return null;
}
