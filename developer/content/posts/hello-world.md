---
title: "Hello, world"
slug: "hello-world"
date: "2026-09-27T09:00:00.000Z"
description: "A sample post shipped with the minimal template, showing the front matter every post needs."
tags: ["scatterpost"]
scatterpostId: "sample-hello-world"
---

This is a sample post. It shows the front matter fields a post file
needs (`title`, `slug`, `date`, `description`, `tags`, `canonical`,
`cover`) and renders through the same Markdown pipeline as a post
scatterpost pushes here.

## Syntax highlighting

Fenced code blocks are highlighted on the server, with a copy button
added once the page loads:

```ts
export function greet(name: string): string {
  return `Hello, ${name}`;
}
```

## Table of contents

This post is short, but a longer one gets a table of contents built
from its `h2` and `h3` headings automatically, here on the right at a
wide viewport and collapsible above the post on a narrow one.

### A nested heading

Delete this file, or leave it as a working example while you connect
your first scatterpost workspace to this site.
