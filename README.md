# yad0::security

Source for [blog.ret2libc.org](https://blog.ret2libc.org) — a Hugo site with a
custom theme (`themes/cybertech`).

## Running it

```bash
make serve      # dev server with drafts visible → http://localhost:1313
make preview    # dev server as production sees it (no drafts)
make build      # production build into ./public
make check      # build, then assert the important files exist
make clean      # remove build output and caches
```

Requires Hugo **extended** ≥ 0.164. `brew install hugo`.

## Writing

```bash
make post    name=heap-grooming-glibc-2-39
make writeup name=htb-boxname
make tool    name=my-tool
```

Each creates a file from the matching archetype in `archetypes/`, with
`draft: true`. Drop `draft` (or set it to `false`) to publish.

The URL comes from the **filename**, so pick the slug deliberately —
`content/posts/heap-grooming.md` → `/posts/heap-grooming/`. Override with
`slug:` in front matter if you need to.

### Front matter that matters

| Field | Why it matters |
| --- | --- |
| `description` | Search snippet, social-card text, and meta description. Write it for a stranger scrolling past, not for yourself. Falls back to the first ~160 chars if omitted. |
| `tags` | Drives the tag pages, related posts, and search weighting. |
| `image` | Optional. Overrides the auto-generated social card. |
| `toc` | Set `false` to suppress the table of contents. |

### Images

Use a [page bundle](https://gohugo.io/content-management/page-bundles/) — a
directory with `index.md` plus the images — and reference them by filename.
They are resized, converted to WebP, and lazy-loaded automatically.

```
content/posts/my-post/
  index.md
  burp.png
```

```markdown
![Burp intercepting the request](burp.png "Optional caption")
```

### Shortcodes

See `content/posts/styleguide.md` — it is a permanent draft that renders every
component. `make serve` and open `/posts/styleguide/`.

| Shortcode | Use |
| --- | --- |
| `note` `tip` `warning` `danger` `lab` | Callouts. All take an optional `title`. |
| `cve` | `{{< cve id="CVE-2024-3094" score="10.0" >}}` — links to NVD, colours by severity. |
| `terminal` | Shell transcripts. Lines starting `$ ` or `# ` render as prompts. |
| `details` | Collapsible block for long payloads or full exploit code. |
| `img` | Figure with caption and automatic resizing. |

## Before you publish

Fill in `params.social` in `hugo.toml` — GitHub, X, Mastodon, LinkedIn,
Bluesky, email. Empty values are simply not rendered, so the footer, the
`sameAs` structured data, and the Twitter card attribution all stay incomplete
until you set them.

Two pages carry HTML comments marking sections worth personalising:
`content/about.md` and `content/now.md`.

## What the theme does for you

- **Social cards** are generated per page at build time from the title —
  no manual image work. Overridable with `image:` in front matter.
- **Full SEO layer**: Open Graph, Twitter cards, canonical URLs, JSON-LD
  (`BlogPosting` / `WebSite` / `Person`), sitemap, robots.txt.
- **RSS** for the site and for each section and tag, with autodiscovery.
- **Search** over full post bodies including code blocks. `/` or `Cmd/Ctrl-K`.
- **No third-party requests.** Fonts are self-hosted; there are no trackers,
  no analytics, and no CDN calls.

## Deployment

Pushing to `main` triggers `.github/workflows/hugo-deploy.yml`, which builds and
publishes to GitHub Pages. Pull requests build and verify but do not deploy.

The Hugo version is **pinned** in that workflow. Bump it deliberately after
testing locally — `latest` means an upstream release can break a deploy with no
change on your side.

`static/CNAME` holds the custom domain. Deleting it breaks
`blog.ret2libc.org`; CI fails the build if it goes missing.
