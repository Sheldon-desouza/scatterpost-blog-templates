import Link from "next/link";

/**
 * Next's own not-found page for any path that falls through every
 * route, including an IndexNow key request that does not match
 * `INDEXNOW_KEY` (`src/app/[key]/route.ts`, security re-review
 * LOW-1). Deliberately plain for now; the design session restyles it
 * along with everything else.
 */
export default function NotFound() {
  return (
    <div className="measure flex flex-col gap-4">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-[var(--muted-foreground)]">
        There is nothing at this address. It may have moved, or never existed.
      </p>
      <p>
        <Link href="/" className="tap-target underline">
          Back to the home page
        </Link>
      </p>
    </div>
  );
}
