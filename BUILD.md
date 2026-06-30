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

`src/`, `data/`, `build.mjs`, and this file are listed in `.assetsignore`, so they
are kept in the repo but never served by Cloudflare Pages.
