"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "theme";
const ORDER: Theme[] = ["system", "light", "dark"];
const LABEL: Record<Theme, string> = { system: "System", light: "Light", dark: "Dark" };

function apply(theme: Theme): void {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

/**
 * Cycles system -> light -> dark -> system, persisted to
 * `localStorage` and applied as `data-theme` on `<html>` (see the
 * inline script in `layout.tsx` for the no-flash first paint). Renders
 * "System" until mounted, matching the server-rendered markup exactly,
 * then reads the real stored choice.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    // Reads the one-time choice `localStorage` already holds (an
    // external system), so the button's label agrees with the palette
    // the no-flash script in layout.tsx already applied before mount.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored);
    }
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length] ?? "system";
    setTheme(next);
    apply(next);
    if (next === "system") {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className="tap-target theme-toggle"
      aria-label={`Theme: ${LABEL[theme]}. Click to change.`}
    >
      {LABEL[theme]}
    </button>
  );
}
