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
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const SITE = 'https://prateeksaxena.me';
const M1 = '<!-- BUILD:ARTICLES:START';   // matched as a prefix (marker line may carry a note)
const M2 = '<!-- BUILD:ARTICLES:END -->';

const previousHome = readFileSync('index.html', 'utf8');
const previousJournal = readFileSync('journal.html', 'utf8');

const { articles } = JSON.parse(readFileSync('data/articles.json', 'utf8'));
const imageVariants = JSON.parse(readFileSync('data/image-variants.json', 'utf8'));
const imageLookup = new Map();
for(const [original,record] of Object.entries(imageVariants)){
  imageLookup.set(original,record);
  for(const variant of record.variants)imageLookup.set(variant.src,record);
}
function responsiveImages(html,homePage=false){
  return html.replace(/<img\b[^>]*>/g,tag=>{
    const src=tag.match(/\bsrc="([^"]+)"/)?.[1]?.replaceAll('\\','/');
    const record=imageLookup.get(src?.startsWith('/')?src:'/'+src);
    if(!record)return tag;
    const portrait=record.variants[0].src.startsWith('/portrait-');
    const sizes=portrait?(homePage?'(max-width:700px) 88px, 180px':'(max-width:640px) 280px, 300px'):
      tag.includes('jthumb')?'(max-width:599px) 84px, 120px':
      homePage?'(max-width:700px) calc(100vw - 44px), (max-width:950px) 44vw, 380px':'(max-width:800px) calc(100vw - 48px), 960px';
    const clean=tag.replace(/\s(?:src|srcset|sizes)="[^"]*"/g,'');
    return clean.replace(/\/?\s*>$/,` src="${record.variants.at(-1).src}" srcset="${record.variants.map(v=>v.src+' '+v.width+'w').join(', ')}" sizes="${sizes}">`);
  });
}
// Display ranking is a reviewed snapshot; preserve chronological source order for RSS.
const rankedArticles = [...articles].sort((a, b) => (a.readerRank ?? Infinity) - (b.readerRank ?? Infinity));

const esc = (s) => s; // content is authored trusted copy; keep verbatim

// --- card templates (indentation matches the surrounding grids exactly) ---
const homeCard = (a, i) =>
`      <article><span class="essay-index">${String(i + 1).padStart(2, '0')}</span>
        <div><p class="eyebrow">${esc(a.featured ? 'Featured · Most read' : a.tag)}</p><h3><a href="${a.url}">${esc(a.displayTitle || a.title)}</a></h3>
        <p>${esc(a.excerpt)}</p></div>
        <a class="essay-open" href="${a.url}" tabindex="-1" aria-hidden="true">↗</a></article>`;

const journalCard = (a) =>
`    <a class="jcard rv" href="${a.url}">
      <img class="jthumb" src="${a.thumb}" alt="" loading="lazy" width="1200" height="900">
      <div class="jbody"><span class="jdate">${esc(a.featured ? 'Featured · Most read · Jun 2026' : a.tag)}</span><h3>${esc(a.displayTitle || a.title)}</h3>
      <p>${esc(a.excerpt)}</p><span class="jmore">Read the essay →</span></div></a>`;

const sitemapRow = (a) =>
`  <url><loc>${SITE}${a.url}</loc><lastmod>${a.lastmod}</lastmod></url>`;

const llmsRow = (a) =>
`- [${a.llmsTitle}](${SITE}${a.url})\n  ${a.llmsDesc}`;

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
injectBetweenMarkers('src/home.html', rankedArticles.filter(a => a.homeFeature !== false).slice(0, 3).map(homeCard).join('\n'));
injectBetweenMarkers('journal.html', rankedArticles.map(journalCard).join('\n'));

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
  // Render the initial count with the content, so enhancement does not shift cards.
  const journal=readFileSync('journal.html','utf8');
  writeFileSync('journal.html',journal.replace(/(<p[^>]*id="reading-status"[^>]*>)[\s\S]*?(<\/p>)/,`$1${articles.length} original essays · ${items.length-articles.length} logbook entries$2`));
  console.log(`build.mjs: journal ItemList regenerated with ${items.length} entries`);
}

// 3: article URLs into the sitemap
injectBetweenMarkers('sitemap.xml', articles.map(sitemapRow).join('\n'));

