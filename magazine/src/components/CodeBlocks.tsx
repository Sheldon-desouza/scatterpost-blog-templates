"use client";

import { useEffect, useRef } from "react";

/**
 * Enhances every `<pre><code>` in the post body after it mounts: a
 * language label read off a `language-*` class (when the source fence
 * named one) and a copy-to-clipboard button. Done as a small DOM pass
 * over server-rendered, sanitised HTML rather than a custom renderer,
 * since the body itself still comes from `dangerouslySetInnerHTML`.
 */
export function CodeBlocks() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current?.closest("article");
    if (!root) return;

    const blocks = root.querySelectorAll<HTMLPreElement>("pre");
    blocks.forEach((pre) => {
      if (pre.dataset.enhanced) return;
      pre.dataset.enhanced = "true";

      const code = pre.querySelector("code");
      const languageClass = code?.className.match(/language-(\S+)/)?.[1];

      const toolbar = document.createElement("div");
      toolbar.className = "code-toolbar";

      if (languageClass) {
        const label = document.createElement("span");
        label.className = "code-language";
        label.textContent = languageClass;
        toolbar.appendChild(label);
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy tap-target";
      button.textContent = "Copy";
      button.addEventListener("click", () => {
        navigator.clipboard
          .writeText(code?.textContent ?? "")
          .then(() => {
            button.textContent = "Copied";
            setTimeout(() => {
              button.textContent = "Copy";
            }, 2000);
          })
          .catch(() => {
            button.textContent = "Press Ctrl/Cmd+C";
          });
      });
      toolbar.appendChild(button);

      pre.style.position = "relative";
      pre.insertBefore(toolbar, pre.firstChild);
    });
  }, []);

  return <div ref={ref} className="hidden" aria-hidden="true" />;
}
