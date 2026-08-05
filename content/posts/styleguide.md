---
title: "Styleguide: every component this theme provides"
date: 2026-08-05
lastmod: 2026-08-05
draft: true
author: "yad0"
description: "Reference page showing every shortcode, callout, and formatting element available when writing posts. Kept as a draft so it never publishes."
tags:
  - meta
  - reference
categories:
  - Meta
---

This page is a live reference for everything you can use when writing. It is
marked `draft: true`, so it renders with `hugo server -D` but never publishes.
Keep it around as a cheat sheet.

## Callouts

Five callout shortcodes are available. All accept an optional `title`.

{{< note >}}
Neutral context or an aside. Markdown works inside — including `code`,
[links](/posts/), and **bold**.
{{< /note >}}

{{< tip title="Faster approach" >}}
Use this for a shortcut or a technique that saves time.
{{< /tip >}}

{{< warning >}}
Something that will bite the reader if they skip it — a version caveat, a
destructive flag, a rate limit.
{{< /warning >}}

{{< danger title="Do not run this against production" >}}
Reserved for genuinely destructive or legally risky operations.
{{< /danger >}}

{{< lab >}}
Environment details needed to reproduce: target version, OS, mitigations
enabled, and how to get the binary.
{{< /lab >}}

Written as:

```text
{{</* note */>}} ... {{</* /note */>}}
{{</* tip title="Faster approach" */>}} ... {{</* /tip */>}}
{{</* warning */>}} ... {{</* /warning */>}}
{{</* danger title="..." */>}} ... {{</* /danger */>}}
{{</* lab */>}} ... {{</* /lab */>}}
```

## CVE references

Inline CVE badges link straight to NVD. Pass a `score` to colour-code severity.

Affected builds are vulnerable to {{< cve id="CVE-2024-3094" score="10.0" >}},
which supersedes {{< cve id="CVE-2021-44228" score="10.0" >}}. A lower-severity
example: {{< cve id="CVE-2023-38545" score="7.5" >}} and
{{< cve id="CVE-2020-1234" score="3.1" >}}.

Bare form without a score: {{< cve "CVE-2019-0708" >}}.

```text
{{</* cve id="CVE-2024-3094" score="10.0" */>}}
{{</* cve "CVE-2019-0708" */>}}
```

## Terminal sessions

For shell transcripts where the prompt matters more than syntax highlighting.
Lines beginning `$ ` or `# ` are treated as commands.

{{< terminal host="yad0@kali" >}}
$ nmap -sC -sV -p- 10.10.11.42
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.11.42
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1
80/tcp   open  http    nginx 1.18.0
$ whoami
www-data
# id
uid=0(root) gid=0(root) groups=0(root)
{{< /terminal >}}

```text
{{</* terminal host="yad0@kali" */>}}
$ command here
output here
{{</* /terminal */>}}
```

## Collapsible sections

Use these to keep long payloads, full exploit code, or verbose output from
breaking the flow of an article.

{{< details summary="Full exploit chain (42 lines)" >}}
Markdown renders normally in here, including code blocks:

```python
from pwn import *

context.binary = elf = ELF("./target")
p = process()
p.sendline(b"A" * 72 + p64(elf.sym.win))
p.interactive()
```
{{< /details >}}

```text
{{</* details summary="Full exploit chain" */>}} ... {{</* /details */>}}
```

## Code blocks

Fenced blocks get line numbers, syntax highlighting, and a copy button on hover.
The copy button excludes line numbers.

```python
#!/usr/bin/env python3
"""Minimal ROP chain builder."""
from pwn import *

context.binary = elf = ELF("./vuln")
rop = ROP(elf)
rop.raw(b"A" * 72)
rop.call(elf.sym.system, [next(elf.search(b"/bin/sh\x00"))])

io = process()
io.sendline(rop.chain())
io.interactive()
```

```c
// Off-by-one in the bounds check: <= permits a single byte past the buffer.
void copy_name(char *dst, const char *src, size_t n) {
    for (size_t i = 0; i <= n; i++) {
        dst[i] = src[i];
    }
}
```

Inline `code` looks like this, and so does a path such as `/etc/shadow`.

## Images

Markdown images become figures automatically. The title text becomes a caption:

```text
![Burp intercepting the login request](burp.png "Tampering with the session cookie")
```

Or use the shortcode when you want more control:

```text
{{</* img src="burp.png" alt="Burp intercepting the request" caption="Request tampering" */>}}
```

Drop the image next to the post as a
[page bundle](https://gohugo.io/content-management/page-bundles/) and it gets
resized and lazy-loaded automatically.

## Tables

| Primitive | Reliability | Mitigation bypassed |
| --- | --- | --- |
| Stack overflow | High | ASLR via infoleak |
| Use-after-free | Medium | Heap grooming required |
| Format string | High | Full RELRO blocks GOT overwrite |
| Integer overflow | Low | Depends on allocator behaviour |

## Blockquotes

> The attacker only has to be right once. The defender has to be right every
> time. This framing is wrong, and it is why so much security spend goes to the
> wrong places.

## Headings and the table of contents

Any post with enough headings gets a table of contents — a sticky rail on wide
screens, a collapsible block on mobile. Hover any heading to reveal an anchor
link for deep-linking.

### Third-level heading

Nested headings appear in the table of contents down to level four.

#### Fourth-level heading

This is the deepest level shown.

## Lists

Ordered:

1. Enumerate the attack surface.
2. Identify the primitive.
3. Build the chain.
4. Make it reliable.

Unordered:

- Root cause matters more than the payload.
- Include the dead ends.
- Explain *why* the offset is what it is.

## Front matter reference

```yaml
---
title: "Post title"
date: 2026-08-05
lastmod: 2026-08-05
draft: true
description: "Search snippet and social-card text. Write this deliberately."
tags: ["heap", "glibc"]
categories: ["Research"]
image: "cover.png"   # optional; overrides the generated social card
toc: false           # optional; suppresses the table of contents
---
```