// Reading pages share the same critical styles without extra blocking requests.
const readingStyles=['nav.css','consent.css','refinements.css','reading.css'].map(file=>readFileSync(file,'utf8').replaceAll('\r\n','\n')).join('\n');
const readingPages=[...readdirSync('.').filter(f=>f.endsWith('.html')&&f!=='index.html'),...readdirSync('journal').filter(f=>f.endsWith('.html')).map(f=>'journal/'+f)];
for(const file of readingPages){
  const text=readFileSync(file,'utf8');
  const marker=/<!-- BUILD:READING_STYLES:START -->[\s\S]*?<!-- BUILD:READING_STYLES:END -->/;
  if(!marker.test(text))throw new Error('Missing reading style marker: '+file);
  writeFileSync(file,responsiveImages(text.replace(marker,`<!-- BUILD:READING_STYLES:START -->\n<style id="reading-design">\n${readingStyles}\n</style>\n<!-- BUILD:READING_STYLES:END -->`)));
}

// 4: rebuild index.html from the homepage source (deployed asset paths)
let home = readFileSync('src/home.html', 'utf8')
  .replaceAll('node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2', 'fonts/fraunces.woff2')
  .replaceAll('node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2', 'fonts/fraunces-italic.woff2')
  .replaceAll('node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2', 'fonts/space-grotesk.woff2')
  .replaceAll('node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2', 'fonts/hanken.woff2')
  .replaceAll('node_modules/lenis/dist/lenis.min.js', 'lenis.min.js');
// This small static homepage benefits from eliminating four blocking stylesheet
// round trips. Keep the editable sources separate and preserve cascade order.
const homeStyles=['home.css','nav.css','consent.css','perspective/v1/site.css']
  .map(file=>readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'')
    .split(/\r?\n/).map(line=>line.trim()).filter(Boolean).join(' ')
    .replace(/\s*([{};])\s*/g,'$1')).join('\n');
if(!home.includes('<!-- BUILD:HOME_STYLES -->'))throw new Error('Missing homepage style build marker');
home=home.replace('<!-- BUILD:HOME_STYLES -->',`<style id="home-design">\n${homeStyles}\n</style>`);
home=responsiveImages(home,true);
writeFileSync('index.html', home);

// Stamp only when generated content has changed, not merely when a build ran.
{
  const changed = [];
  if (home !== previousHome) changed.push(`${SITE}/`);
  if (readFileSync('journal.html', 'utf8') !== previousJournal) changed.push(`${SITE}/journal`);
  let sitemap = readFileSync('sitemap.xml', 'utf8');
  for (const loc of changed) {
    const escaped = loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    sitemap = sitemap.replace(new RegExp(`(<loc>${escaped}</loc><lastmod>)[^<]+`), `$1${new Date().toISOString().slice(0,10)}`);
  }
  writeFileSync('sitemap.xml', sitemap);
}


// 5: the "## Articles" section of llms.txt (it is the last section in the file)
const llms = readFileSync('llms.txt', 'utf8');
const head = llms.slice(0, llms.indexOf('## Articles'));
writeFileSync('llms.txt', head + '## Articles\n' + articles.map(llmsRow).join('\n') + '\n');


// 6: RSS feed (feed.xml) from the same article registry
{
  const escXml = (t) => t.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const rfc = (d) => new Date(d + 'T08:00:00+04:00').toUTCString();
  const items = articles.map((a) =>
`  <item>
    <title>${escXml(a.title)}</title>
    <link>${SITE}${a.url}</link>
    <guid isPermaLink="true">${SITE}${a.url}</guid>
    <pubDate>${rfc(a.published || a.lastmod)}</pubDate>
    <description>${escXml(a.llmsDesc)}</description>
  </item>`).join('\n');
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Prateek Saxena Journal</title>
  <link>${SITE}/journal</link>
  <description>Essays on agentic AI, vibe coding in a suit and business operations from the UAE real economy.</description>
  <language>en</language>
  <lastBuildDate>${rfc(articles[0].published || articles[0].lastmod)}</lastBuildDate>
${items}
</channel></rss>\n`;
  writeFileSync('feed.xml', feed);
  console.log('build.mjs: feed.xml generated with ' + articles.length + ' items');
}

console.log(`build.mjs: regenerated ${articles.length} articles across index.html, journal.html, sitemap.xml, llms.txt`);
