#!/usr/bin/env node
/**
 * Runs typecheck, lint, test and build in every template folder that has
 * its own package.json. Each template is self-contained (its own
 * package-lock.json, no workspace: or @scatterpost/* deps), so this
 * shells out to `npm run <script>` inside each folder rather than using
 * any monorepo tool.
 */
import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const scripts = ["typecheck", "lint", "test", "build"];

async function templateDirs() {
  const entries = await readdir(repoRoot, { withFileTypes: true });
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "shared" || entry.name === "scripts" || entry.name === "node_modules" || entry.name.startsWith(".")) {
      continue;
    }
    try {
      await readFile(path.join(repoRoot, entry.name, "package.json"), "utf8");
      dirs.push(entry.name);
    } catch {
      // Not a template folder yet.
    }
  }
  return dirs;
}

const templates = await templateDirs();
let failed = false;

for (const template of templates) {
  const cwd = path.join(repoRoot, template);
  for (const script of scripts) {
    console.log(`\n--- ${template}: npm run ${script} ---`);
    const result = spawnSync("npm", ["run", script], { cwd, stdio: "inherit" });
    if (result.status !== 0) {
      failed = true;
    }
  }
}

process.exit(failed ? 1 : 0);
