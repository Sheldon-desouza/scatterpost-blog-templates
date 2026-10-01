import { demoDeployUrl, demoGalleryUrl, demoTemplateName } from "../lib/demo.ts";

/**
 * A slim bar shown above the header only while `NEXT_PUBLIC_DEMO_TEMPLATE`
 * is set, i.e. only on demo.scatterpost.io: a founder's own deploy of
 * this template never sets that var, so this never renders for them.
 */
export function DemoBar() {
  const name = demoTemplateName();
  if (!name) return null;

  return (
    <div className="demo-bar" role="region" aria-label="Demo template notice">
      <p>You are viewing the {name} template.</p>
      <nav className="demo-bar-links" aria-label="Demo actions">
        <a href={demoDeployUrl()} className="tap-target" rel="noopener noreferrer">
          Use this template
        </a>
        <a href={demoGalleryUrl()} className="tap-target" rel="noopener noreferrer">
          See all templates
        </a>
      </nav>
    </div>
  );
}
