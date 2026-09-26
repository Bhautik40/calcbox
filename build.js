#!/usr/bin/env node
/* CalcBox static site generator.
   Usage:  node build.js            -> builds ./site (deploy this folder)
           node build.js --preview  -> builds ./preview (links end in index.html, for local file viewing)
           node build.js --spa      -> builds ./spa/calcbox.html (one-file preview with #hash routing)
   Set SITE_URL below to your real domain before building for production. */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/* ===== CONFIG ===== */
const SITE_URL = 'https://www.mycalcbox.in';   // <- change to your domain (no trailing slash)
const CONTACT_EMAIL = 'bhautiksondrava@gmail.com';         // <- change to your email
const YEAR = new Date().getFullYear();
const UPDATED = '26 September 2026';

const PREVIEW = process.argv.includes('--preview');
const SPA = process.argv.includes('--spa');
const OUT = path.join(__dirname, SPA ? 'spa' : PREVIEW ? 'preview' : 'site');
const VIEWS = [];
const IX = PREVIEW ? 'index.html' : '';
const C = require('./src/core.js');
const { esc, svg, tools, cats, icons, ui } = C;

function write(rel, content) {
  if (SPA && !content) return;
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
}
function hash(s) { return crypto.createHash('md5').update(s).digest('hex').slice(0, 8); }

fs.rmSync(OUT, { recursive: true, force: true });
const assets = {};
for (const f of ['core.js', 'app.js', 'style.css']) {
  const s = fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
  write('assets/' + f, s);
  assets[f] = 'assets/' + f + '?v=' + hash(s);
}

const catName = Object.fromEntries(cats);
const link = (root, slug) => SPA ? '#' + slug : root + slug + '/' + IX;
const homeLink = root => SPA ? '#home' : root + IX;
const catLink = (root, cat) => SPA ? '#' + cat : root + IX + '#' + cat;

function ad(name) {
  // Invisible marker. When adding AdSense later, replace this with:
  // <div class="ad-slot filled"><ins class="adsbygoogle" ...></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>
  return `<!-- AD SLOT: ${name} -->`;
}

