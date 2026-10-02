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
