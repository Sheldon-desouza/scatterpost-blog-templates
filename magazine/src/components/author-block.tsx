import { authorName } from "../lib/site.ts";
import { AUTHOR_PHOTO, BIO, SOCIAL_LINKS } from "../lib/config.ts";
import { withBasePath } from "../lib/scatterpost/post-paths.ts";

/** The author block at the foot of the home page: an optional photo,
 * the author's name and a short bio, plus a quiet row of elsewhere
 * links. `AUTHOR_PHOTO` is unset by default, so this renders with no
 * image rather than a stock photo until a founder adds their own. */
export function AuthorBlock() {
  return (
    <section className="author-block" aria-label="About the author">
      {AUTHOR_PHOTO ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={withBasePath(AUTHOR_PHOTO)} alt="" width={96} height={96} className="author-photo" loading="lazy" />
      ) : null}
      <div>
        <p className="author-name">{authorName()}</p>
        <p className="author-bio">{BIO}</p>
        {SOCIAL_LINKS.length > 0 ? (
          <nav className="author-links" aria-label="Elsewhere">
            {SOCIAL_LINKS.map((link) => (
              <a key={link.href} href={withBasePath(link.href)} className="tap-target">
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </section>
  );
}
