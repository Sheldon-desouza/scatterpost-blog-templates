import Link from "next/link";

/**
 * Next's own not-found page for any path that falls through every
 * route, including an IndexNow key request that does not match
 * `INDEXNOW_KEY` (`src/app/[key]/route.ts`, security re-review LOW-1).
 */
export default function NotFound() {
  return (
    <div className="measure flex flex-col gap-4">
      <h1 className="entry-h1">Page not found</h1>
      <p className="page-description">There is nothing at this address. It may have moved, or never existed.</p>
      <p>
        <Link href="/" className="tap-target muted-link">
          Back to the home page
        </Link>
      </p>
    </div>
  );
}
