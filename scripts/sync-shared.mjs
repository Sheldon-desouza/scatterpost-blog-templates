#!/usr/bin/env node
/**
 * Copies every file in `shared/` into `<template>/src/lib/scatterpost/`
 * for each template folder that has one, so the scatterpost connector
 * code (signature verification, payload validation, the content stores,
 * pull, slugify, safe-html, render-markdown, and their tests) lives once
 * and every template gets an identical, self-contained copy with no
 * runtime dependency back on this repository's `shared/` folder.
 *
 * `node scripts/sync-shared.mjs` copies shared/ into every template.
 * `node scripts/sync-shared.mjs --check` copies nothing: it compares
 * each template's existing copy against shared/ byte for byte and exits
 * 1 if any file differs or is missing, so CI (and `npm run check`) can
 * catch a hand-edited copy that has drifted from the source of truth.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sharedDir = path.join(repoRoot, "shared");

// Every top-level folder that is a template (has its own package.json),
// other than the repo's own tooling folders.
async function templateDirs() {
  const entries = await readdir(repoRoot, { withFileTypes: true });
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "shared" || entry.name === "scripts" || entry.name === "node_modules" || entry.name.startsWith(".")) {
      continue;
    }
    const pkgPath = path.join(repoRoot, entry.name, "package.json");
    try {
      await readFile(pkgPath, "utf8");
      dirs.push(entry.name);
    } catch {
      // Not a template folder (no package.json yet): skip it.
    }
  }
  return dirs;
}

async function sharedFiles() {
  const entries = await readdir(sharedDir, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
}

async function main() {
  const check = process.argv.includes("--check");
  const templates = await templateDirs();
  const files = await sharedFiles();

  let drifted = false;

  for (const template of templates) {
    const destDir = path.join(repoRoot, template, "src", "lib", "scatterpost");

    for (const file of files) {
      const sourcePath = path.join(sharedDir, file);
      const destPath = path.join(destDir, file);
      const sourceContents = await readFile(sourcePath, "utf8");

      if (check) {
        let destContents;
        try {
          destContents = await readFile(destPath, "utf8");
        } catch {
          console.error(`Missing copy: ${path.relative(repoRoot, destPath)}`);
          drifted = true;
          continue;
        }
        if (destContents !== sourceContents) {
          console.error(`Drifted copy: ${path.relative(repoRoot, destPath)} does not match shared/${file}`);
          drifted = true;
        }
      } else {
        await mkdir(destDir, { recursive: true });
        await writeFile(destPath, sourceContents, "utf8");
      }
    }
  }

  if (check) {
    if (drifted) {
      console.error("\nRun `node scripts/sync-shared.mjs` to resync, then commit the result.");
      process.exit(1);
    }
    console.log(`shared/ is in sync with: ${templates.join(", ") || "(no templates found)"}`);
  } else {
    console.log(`Synced shared/ into: ${templates.join(", ") || "(no templates found)"}`);
  }
}

await main();
