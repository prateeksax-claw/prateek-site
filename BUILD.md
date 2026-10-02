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

Run `node build.mjs`, `node tests/analytics.mjs`, and `node tests/site.mjs`. These commands have no third-party runtime dependencies. The site checks also prepare and validate `.pages-output`; `node prepare-deploy.mjs` can regenerate it independently. GitHub Actions runs the same checks before deploying that public folder. An unchanged build preserves the sitemap freshness dates.

Push `dev` for the Cloudflare preview at `https://dev.prateeksaxena.pages.dev`. The workflow adds `X-Robots-Tag: noindex, nofollow` to preview responses. Production publishes only from `master` (mapped to Cloudflare's `main` production branch). Do not copy local audit reports or private analytics into the repository.

The site owner confirmed on 2 October 2026 that the INSEAD Certificate in Global Management is completed and CMA studies are in progress. Before production, review the privacy notice against account configuration and validate the enquiry event in GA4. `email_click` can be treated as contact intent; confirmed and qualified enquiries require separate evidence. Public outcome claims must be supported, not inferred from partnership announcements.
