import Link from "next/link";
import { slugify } from "../lib/scatterpost/slugify.ts";

export function TagChips({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="tag-list" aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag}>
          <Link href={`/tags/${slugify(tag)}`} className="tag-chip">
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
