#!/usr/bin/env node
/*
 * Single-source build for prateeksaxena.me
 * --------------------------------------------------------------------------
 * Source of truth for long-form articles: data/articles.json
 * Homepage structure source: src/home.html  (NOT served; see .assetsignore)
 *
 * Running `node build.mjs` regenerates, from that one data file:
 *   1. the article cards on the homepage  (src/home.html -> index.html)
 *   2. the article cards on the Journal page (journal.html)
 *   3. the article <url> entries in sitemap.xml
 *   4. the "## Articles" section of llms.txt
 *
 * It also rebuilds index.html from src/home.html (rewriting the dev font /
 * lenis paths to their deployed locations). LinkedIn / partnership cards are
 * static and managed by hand in the HTML, outside the BUILD markers.
 *
 * No dependencies. Node 18+.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://prateeksaxena.me';
const M1 = '<!-- BUILD:ARTICLES:START';   // matched as a prefix (marker line may carry a note)
const M2 = '<!-- BUILD:ARTICLES:END -->';

const { articles } = JSON.parse(readFileSync('data/articles.json', 'utf8'));

const esc = (s) => s; // content is authored trusted copy; keep verbatim

// --- card templates (indentation matches the surrounding grids exactly) ---
const homeCard = (a) =>
`      <a class="art rv" href="${a.url}">
        <span class="thumbwrap"><img class="thumb" src="${a.thumb}" alt="${esc(a.alt)}" loading="lazy"></span>
        <span class="tag">${esc(a.tag)}</span><h3>${esc(a.title)}</h3>
        <p>${esc(a.excerpt)}</p><span class="more">Read the essay →</span></a>`;

const journalCard = (a) =>
`    <a class="jcard rv" href="${a.url}">
      <img class="jthumb" src="${a.thumb}" alt="${esc(a.alt)}" loading="lazy">
      <div class="jbody"><span class="jdate">${esc(a.tag)}</span><h3>${esc(a.title)}</h3>
      <p>${esc(a.excerpt)}</p><span class="jmore">Read the essay →</span></div></a>`;

const sitemapRow = (a) =>
`  <url><loc>${SITE}${a.url}</loc><lastmod>${a.lastmod}</lastmod></url>`;

const llmsRow = (a) =>
`- ${a.llmsTitle} — ${SITE}${a.url}\n  ${a.llmsDesc}`;

/* Replace the text between BUILD markers (keeping the marker lines). */
function injectBetweenMarkers(file, body, m1 = M1, m2 = M2) {
  const s = readFileSync(file, 'utf8');
  const startLine = s.indexOf(m1);
  if (startLine < 0) throw new Error(`start marker not found in ${file}`);
  const startEol = s.indexOf('\n', startLine);
  const endIdx = s.indexOf(m2, startEol);
  if (endIdx < 0) throw new Error(`end marker not found in ${file}`);
  const out = s.slice(0, startEol + 1) + body + '\n' + s.slice(endIdx);
  writeFileSync(file, out);
  return out;
}

// 1 + 2: article cards into the homepage source and the Journal page
injectBetweenMarkers('src/home.html', articles.map(homeCard).join('\n'));
injectBetweenMarkers('journal.html', articles.map(journalCard).join('\n'));

// 2b: regenerate the Journal ItemList schema from the cards actually on the page,
// so it can never go stale again (it previously omitted the articles).
{
  const s = readFileSync('journal.html', 'utf8');
  const decode = (t) => t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ')
    .replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&quot;', '"').replaceAll('&#39;', "'").trim();
  const cards = [...s.matchAll(/<(?:a|div) class="jcard rv"(?:[^>]*?href="([^"]+)")?[^>]*>[\s\S]*?<h3>([\s\S]*?)<\/h3>/g)];
  const items = cards.map((m, i) => {
    const url = m[1] ? (m[1].startsWith('http') ? m[1] : SITE + m[1]) : SITE + '/journal';
    return `{"@type":"ListItem","position":${i + 1},"name":${JSON.stringify(decode(m[2]))},"url":${JSON.stringify(url)}}`;
  });
  const block = `<script type="application/ld+json">\n{"@context":"https://schema.org","@type":"ItemList","name":"Journal entries by Prateek Saxena","itemListElement":[\n${items.join(',\n')}]}\n</${'script'}>`;
  injectBetweenMarkers('journal.html', block, '<!-- BUILD:JLIST:START', '<!-- BUILD:JLIST:END -->');
  console.log(`build.mjs: journal ItemList regenerated with ${items.length} entries`);
}

// 3: article URLs into the sitemap
injectBetweenMarkers('sitemap.xml', articles.map(sitemapRow).join('\n'));

// 4: rebuild index.html from the homepage source (deployed asset paths)
let home = readFileSync('src/home.html', 'utf8')
  .replaceAll('node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2', 'fonts/fraunces.woff2')
  .replaceAll('node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2', 'fonts/fraunces-italic.woff2')
  .replaceAll('node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2', 'fonts/space-grotesk.woff2')
  .replaceAll('node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2', 'fonts/hanken.woff2')
  .replaceAll('node_modules/lenis/dist/lenis.min.js', 'lenis.min.js');
writeFileSync('index.html', home);

// 5: the "## Articles" section of llms.txt (it is the last section in the file)
const llms = readFileSync('llms.txt', 'utf8');
const head = llms.slice(0, llms.indexOf('## Articles'));
writeFileSync('llms.txt', head + '## Articles\n' + articles.map(llmsRow).join('\n') + '\n');

console.log(`build.mjs: regenerated ${articles.length} articles across index.html, journal.html, sitemap.xml, llms.txt`);