function head({ title, desc, canon, root, jsonld, noindex }) {
  const url = SITE_URL + '/' + canon;
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(url)}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="CalcBox">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${SITE_URL}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#fafaf8" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0e0e0d" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${root}favicon.ico" sizes="48x48">
<link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
<link rel="icon" href="${root}favicon-48.png" type="image/png" sizes="48x48">
<link rel="apple-touch-icon" href="${root}apple-touch-icon.png">
<link rel="manifest" href="${root}manifest.webmanifest">
<script>try{var t=localStorage.getItem('cb_theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
<link rel="stylesheet" href="${root}${assets['style.css']}">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
<!-- ADSENSE (head): after approval, paste your AdSense script here:
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
-->
</head>`;
}

function header(root) {
  return `<header class="wrap top">
<a class="brand" href="${homeLink(root)}" aria-label="CalcBox home">${C.logo}<span>CalcBox</span></a>
<button class="theme-btn" type="button" aria-label="Toggle dark mode">${svg(ui.sun, 'i i-sun')}${svg(ui.moon, 'i i-moon')}</button>
</header>`;
}

function footer(root) {
  const groups = cats.map(([id, name]) => `<div class="fg-${id}"><h2>${name}</h2><ul>${tools.filter(t => t.cat === id).map(t => `<li><a href="${link(root, t.slug)}">${esc(t.name)}</a></li>`).join('')}</ul></div>`).join('');
  return `<footer class="foot"><div class="wrap">
<div class="foot-grid">${groups}</div>
<div class="foot-bottom"><span>© ${YEAR} CalcBox · Quick calculators. Instant answers.</span>
<nav class="foot-links" aria-label="Site"><a href="${link(root, 'about')}">About</a><a href="${link(root, 'privacy-policy')}">Privacy Policy</a><a href="${link(root, 'contact')}">Contact</a><a href="${link(root, 'terms')}">Terms</a></nav></div>
<p class="made">Made with <span class="heart" aria-label="love">❤️</span> by Bhautik</p>
</div></footer>`;
}

function page({ title, desc, canon, root, body, pageType, toolId, jsonld, noindex, scripts = true }) {
  if (SPA) { VIEWS.push({ id: canon.replace(/\/$/, '') || 'home', title, pageType, toolId, body }); return ''; }
  return `${head({ title, desc, canon, root, jsonld, noindex })}
<body data-page="${pageType}" data-root="${root}" data-ix="${IX}"${toolId ? ` data-tool="${toolId}"` : ''}>
${header(root)}
${body}
${footer(root)}
${scripts ? `<script src="${root}${assets['core.js']}" defer></script>
<script src="${root}${assets['app.js']}" defer></script>` : `<script src="${root}${assets['core.js']}" defer></script>
<script src="${root}${assets['app.js']}" defer></script>`}
</body>
</html>
`;
}

/* ===== HOME ===== */
{
  const root = './';
  const card = t => `<div class="card" data-id="${t.id}" data-cat="${t.cat}" data-s="${esc((t.name + ' ' + t.h1 + ' ' + t.desc + ' ' + t.kw + ' ' + catName[t.cat]).toLowerCase())}">
<div class="ic">${svg(icons[t.id])}</div>
<a href="${link(root, t.slug)}"><h3>${esc(t.name)}</h3></a>
<p>${esc(t.desc)}</p>
<button class="star" type="button" aria-pressed="false" aria-label="Pin ${esc(t.name)}">${svg(ui.star)}</button>
</div>`;
  const blocks = cats.map(([id, name]) => `<section class="cat-block" data-cat="${id}" aria-labelledby="h-${id}"><h2 id="h-${id}">${name}</h2><div class="grid">${tools.filter(t => t.cat === id).map(card).join('\n')}</div></section>`).join('\n');
  const body = `<main class="wrap">
<section class="hero">
<h1>Quick calculators.<br><span>Instant answers.</span></h1>
<label class="search">${svg(ui.search)}<span class="sr">Search calculators</span><input id="q" type="search" placeholder="Search ${tools.length} calculators" autocomplete="off" spellcheck="false" enterkeyhint="go"><kbd>/</kbd></label>
</section>
<section id="pinned" class="strip" hidden><h2>Pinned</h2><div class="chips"></div></section>
<section id="recent" class="strip" hidden><h2>Recent</h2><div class="chips"></div></section>
${ad('home-top')}
<nav class="filters" role="tablist" aria-label="Categories">
<button type="button" role="tab" data-cat="all" class="on" aria-selected="true">All</button>
${cats.map(([id, name]) => `<button type="button" role="tab" data-cat="${id}" aria-selected="false">${name}</button>`).join('\n')}
</nav>
${blocks}
<p id="empty" class="empty" hidden>No match. Try “loan”, “date” or “tax”.</p>
${ad('home-bottom')}
</main>`;
  write('index.html', page({
    title: 'CalcBox – Quick Calculators. Instant Answers.',
    desc: 'Free, fast calculators for India: GST, EMI, SIP, FD, age, BMI, unit converter, word counter and more. No sign-up. Results update as you type.',
    canon: '', root, body, pageType: 'home',
    jsonld: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'CalcBox', url: SITE_URL + '/', description: 'Quick calculators. Instant answers.' }
  }));
}

/* ===== TOOLS ===== */
for (const t of tools) {
  const root = '../';
  const v = C.defaults(t); if (t.fix) t.fix(v);
  const r = t.client ? { label: 'Password', big: '••••••••••••••••', mono: true } : t.calc(C.parse(t, v));
  const rel = t.related.map(id => C.byId[id]).filter(Boolean)
    .map(x => `<a class="chip" href="${link(root, x.slug)}">${svg(icons[x.id])}<span>${esc(x.name)}</span></a>`).join('');
  const body = `<main class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="${homeLink(root)}">All tools</a><span aria-hidden="true">/</span><a href="${catLink(root, t.cat)}">${catName[t.cat]}</a></nav>
${ad('tool-top')}
<div class="tool-head"><div class="ic">${svg(icons[t.id])}</div><div><h1>${esc(t.h1)}</h1><p>${esc(t.desc)}</p></div></div>
<div class="tool-grid">
<form class="panel" id="form" autocomplete="off" novalidate>${C.renderForm(t, v)}</form>
<div class="res-col">
<section class="result" aria-label="Result"><div id="res" aria-live="polite">${C.renderResult(r)}</div>
<div class="actions">
<button class="btn" type="button" data-act="copy">${svg(ui.copy)}<span>Copy</span></button>
<button class="btn" type="button" data-act="share">${svg(ui.share)}<span>Share</span></button>
<button class="btn" type="button" data-act="pin" aria-pressed="false">${svg(ui.star)}<span>Pin</span></button>
</div></section>
${t.disc ? `<p class="disc">${esc(t.disc)}</p>` : ''}
${ad('below-result')}
</div>
</div>
<p class="how"><b>How it works</b>${esc(t.how)}</p>
${ad('in-content')}
<section class="related" aria-labelledby="h-rel"><h2 id="h-rel">Related tools</h2><div class="chips">${rel}</div></section>
</main>`;
  write(t.slug + '/index.html', page({
    title: t.title, desc: t.meta, canon: t.slug + '/', root, body, pageType: 'tool', toolId: t.id,
    jsonld: {
      '@context': 'https://schema.org', '@type': 'WebApplication', name: t.h1, url: SITE_URL + '/' + t.slug + '/',
      description: t.meta, applicationCategory: t.cat === 'money' ? 'FinanceApplication' : t.cat === 'health' ? 'HealthApplication' : 'UtilitiesApplication',
      operatingSystem: 'Any', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }
    }
  }));
}

/* ===== INFO PAGES ===== */
const info = {
  about: {
    title: 'About CalcBox', desc: 'CalcBox is a set of fast, free calculators for money, dates, health and text. No sign-up, no clutter.',
    html: `<h1>About</h1>
<p>CalcBox is a small set of fast, free calculators for everyday questions — loans, GST, savings, dates, health and text.</p>
<p>Every tool updates as you type, works on any phone, and needs no sign-up. Your pinned and recent tools are saved only on your device.</p>
<h2>Accuracy</h2>
<p>We use standard, published formulas and test them carefully. Results are estimates for planning. For financial, tax or medical decisions, please check with a qualified professional.</p>
<h2>Feedback</h2>
<p>Found a bug or want a new calculator? <a href="${link('../', 'contact')}">Get in touch</a>.</p>`
  },
  'privacy-policy': {
    title: 'Privacy Policy – CalcBox', desc: 'How CalcBox handles your data, cookies and Google AdSense advertising.',
    html: `<h1>Privacy Policy</h1>
<p class="date">Last updated: ${UPDATED}</p>
<h2>What we collect</h2>
<p>CalcBox has no accounts and no sign-up. Everything you type into a calculator is processed in your browser and is not sent to our servers.</p>
<h2>Stored on your device</h2>
<p>We use your browser’s local storage to remember your pinned tools, recently used tools and your light/dark mode choice. This data stays on your device. You can clear it anytime from your browser settings.</p>
<h2>Advertising and cookies</h2>
<p>We use Google AdSense to show ads. Google and its partners use cookies to serve ads based on your prior visits to this and other websites.</p>
<ul>
<li>Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visits to this site and/or other sites on the internet.</li>
<li>You can opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" rel="noopener" target="_blank">Google Ads Settings</a>, or opt out of some third-party vendors’ cookies at <a href="https://www.aboutads.info/choices/" rel="noopener" target="_blank">aboutads.info</a>.</li>
<li>Learn more in <a href="https://policies.google.com/technologies/partner-sites" rel="noopener" target="_blank">how Google uses information from sites that use its services</a>.</li>
</ul>
<p>Where required by law (for example, for visitors in the EEA or UK), you will be asked for consent before personalised ads are shown.</p>
<h2>Analytics and logs</h2>
<p>Our hosting provider may keep standard server logs (such as IP address and browser type) for security and performance.</p>
<h2>Children</h2>
<p>CalcBox is not directed at children under 13 and does not knowingly collect their personal information.</p>
<h2>Changes</h2>
<p>We may update this policy. The date above shows the latest version.</p>
<h2>Contact</h2>
<p>Questions? Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>`
  },
  contact: {
    title: 'Contact – CalcBox', desc: 'Contact CalcBox with feedback, bug reports or calculator requests.',
    html: `<h1>Contact</h1>
<p>Feedback, bug reports or an idea for a new calculator? We’d love to hear from you.</p>
<!-- CONTACT EMAIL: change CONTACT_EMAIL in build.js (or edit this link) -->
<a class="mail" href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
<p>We usually reply within a few days.</p>`
  },
  terms: {
    title: 'Terms of Use – CalcBox', desc: 'Terms of use for CalcBox calculators.',
    html: `<h1>Terms of Use</h1>
<p class="date">Last updated: ${UPDATED}</p>
<h2>Use of the site</h2>
<p>CalcBox is free to use for personal and commercial purposes. Please don’t misuse the site, attempt to disrupt it, or copy it in bulk.</p>
<h2>No professional advice</h2>
<p>All results are estimates provided for general information. They are not financial, tax, legal or medical advice. Actual figures can differ based on your bank, lender, fund, employer or doctor.</p>
<h2>No warranty</h2>
<p>The calculators are provided “as is”. We work to keep them accurate but do not guarantee that results are complete, correct or up to date.</p>
<h2>Limitation of liability</h2>
<p>To the extent permitted by law, CalcBox is not liable for any loss arising from use of, or reliance on, the site or its results.</p>
<h2>Third-party ads and links</h2>
<p>The site shows ads and may link to other websites. We are not responsible for their content or practices.</p>
<h2>Changes</h2>
<p>We may update these terms at any time. Continued use means you accept the latest version.</p>
<h2>Contact</h2>
<p><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>`
  }
};
for (const [slug, p] of Object.entries(info)) {
  write(slug + '/index.html', page({
    title: p.title, desc: p.desc, canon: slug + '/', root: '../', pageType: 'info',
    body: `<main class="wrap"><article class="prose">${p.html}</article></main>`
  }));
}

/* 404 — served from any depth, so it uses absolute paths */
{
  let h = page({
    title: 'Page not found – CalcBox', desc: 'This page does not exist.', canon: '404', root: '/', pageType: 'info', noindex: true,
    body: `<main class="wrap"><article class="prose"><h1>Page not found</h1><p>This page doesn’t exist. Try one of our calculators instead.</p><p><a href="/">Go to all calculators</a></p></article></main>`
  });
  write('404.html', h);
}

/* ===== STATIC FILES ===== */
write('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#E4570B"/><path d="M9.5 12.5h5M12 10v5M18 12.5h4.5M9.8 19.8l4 4M13.8 19.8l-4 4M18 20.5h4.5M18 23.5h4.5" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`);
write('manifest.webmanifest', JSON.stringify({
  name: 'CalcBox', short_name: 'CalcBox', description: 'Quick calculators. Instant answers.', start_url: '/', display: 'standalone',
  background_color: '#fafaf8', theme_color: '#E4570B',
  icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }, { src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }]
}, null, 2));
const urls = ['', ...tools.map(t => t.slug + '/'), ...Object.keys(info).map(s => s + '/')];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE_URL}/${u}</loc><changefreq>monthly</changefreq><priority>${u === '' ? '1.0' : info[u.slice(0, -1)] ? '0.3' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
write('ads.txt', `# After AdSense approval, replace the line below with your publisher ID and remove the leading "#".\n# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0\n`);
write('_headers', `/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`);
// optional PNG icons / og image are copied from ./static if present
const st = path.join(__dirname, 'static');
if (fs.existsSync(st)) for (const f of fs.readdirSync(st)) fs.copyFileSync(path.join(st, f), path.join(OUT, f));

console.log(`Built ${urls.length + 1} pages into ${path.relative(process.cwd(), OUT) || OUT}`);

/* ===== ONE-FILE PREVIEW (--spa) ===== */
if (SPA) {
  const rd = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
  const tpl = VIEWS.map(v => `<template id="v-${v.id}" data-type="${v.pageType}" data-title="${esc(v.title)}"${v.toolId ? ` data-tool="${v.toolId}"` : ''}>${v.body}</template>`).join('\n');
  const html = `<title>CalcBox</title>
<script>try{var t=localStorage.getItem('cb_theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
<style>${rd('style.css')}</style>
${header('')}
<div id="view"></div>
${footer('')}
${tpl}
<script>document.body.setAttribute('data-spa','1');document.body.setAttribute('data-root','');</script>
<script>${rd('core.js')}</script>
<script>${rd('app.js')}</script>
`;
  fs.writeFileSync(path.join(OUT, 'calcbox.html'), html);
  console.log('One-file preview: spa/calcbox.html (' + Math.round(html.length / 1024) + ' KB)');
}
