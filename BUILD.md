# Build — single source for articles

This is a static site. Most files are edited by hand and deploy as-is. **Articles are the exception**: they are driven from one data file so they can never again get out of sync across the homepage, the Journal page, the sitemap, and `llms.txt`.

## To add or edit a Journal article

1. Edit **`data/articles.json`** — add an object to the top of `articles` (newest first):

   ```json
   {
     "url": "/journal/your-new-slug",
     "title": "Your Article Title",
     "tag": "In a Suit · No. 2 · Jul 2026",
     "thumb": "journal-media/your-new-slug-43.svg",
     "alt": "Banner alt text",
     "excerpt": "One or two sentence summary shown on the cards.",
     "lastmod": "2026-07-15",
     "llmsTitle": "Title as it should read in llms.txt",
     "llmsDesc": "One-line description for llms.txt / AI engines."
   }
   ```

2. Create the article page itself at `journal/your-new-slug.html` and its 4:3 banner at `journal-media/your-new-slug-43.svg` (plus a 1200x630 `-og.png` for social).

3. Run the build:

   ```bash
   node build.mjs
   ```

4. Commit everything and push. The deploy (GitHub Action → Cloudflare Pages) publishes on push to `master`.

## What the build regenerates

`node build.mjs` rewrites, from `data/articles.json`, the regions marked with
`<!-- BUILD:ARTICLES:START -->` … `<!-- BUILD:ARTICLES:END -->` in:

- `src/home.html` → the homepage article cards, then emits **`index.html`**
- `journal.html` → the Journal article cards
- `sitemap.xml` → the article `<url>` entries
- `llms.txt` → the `## Articles` section (regenerated from `## Articles` to end of file)

LinkedIn / partnership cards are **not** managed here — they are static, outside the markers.

## Important: the homepage source is `src/home.html`, not `index.html`

`index.html` is **generated** from `src/home.html` by `build.mjs` (it rewrites the
dev `node_modules/...` font + lenis paths to the deployed `fonts/...` and `lenis.min.js`).
**Edit `src/home.html` for any homepage change, then run `node build.mjs`** — editing
`index.html` directly will be overwritten on the next build.

`prepare-deploy.mjs` creates `.pages-output` from an explicit public-file list.
The deployment publishes that folder, excluding source, tests, build tooling and
documentation. Do not deploy the repository root: Pages did not honor the existing
Workers-style `.assetsignore` file in the verified October 2026 preview.

## Shared interaction and analytics layer

- `nav.css` owns the complete header and native mobile dialog on every page.
- `ux.js` handles dialog focus and intent events. Scrolling uses the browser's native behavior; no persistent cursor or scrolling animation loop is needed.
- `analytics.js` loads GA4 and Clarity only on the production hostname after optional analytics are accepted. Local and Cloudflare preview hosts never send production visits. Existing custom event names remain unchanged; `engagement_type` distinguishes advisory, speaking and board email links. An email click is an intent signal, not a confirmed lead.
- `/privacy` and the footer preferences control explain and manage that choice. Consent changes reduce observable traffic compared with the previous unconditional tracking, so annotate the eventual production release in reporting.
- The home page uses `home.css`. Other page improvements live in `refinements.css`.
- The homepage displays the first three eligible entries from `data/articles.json`. Set `homeFeature: false` to omit a featured elsewhere article from that selection. Journal, feed and sitemap still include every entry.
- Keep the cache version on `ux.js` and `nav.css` references current when changing the shared layer, to bypass earlier immutable caches.

## Validation and release

Run `node build.mjs`, `node tests/analytics.mjs`, `node tests/site.mjs`, and `node tests/cube.mjs`, in that order. These commands have no third-party runtime dependencies. The site checks also prepare and validate `.pages-output`; `node prepare-deploy.mjs` can regenerate it independently. GitHub Actions runs the same checks before deploying that public folder. An unchanged build preserves the sitemap freshness dates.

