# Prateek Saxena — SEO & AI-Search (GEO) Strategy

*Synthesised from 5 research streams (Google SEO · AI-citation/GEO mechanics · content strategy · technical/schema · off-site authority), June 2026. Evidence-weighted; hype removed.*

---

## TL;DR — the verdict

You win discovery in 2026 with **three durable levers**, not tricks:

1. **Be a clear, consistent *entity*** — one identity, everywhere, machine-readable. (Schema + Wikidata + Crunchbase + LinkedIn, all linked.)
2. **Publish what only *you* can** — first-hand operator experience + **original/proprietary data** + named frameworks. This is the single strongest predictor of *both* Google rankings and AI citations, and the AI-content flood can't replicate it.
3. **Get *mentioned* consistently across reputable sites** — for AI visibility, *mentions* beat backlinks (Ahrefs 75k-brand study: ~0.66–0.74 vs 0.22).

Everything else (schema, sitemaps, robots) is low-cost table-stakes. **Skip the hype** (`llms.txt`, "update every 2 days", schema as a ChatGPT hack).

---

## A. How discovery works now (so tactics make sense)

- **Google AI Overviews ≈ your organic top-10** (~76% overlap) → rank well classically and you're largely there.
- **ChatGPT** → Bing index + **Wikipedia** (~48% of its top citations), Forbes, Reddit. Only ~12% overlap with Google's top-10 → a *different* game needing off-Google authority.
- **Perplexity** → its own crawl, heavy on **Reddit/forums** + **fresh** content (~50% current-year).
- **Claude** → training data + live search; leans on **blogs/long-form**.
- Only ~11% of cited domains overlap across platforms → **you can't optimise "for AI" generically.**

