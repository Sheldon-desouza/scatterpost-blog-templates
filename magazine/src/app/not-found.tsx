import Link from "next/link";

/**
 * Next's own not-found page for any path that falls through every
 * route, including an IndexNow key request that does not match
 * `INDEXNOW_KEY` (`src/app/api/indexnow-key/[key]/route.ts`, security re-review LOW-1).
 */
export default function NotFound() {
  return (
    <div className="index-page measure">
      <h1 className="index-page-heading">Page not found</h1>
      <p className="story-card-dek">There is nothing at this address. It may have moved, or never existed.</p>
      <p>
        <Link href="/" className="tap-target">
          Back to the home page
        </Link>
      </p>
    </div>
  );
}
