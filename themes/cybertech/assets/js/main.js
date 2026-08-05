/* yad0::security — site behaviour
 * Vanilla, no dependencies, no third-party requests.
 */
(() => {
  'use strict';

  /* ---------------------------------------------------------------- nav --- */
  const initNav = () => {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    };

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });

    menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
    window.matchMedia('(min-width: 720px)').addEventListener('change', (e) => { if (e.matches) close(); });
  };

  /* --------------------------------------------------------- code copy --- */
  const initCopyButtons = () => {
    document.querySelectorAll('.post-content .highlight').forEach((block) => {
      if (block.querySelector('.copy-btn')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = 'copy';
      btn.setAttribute('aria-label', 'Copy code to clipboard');

      btn.addEventListener('click', async () => {
        // With lineNumbersInTable the code lives in td.lntd:last-child, so line
        // numbers sit in a separate cell and are never picked up by the copy.
        const cell = block.querySelector('td.lntd:last-child');
        const source = cell || block.querySelector('code') || block;
        const text = source.innerText.replace(/\n$/, '');

        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = 'copied';
          btn.classList.add('is-copied');
        } catch {
          btn.textContent = 'failed';
        }
        setTimeout(() => {
          btn.textContent = 'copy';
          btn.classList.remove('is-copied');
        }, 1800);
      });

      block.appendChild(btn);
    });
  };

  /* --------------------------------------------------------------- toc --- */
  const initToc = () => {
    const toc = document.querySelector('.toc');
    if (!toc) return;

    const links = new Map();
    toc.querySelectorAll('a[href^="#"]').forEach((a) => {
      const el = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
      if (el) links.set(el, a);
    });
    if (!links.size) return;

    let active = null;
    const headings = [...links.keys()];

    // Recompute from geometry rather than trusting individual intersection
    // events: a fast scroll can skip a heading entirely, which would otherwise
    // leave the previous entry highlighted indefinitely.
    const sync = () => {
      const top = 90;
      let current = headings[0];
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= top) current = h;
        else break;
      }
      const link = links.get(current);
      if (!link || link === active) return;
      if (active) active.classList.remove('is-active');
      link.classList.add('is-active');
      active = link;
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { sync(); ticking = false; });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    sync();
  };

  /* ------------------------------------------------------------ search --- */
  const initSearch = () => {
    const dialog = document.getElementById('search-dialog');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    const input = document.getElementById('search-input');
    const list = document.getElementById('search-results');
    const status = dialog.querySelector('.search-status');

    let index = null;
    let loading = null;
    let cursor = -1;

    const load = () => {
      if (index) return Promise.resolve(index);
      if (!loading) {
        loading = fetch(new URL('/index.json', location.origin))
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
          .then((data) => { index = data; return index; })
          .catch(() => { status.textContent = 'Search index unavailable.'; return []; });
      }
      return loading;
    };

    const escape = (s) => String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // Field-weighted substring scoring; every term must match somewhere.
    const score = (item, terms) => {
      const title = item.title.toLowerCase();
      const tags = (item.tags || []).join(' ').toLowerCase();
      const body = (item.body || '').toLowerCase();
      let total = 0;

      for (const t of terms) {
        let s = 0;
        if (title.includes(t)) s += title.startsWith(t) ? 120 : 80;
        if (tags.includes(t)) s += 45;
        if (body.includes(t)) s += 12;
        if (!s) return 0;
        total += s;
      }
      return total;
    };

    // Snippet around the first match, so results carry context.
    const snippet = (item, terms) => {
      const body = item.body || item.summary || '';
      const lower = body.toLowerCase();
      let at = -1;
      for (const t of terms) {
        const i = lower.indexOf(t);
        if (i !== -1 && (at === -1 || i < at)) at = i;
      }
      if (at === -1) return escape(item.summary || body.slice(0, 140));

      const start = Math.max(0, at - 60);
      const text = escape((start ? '…' : '') + body.slice(start, start + 180).trim() + '…');
      return terms.reduce((acc, t) => acc.replace(
        new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>'), text);
    };

    const render = (results, query) => {
      cursor = -1;
      if (!query) { list.innerHTML = ''; status.textContent = ''; return; }
      if (!results.length) {
        list.innerHTML = '';
        status.textContent = `No results for "${query}".`;
        return;
      }
      status.textContent = `${results.length} result${results.length === 1 ? '' : 's'}.`;
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      list.innerHTML = results.map((r, i) => `
        <li role="option" aria-selected="false" data-i="${i}">
          <a href="${escape(r.url)}">
            <span class="sr-section">${escape(r.section || 'page')}</span>
            <span class="sr-title">${escape(r.title)}</span>
            <span class="sr-snippet">${snippet(r, terms)}</span>
          </a>
        </li>`).join('');
    };

    const run = async () => {
      const query = input.value.trim();
      if (query.length < 2) { render([], ''); return; }
      const data = await load();
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      const results = data
        .map((item) => ({ item, s: score(item, terms) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s || (a.item.date < b.item.date ? 1 : -1))
        .slice(0, 12)
        .map((r) => r.item);
      render(results, query);
    };

    const move = (delta) => {
      const items = [...list.querySelectorAll('li')];
      if (!items.length) return;
      if (cursor >= 0) items[cursor].setAttribute('aria-selected', 'false');
      cursor = (cursor + delta + items.length) % items.length;
      items[cursor].setAttribute('aria-selected', 'true');
      items[cursor].scrollIntoView({ block: 'nearest' });
    };

    const open = () => {
      if (dialog.open) return;
      dialog.showModal();
      input.value = '';
      render([], '');
      input.focus();
      load(); // warm the index while the user is still typing
    };

    document.querySelectorAll('[data-search-open]').forEach((b) => b.addEventListener('click', open));
    dialog.querySelector('[data-search-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

    input.addEventListener('input', run);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter' && cursor >= 0) {
        e.preventDefault();
        list.querySelectorAll('li')[cursor]?.querySelector('a')?.click();
      }
    });

    document.addEventListener('keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if (e.key === '/' && !typing && !dialog.open) { e.preventDefault(); open(); }
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(); }
    });

    // Deep-link support for /search/?q=… and the JSON-LD SearchAction target.
    const q = new URLSearchParams(location.search).get('q');
    if (q) { open(); input.value = q; run(); }
  };

  /* --------------------------------------------------------------- boot --- */
  const boot = () => { initNav(); initCopyButtons(); initToc(); initSearch(); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