*Sources: [Profound](https://www.tryprofound.com/blog/ai-platform-citation-patterns), [Qwairy Q3-2025](https://www.qwairy.co/blog/provider-citation-behavior-q3-2025), [Leapd](https://www.leapd.ai/blog/ai-visibility/how-chatgpt-google-ai-overviews-and-perplexity-source-information-in-2026).*

---

## B. The three levers (in priority order)

### Lever 1 — Entity clarity (you control this; weeks)
- **Lock ONE canonical identity string** and use it *verbatim* everywhere: **"Prateek Saxena — Group General Manager, Al Zaabi Group (Abu Dhabi); enterprise-AI operator."**
- **`sameAs` everywhere** linking your profiles into one entity (4+ verified profiles ≈ ~4× higher Knowledge-Panel creation). ✅ *started — JSON-LD Person/WebSite/ProfilePage already live on the concept.*
- **Wikidata item** (highest-leverage Knowledge-Graph move) — *after* you have ~20–30 third-party references. Wikipedia is a later outcome, not a starting move (needs genuine independent press; can't be forced).
- **Complete Crunchbase** (person + Al Zaabi Group) — DA 90+, used by Google *and* AI as a corroborating source.

*Sources: [Digital Applied — entity SEO](https://www.digitalapplied.com/blog/entity-seo-knowledge-graph-optimization-guide-2026), [Wikipedia notability (people)](https://en.wikipedia.org/wiki/Wikipedia:Notability_(people)).*

### Lever 2 — Content only you can write (your moat)
- **Original data + first-hand experience + named frameworks** is the #1 content-level citation predictor and the core of Google E-E-A-T (Experience now explicitly weighted in the Sept-2025 rater guidelines).
- Your unfair advantage as a 40+ company operator: *"our actual cost-per-outcome," "our kill-or-scale framework," "what we got wrong."* Numbers that don't exist publicly = uncopyable + citation magnets.

*Sources: [Google Helpful Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Quality Rater Guidelines (PDF)](https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf), [Princeton GEO study (KDD 2024)](https://collaborate.princeton.edu/en/publications/geo-generative-engine-optimization).*

### Lever 3 — Off-site mentions (the AI-visibility multiplier)
- **Mentions > backlinks** for AI visibility. Build *mention velocity + consistency* tied to one topic ("enterprise AI").
- Channels: **expert-commentary** (Featured.com / the relaunched HARO / Qwoted — reply within the first hour), **executive bylines** in UAE business-tech press, **podcasts/panels** (GITEX/LEAP-adjacent), **YouTube** (strongest single mention correlation, ~0.74).

*Sources: [Ahrefs — AI Overview brand factors (75k)](https://ahrefs.com/blog/ai-overview-brand-correlation/), [Visible Links Pro — PR → AI Overviews](https://visiblelinkspro.com/pr-placements-google-ai-overview-citations/).*

---

## C. Technical foundation

| Item | Status | Notes |
|---|---|---|
| JSON-LD `Person` + `WebSite` + `ProfilePage` (+ `sameAs`, `worksFor`, `alumniOf`, `knowsAbout`) | ✅ live on concept | The biggest entity/AI payoff; primary signal LLMs use to model who you are. |
| Canonical + OG/Twitter card + dimensions/alt | ✅ live | Social previews + dedup. |
| `BlogPosting` + `BreadcrumbList` schema per article | ⏳ when blog is built | `headline` must match `<h1>` exactly; `author` → Person `@id` **with url**; 3 image ratios. BreadcrumbList still earns visible rich results. |
| **WebGL hero & Core Web Vitals** | ✅ mostly safe | LCP = real DOM headline text (not the canvas); 3D is a deferred module; canvas box reserved (no CLS); `prefers-reduced-motion` → static. 2026 targets: **LCP <2.0s, INP <200ms, CLS <0.1**. To harden: lazy-load the 3D bundle after `load`. |
| `robots.txt` — **allow AI bots** | ⏳ at production root | Allow OAI-SearchBot, PerplexityBot, Claude-SearchBot, ChatGPT-User, GPTBot, ClaudeBot, CCBot, Google-Extended. Blocking cuts ~23% traffic *without* reducing citations. |
| `sitemap.xml` (+ image sitemap) | ⏳ at production root | Only `<lastmod>` matters (keep honest); `changefreq`/`priority` ignored by Google. |
| **RSS feed** (`/rss.xml`, full content) | ⏳ with blog | No ranking boost, but real distribution + faster indexing + newsletter/aggregator reach. |
| `llms.txt` | ❌ **skip** | Essentially unused by major engines (0.1% of AI-bot hits; Google: "no AI system uses it"). Clean semantic HTML matters far more. |
| FAQPage rich results | ❌ skip for snippets | Google removed FAQ rich results entirely. Keep FAQ blocks only as AI "answer units." |

*Sources: [Google ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [Article schema](https://developers.google.com/search/docs/appearance/structured-data/article), [Core Web Vitals 2026](https://www.digitalapplied.com/blog/core-web-vitals-2026-inp-lcp-cls-optimization-guide), [WebGL & SEO](https://www.utsubo.com/blog/webgl-three-js-site-seo-rankable-guide), [AI bots & robots.txt](https://www.soar.sh/blog/ai-bots-robots-txt-guide), [llms.txt reality](https://presenc.ai/research/state-of-llms-txt-2026), [Otterly llms.txt experiment](https://otterly.ai/blog/the-llms-txt-experiment/).*

---

## D. Content strategy

### Format rules (for ranking + AI citation)
- **Structure as "answer units":** question-style H2/H3, a **direct answer in the first 1–2 sentences**, then lists/tables/stats. (RAG retrieves *passages*, not pages; listicles are the most-cited format.)
- **Front-load proprietary statistics** and quotable lines.
- **Keep it fresh:** real publish/update dates; refresh your top ~20% trafficked posts substantively (not just the date — Google ignores cosmetic date bumps).

### Pillars (own 2–3 themes) + cluster model
Pick themes you can genuinely own, then build a pillar page + 8–12 narrow cluster posts each, interlinked:
1. **Enterprise-AI adoption for operators** (ROI, governance, agentic AI on the ground)
2. **Scaling & operating a diversified group** (systems, margins, the operating model)
3. **The UAE real economy & national-AI strategy → boardroom action** ← *your open lane: heavy institutional coverage, almost no individual operator voice*

### Cadence (realistic for a GM)
- **Owned blog:** 1 long-form pillar/cluster post **every 2 weeks** (use a ghostwriter to turn your voice-notes/decks into drafts; you supply the Tier-1 data + final POV).
- **LinkedIn:** 3–4 short posts/week + a **LinkedIn newsletter** (weekly/biweekly). LinkedIn *articles* drive 50–66% of LinkedIn's AI citations and borrow its huge authority.
- **Repurpose 1 pillar → 1 blog post + 1 newsletter + 4–5 LI posts + 1 short video.**
- **Authority compounds at ~12 months — commit to the horizon.**

### Newsjacking (the freshness + citation play)
Within **24–48h** of a major UAE/global AI story (Stargate UAE, MIT "95% of pilots fail," new UAE AI policy), publish a **600–900-word operator's take** front-loaded with a quotable, data-backed verdict; cross-post a condensed version to LinkedIn the same day.

### 12 starter article ideas (tailored to you)
1. *The GenAI Divide, from the inside: why 95% of pilots stall — and the 3 integration moves that put us in the 5%.*
2. *Our AI pilot kill-or-scale framework: the 5 questions before any project sees production.*
3. *Cost-per-outcome, not cost-per-seat: how we actually measure enterprise-AI ROI* (+ reusable model).
4. *What Stargate UAE means for non-tech Gulf enterprises — 3 things to do this quarter.*
5. *Agentic AI in a conglomerate: where multi-agent workflows earned their keep — and where they failed.*
6. *The UAE AI Strategy 2031 operator's playbook: turning "20% of non-oil GDP from AI" into a board agenda.* (pillar)
7. *AI for the family business: governance for the 60% of UAE GDP everyone skips.*
8. *Back-office first: the unsexy AI use cases that actually pay (with our numbers).*
9. *Cabinet Decision 34 for operators: how the new AI tax incentives change build-vs-buy.*
10. *Why most Gulf AI-governance frameworks won't survive a regulator — and the lightweight one we run.*
11. *Evergreen tracker: UAE & Gulf enterprise-AI moves — a working operator's log (updated monthly).* (freshness + hub)
12. *From "CEO for AI" to your org chart: what the UAE government's AI-leadership model teaches private enterprise.*

*Sources: [Deloitte State of AI 2026](https://www.deloitte.com/us/en/what-we-do/capabilities/applied-artificial-intelligence/content/state-of-ai-in-the-enterprise.html), [MIT "GenAI Divide" (Fortune)](https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/), [Stargate UAE (OpenAI)](https://openai.com/index/introducing-stargate-uae/), [UAE AI Strategy 2031](https://u.ae/en/about-the-uae/strategies-initiatives-and-awards/strategies-plans-and-visions/government-services-and-digital-transformation/uae-strategy-for-artificial-intelligence), [topic clusters](https://searchengineland.com/guide/topic-clusters).*

---

## E. Off-site authority roadmap (phased)

**Phase 1 — Identity (weeks, self-controlled):** owned site + Person schema/`sameAs` ✅ · lock canonical identity string · complete **Crunchbase** · optimise LinkedIn + start **long-form LinkedIn articles**.

**Phase 2 — Earned coverage (months 2–6):** daily expert-commentary pipeline (Featured.com/HARO/Qwoted) · **executive bylines** in Arabian Business / Gulf News / Khaleej Times / The National / Zawya, framed to the UAE national-AI narrative · publish **one original GCC enterprise-AI data study** (your strongest PR/link asset) · **podcasts + panels** (GITEX/LEAP-adjacent).

**Phase 3 — Entity codification (months 4–9, after coverage exists):** create **Wikidata** item (every claim referenced) · pursue selective independent recognition (Forbes Middle East, Gulf Business / CEO Middle East, Mohammed Bin Rashid Business Excellence — avoid pay-to-play).

**Phase 4 — Compounding (9–18+):** sustain mention velocity · re-assess **Wikipedia** only once multiple independent secondary sources exist (have an experienced editor draft; never self-author).

*Sources: [HARO/Featured landscape](https://searchatlas.com/blog/haro-alternatives/), [UAE PR guide](https://www.hype-communications.com/post/how-to-get-featured-in-top-uae-media-brands-a-pr-guide), [Gulf Business Awards](https://gulfbusiness.com/gulf-business-awards-2025/).*

---

## F. Platform cheat-sheet

| Engine | Win by |
|---|---|
| **Google AI Overviews / AI Mode** | Rank top-10 classically + schema + freshness. |
| **ChatGPT** | Bing visibility, **Wikipedia** presence, third-party authority (Crunchbase, review/listicle sites), be on neutral "best of" lists. |
| **Perplexity** | **Reddit/forum** presence, very fresh content, allow PerplexityBot. |
| **Claude** | Broad **blog/editorial** footprint, authoritative long-form. |

---

## G. 30 / 60 / 90-day plan

**Days 0–30:** finalise real bio/experience (from your LinkedIn) → wire into site + schema · lock canonical identity string · complete Crunchbase · ship 1 pillar post (#6 above) + start LinkedIn articles · at production launch: AI-bot robots.txt, sitemap, RSS.
**Days 31–60:** 2–3 cluster posts + 1 newsjack · launch LinkedIn newsletter · begin expert-commentary pipeline · pitch first 2 bylines.
**Days 61–90:** publish the **original GCC enterprise-AI data study** · first podcast/panel · prep Wikidata (collect references) · review CWV/Search Console.

---

### Cross-cutting caveat
Most "+X%" platform-share numbers come from vendor studies on specific query sets and shift monthly. The **academic** (Princeton KDD 2024) and **large-N independent** (Ahrefs 75k, Search Engine Land 25k-URL, Rutgers/Wharton) findings are the trustworthy ones; treat single-vendor percentages as directional.
