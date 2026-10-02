---
title: "Setting up Google Search Console and Bing Webmaster Tools for a new blog"
description: "A step-by-step guide to verifying a new blog in Google Search Console and Bing Webmaster Tools, and what to watch in month one."
tags: ["seo", "search-console", "bing"]
date: "2026-09-26"
slug: "search-console-bing-setup"
scatterpostId: "demo-search-console-bing-setup"
cover: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1600&q=70&auto=format&fit=crop"
coverAlt: "A MacBook Pro next to a white open book on a desk."
---

If your blog has no verified presence in Google Search Console or Bing Webmaster Tools, you are publishing into the dark: no data on which pages get seen, which search terms find you, or whether a page even got indexed at all. Both tools are free, and setting both up takes under twenty minutes combined.

## Google Search Console

### Step 1: add your property

Go to search.google.com/search-console and choose "Add property". You get two options:

- **Domain property** covers every subdomain and protocol (`http`, `https`, `www`, and any subdomain) under one verification. This is the better choice for most blogs, but it requires adding a DNS record, which means access to your domain's DNS settings.
- **URL prefix property** covers exactly the URL you type, such as `https://yourblog.com`. Easier to verify if you do not control DNS, but it will not automatically cover a separate subdomain if you add one later.

### Step 2: verify ownership

For a domain property, Google gives you a TXT record to add at your DNS provider, something like:

```
google-site-verification=abc123exampleXYZ
```

Add it as a TXT record on the bare domain, wait a few minutes for DNS to propagate, then click "Verify" in Search Console.

For a URL prefix property, the easier route for most blog platforms is the HTML tag method: Google gives you a `<meta name="google-site-verification" content="...">` tag to place in your site's `<head>`. Most blog frameworks have a single layout file where this goes once and applies to every page.

### Step 3: submit your sitemap

Once verified, go to "Sitemaps" in the left menu and submit the path to your sitemap, usually `sitemap.xml` at your domain's root (for example `https://yourblog.com/sitemap.xml`). Most modern blog frameworks generate this automatically; check that the URL actually loads and lists your posts before submitting it.

## Bing Webmaster Tools

### Step 1: add your site

Go to bing.com/webmasters and sign in. Bing now offers an import option that pulls verified sites straight from an already-verified Google Search Console account, which saves repeating the DNS step if you have already done it for Google.

### Step 2: verify manually if you skip the import

If you add the site manually, Bing offers the same two common methods as Google: an XML file uploaded to your site's root, or a meta tag in the `<head>`. Pick whichever matches how you already verified with Google, since you likely still have that file or tag in place.

### Step 3: submit your sitemap

Same idea as Google: paste your sitemap URL into the "Sitemaps" section and submit it.

## What to watch in the first month

Expect quiet, not silence. New blogs are indexed gradually, not instantly.

- **Coverage report (Google) or Site Explorer (Bing).** Check weekly that new posts are actually being indexed, not just submitted. A post stuck in "Discovered, not indexed" for more than a couple of weeks is worth a second look at its content quality or internal linking, not a cause for alarm on its own.
- **Performance report.** Early on, expect low numbers of clicks and impressions. What is worth watching is which queries are starting to surface your pages at all, even at low positions, since that tells you what Google thinks each page is about, which is sometimes surprising.
- **Any manual actions or security issues.** Both tools will flag these directly; neither should show anything for a normal blog, so treat an alert here as worth investigating immediately rather than something to file away.
- **Mobile usability.** Both tools report rendering problems on mobile. Worth a glance once, since most new readers arrive on a phone.

Do not expect meaningful ranking movement in the first month. Both tools are measurement, not acceleration. What you are building in month one is a clean, indexed sitemap and a verified identity, so that the posts you publish from month two onward have something to be measured against.

## Where scatterpost fits

scatterpost supports adding your Google and Bing verification codes as environment variables on your blog, which inserts the meta tags for you, keeps an RSS feed and sitemap current as new posts publish, and can optionally ping Bing via IndexNow the moment a post goes live, so Bing's crawler hears about it faster than waiting for its own schedule. None of this replaces the verification steps above; it just means you do them once rather than per post.

<p>Photo by <a href="https://unsplash.com/@nickmorrison" target="_blank">Nick Morrison</a> on <a href="https://unsplash.com/photos/macbook-pro-near-white-open-book-FHnnjk1Yj7Y" target="_blank">Unsplash</a>.</p>