Push `dev` for the Cloudflare preview at `https://dev.prateeksaxena.pages.dev`. The workflow adds `X-Robots-Tag: noindex, nofollow` to preview responses. Production publishes only from `master` (mapped to Cloudflare's `main` production branch). Do not copy local audit reports or private analytics into the repository.

`preview-headers.mjs` inserts the exclusion into the existing catch-all header rule after preparing `.pages-output`. Never append a second `/*` block. Tests verify header preservation and restore neutral deployment output afterwards.

The 404 page uses the shared consent and navigation layer and is included in site validation. Consent preferences show the saved choice and restore focus to the opening control. On narrow screens, Frameworks renders equivalent HTML steps instead of shrinking diagram text. Copy-email intent is `email_copy`; it is not a confirmed enquiry. Long-lived fonts, logos and portrait assets now revalidate daily; use a new filename or URL version when replacing a previously immutable asset.

The owner will write the evidence-based case-study article. Do not infer personal responsibility or quantitative outcomes from group partnership announcements.

## Approved perspective hero

The approved R9 cube is integrated into `src/home.html`. `perspective/v1/` contains the exact approved films and face stills, scoped styles, playback controller and a pure loading-policy module. Do not redraw, recolor or replace the approved face artwork. Media is immutable: future media revisions need a new versioned directory. Styles and module files revalidate normally. The homepage build inlines `home.css`, `nav.css`, `refinements.css` and the perspective styles at `BUILD:HOME_STYLES`, preserving their cascade order and eliminating four render-blocking requests. Edit those source styles; never edit the generated inline block. Other pages retain the shared stylesheet URLs. Tests enforce source equality and a 75 KB uncompressed document budget.

The opening WebP (60 KB) has explicit dimensions and high fetch priority. Video has no initial source, no preload and no loop. Desktop autoplay requires page load, decoded opening image, settled fonts, a 750 ms delay and an idle callback. It additionally requires a visible cube, visible document, viewport over 900 px, fine pointer, no reduced-motion preference, no data-saving preference and no known 3G-or-slower connection. Other visitors can explicitly play. Phones at 600 px or below use the 1.64 MB film; larger screens use the 4.07 MB film. Playback pauses offscreen and when the tab is hidden. Face selection uses stills without requesting video. End, replay, scrubber and face captions use the same 30-second timeline.

The six meanings sit in a native, collapsed-by-default “What does the cube mean?” disclosure beneath the playback controls. There is no separate six-card section. The homepage proceeds through Experience, Selected work & writing, Education, Journal, About and engagement/contact. The explanation, biography, work and journal remain ordinary HTML. The cube controller has no dependency on navigation, consent, contact links or search metadata. JavaScript unavailable: still artwork and the native explanation remain usable, with inactive animation controls hidden. There are no extra animation libraries or third-party media players.

The owner requires the original five career entries and four education entries to remain intact, including descriptions, course titles, dates and all eight original logo placements. These are visible semantic sections at `#experience` and `#education`, with direct desktop/mobile navigation and links from the hero credentials. Preserve the original logo files in `logos/`. The sole factual correction to the original sections is the owner-confirmed INSEAD completion: show the original 2023 start and a Completed label without inventing a completion year. CMA remains in progress. Layout and palette may improve; do not summarize away the original entries. Their scoped layout and the homepage's charcoal/ivory/brass palette live in `home.css`; shared button geometry lives in `refinements.css`.

Local browser measurements are development evidence, not a production Core Web Vitals pass. Validate the hosted release and monitor real-user field data before claiming ranking or performance outcomes.

The homepage uses optimized copies of Fraunces in `perspective/v1/`. FontTools 4.66.1 pinned the unused `SOFT=0` and `WONK=1` axes at their original defaults; all glyphs, weights and optical sizes remain available. Their combined transfer drops from 270,736 to 149,024 bytes. The original font files remain for other pages. To reproduce with FontTools and Brotli installed: use `fonttools varLib.instancer fonts/fraunces.woff2 SOFT=0 WONK=1 --output=perspective/v1/fraunces-display.woff2`, and the same command for `fonts/fraunces-italic.woff2` with output `perspective/v1/fraunces-display-italic.woff2`.

The site owner confirmed on 2 October 2026 that the INSEAD Certificate in Global Management is completed and CMA studies are in progress. Before production, review the privacy notice against account configuration and validate the enquiry event in GA4. `email_click` can be treated as contact intent; confirmed and qualified enquiries require separate evidence. Public outcome claims must be supported, not inferred from partnership announcements.
