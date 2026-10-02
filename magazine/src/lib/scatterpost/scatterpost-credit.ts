/**
 * The "Built with a scatterpost template" footer line: plain
 * attribution to where the template came from, separate from the
 * "Published with scatterpost" badge in `config.ts` (which only
 * appears once a Website channel is actually connected). This one is
 * static and shown by default, since it costs the founder nothing to
 * leave on and it is how other founders find the templates. Set
 * `NEXT_PUBLIC_SHOW_SCATTERPOST_CREDIT=false` to hide it.
 */
export function showScatterpostCredit(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_SCATTERPOST_CREDIT !== "false";
}

/**
 * A footer should never carry two scatterpost mentions. The older
 * "Published with scatterpost." sentence (`showScatterpostBadge()` in
 * each template's `config.ts`) only ever shows when the newer credit
 * line above is switched off: `NEXT_PUBLIC_SHOW_SCATTERPOST_CREDIT=false`
 * brings it back, and setting both env vars to `false` shows neither.
 */
export function showPublishedWithBadge(creditShown: boolean, badgeEnabled: boolean): boolean {
  return !creditShown && badgeEnabled;
}
