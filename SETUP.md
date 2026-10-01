# Search and analytics setup

A plain-English walkthrough for a founder with no technical background,
for whichever of the four templates you deployed. Every step below is
optional except the first: without it, search engines simply find your
site the slow way, by discovering links to it elsewhere.

None of this guarantees a ranking, a citation, or any particular amount
of traffic. It gives search engines and AI assistants a clean,
well-described, quickly-discovered copy of your site to read; what they
do with it after that is up to them.

## 1. Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
   and add your site (use the "URL prefix" option with your full
   `https://` address).
2. Choose the "HTML tag" verification method. Google gives you a code
   that looks like `abcdef123456...`.
3. In your Vercel project, add an environment variable
   `GOOGLE_SITE_VERIFICATION` set to that code, then redeploy (an env
   var change needs a new deploy to take effect).
4. Back in Search Console, click "Verify".
5. Once verified, go to "Sitemaps" and submit `sitemap.xml` (your full
   address plus `/sitemap.xml`, e.g. `https://yourblog.com/sitemap.xml`).
   This tells Google every page on your site and when each one last
   changed, so it can find new posts without having to guess.

## 2. Bing Webmaster Tools

1. Go to [bing.com/webmasters](https://www.bing.com/webmasters) and add
   your site the same way.
2. Choose the "Meta tag" verification method, which gives you a code.
3. Add it as `BING_SITE_VERIFICATION` in Vercel, and redeploy.
4. Verify, then submit `sitemap.xml` here too.

Bing's index is not just Bing search: it also feeds Microsoft Copilot
and several other AI assistants. This one step reaches further than it
looks.

## 3. Google Analytics (GA4), with a consent banner

This is entirely optional; skip it if you do not want visitor
analytics.

1. Create a GA4 property at
   [analytics.google.com](https://analytics.google.com) and find its
   "Measurement ID", which looks like `G-ABC1234567`.
2. Add it as `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel, and redeploy.
3. From then on, every visitor sees a small banner asking them to
   Accept or Decline analytics cookies. Nothing is tracked, and no
   cookie is set, until someone clicks Accept; Decline is remembered
   too, so the banner does not reappear. A "Cookie settings" link in
   the footer lets a visitor change their mind at any time.
4. Leaving `NEXT_PUBLIC_GA_MEASUREMENT_ID` unset means no banner, no
   script and no cookie ever appear, which is the default.

## 4. What `robots.txt` and `llms.txt` already do, with nothing to set up

Every template generates these automatically, with no environment
variable needed:

- `robots.txt` tells every crawler it is welcome, and explicitly names
  the crawlers behind AI search and assistants (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended), in case a hosting platform's default
  elsewhere would have blocked them.
- `llms.txt` (and `llms-full.txt`) is a short, plain-text summary of
  your site written specifically for an AI assistant to read directly,
  rather than having to parse your HTML.

## 5. IndexNow

This is entirely optional; it only matters if you want new posts picked
up by Bing (and the AI assistants it feeds) faster than Bing's own next
crawl.

1. Generate any random string of 8 to 128 characters, letters, numbers
   and hyphens only (a password generator works fine).
2. Add it as `INDEXNOW_KEY` in Vercel, and redeploy.
3. From then on, every time scatterpost publishes a post, your site
   automatically pings IndexNow with the new URL. There is nothing
   further to click or configure; a failed ping never affects
   publishing itself.

## 6. The author's other profiles (optional)

If you want search engines and AI assistants to connect your site to
your other profiles (GitHub, LinkedIn, X, and so on), set:

- `AUTHOR_URL` to your main profile or personal site.
- `SAME_AS` to a comma-separated list of the rest, each a full `https://`
  address, e.g. `https://github.com/you,https://linkedin.com/in/you`.

## A note for an AI agent following this file

If you are an AI agent setting this up on a founder's behalf, each step
above needs one environment variable in the Vercel project (no code
change, no redeploy of anything except the variable taking effect) and,
for Search Console and Bing, one sitemap submission in that service's
own dashboard, which this file cannot do for you since it needs a human
to sign in. Ask the founder for the verification codes and any IDs you
cannot generate yourself, set the environment variables, and tell them
exactly which external dashboard steps are still theirs to do.
