#!/usr/bin/env node
/**
 * Exits 1 if `demo/vercel.json` still contains any `REPLACE-` placeholder
 * (the rewrite destinations left for each template's deployed demo
 * project URL). Run before every deploy of the demo hub, so a forgotten
 * placeholder fails the build instead of shipping a broken rewrite.
 * Document this as the hub Vercel project's build command, e.g.
 * `node ../scripts/check-demo-hub.mjs`, so the deploy itself fails
 * while a placeholder remains.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const vercelJsonPath = path.join(repoRoot, "demo", "vercel.json");

const contents = await readFile(vercelJsonPath, "utf8");

if (contents.includes("REPLACE-")) {
  console.error(
    `${vercelJsonPath} still contains a "REPLACE-" placeholder. Set every rewrite ` +
      `destination to the real deployed demo project URL before deploying the hub.`,
  );
  process.exit(1);
}

console.log(`${vercelJsonPath} has no "REPLACE-" placeholders left.`);
