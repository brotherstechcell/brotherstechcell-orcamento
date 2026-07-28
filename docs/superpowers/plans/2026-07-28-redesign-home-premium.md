# Redesign Premium da Home (Fases 1+2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Brothers Techcell homepage (`src/pages/index.astro` and its component tree) into a calmer, higher-contrast, less-repetitive "premium" visual system — new design tokens, consolidated information architecture (14 → 12 blocks) — without breaking any existing WhatsApp CTA, price lookup, FAQ schema, or shared site chrome used by the 269+ model/bairro/service pages.

**Architecture:** Astro `.astro` components + a single global stylesheet (`src/styles/styles.css`) built on Tailwind v4 (`@theme`) plus a hand-written `:root` custom-property design system that all component CSS actually consumes. No new framework, no build tooling changes. Vanilla JS in `src/scripts/main.js` drives price search, tabs, FAQ accordion, and the diagnostic wizard by querying specific IDs/classes — every task that touches markup must keep those selectors byte-for-byte identical unless the task explicitly says otherwise.

**Tech Stack:** Astro 7, Tailwind CSS v4 (`@tailwindcss/vite`), vanilla JS, no test framework in this repo (verification is `npx astro build` + `grep` structural assertions + manual dev-server check, matching the convention already used in `docs/superpowers/plans/2026-07-27-paginas-bairro.md`).

## Global Constraints

- Do not rename or remove any DOM id/class that `src/scripts/main.js` or `src/scripts/prices.js` queries, unless the task explicitly updates that JS in the same commit: `#device-search-select`, `#tab-btn-telas-baterias`, `#tab-btn-outros-servicos`, `#panel-telas-baterias`, `#panel-outros-servicos`, `#diagnostic-device-select`, `#btn-submit-diagnostic`, `#mobile-menu-toggle`, `#nav-menu-list`, `.header-main`, `.floating-whatsapp-container`, `.scroll-reveal` (+ `.scroll-left`/`.scroll-right`/`.scroll-top`/`.delay-1/2/3`), `.faq-item`/`.faq-question`, `.symptom-btn`/`[data-symptom]`, `.reel-card`/`.reel-frame`/`.reel-video-wrapper video`/`.reel-insta-btn`, `[data-message]`/`.btn-whatsapp-global`, `.contact-phone-text`/`.contact-email-link`/`.contact-instagram-link`, `#device-search-input`/`#search-input-clear-btn`/`#matched-model-name`/`#search-autocomplete-suggestions`, `#selector-results-grid`.
- `PricingSelector.astro`'s results grid is re-rendered client-side by `renderSelectorResults()` in `main.js` (hardcoded HTML template strings with classes `price-selector-card`, `fancy-card`, `service-quality-row`, `premium-featured`, `quality-badge`, `quality-pricing`, `quality-price-cash`, `quality-price-install`, `quality-action`, `btn-quality-order`, `btn-premium-cta`, `quality-benefits-wrapper`, `benefit-item warranty`/`gift`, `premium-recommend-badge`). Any task touching this component is **CSS-value-only** — no class renames — because updating one side (Astro template) without the other (`main.js` template strings) silently breaks the component after the visitor's first model search.
- Every `<section>` that is a scroll-spy/nav target must keep its `id` attribute: `#inicio`, `#transparencia`, `#diferenciais`, `#telas-precos`, `#comparativo-telas` (+ the `#guia-qualidade` anchor div immediately inside it), `#sobre`, `#faq`.
- Color usage: `--primary`/`--primary-dark` (green, unchanged value) only on interactive/action elements (buttons, active tab/badge states, focus indicators) — never as a decorative glow/border/background tint elsewhere.
- Every new/changed section keeps its existing `.scroll-reveal` (+ direction/delay modifier) classes on the elements that already had them, so the existing IntersectionObserver-driven fade-in keeps working. Do not add GSAP, Motion, Lenis, or Three.js in this plan — those are future phases per the spec.
- No secrets, no new dependencies, no changes to `astro.config.mjs`, `prices.js`'s pricing logic, or any file outside `src/styles/styles.css`, `src/components/*.astro`, `src/pages/index.astro`.

---

## Task 1: Design tokens — fix the two conflicting token systems, add spacing scale

**Files:**
- Modify: `src/styles/styles.css:1-249` (the `@theme` block and the `:root` block)

**Interfaces:**
- Produces: the canonical custom properties every later task's CSS will reference — `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border`, `--primary`, `--primary-dark`, `--radius-sm` (8px), `--radius-md` (12px), `--radius-lg` (20px), `--radius-pill` (999px), `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--space-1` (8px) through `--space-8` (128px).
- Consumes: nothing (this is the foundation task, runs first).

### Background for the implementer

`styles.css` currently defines design tokens **twice**, and the two systems disagree:

1. `@theme { ... }` (lines 5-82) — a Tailwind v4 block. Its typography primitives (`--text-11` … `--text-58`, `--leading-*`, `--tracking-*`) **are** actively used by the `.type-h2`, `.type-h3`, `.type-body-16`, etc. utility classes in the `@layer components` block right below it (lines 84-207) — keep these, just change the values for the ones listed below. But its color/radius/shadow tokens (`--color-dark-gray-800`, `--color-blue-*`, `--color-green-600`, `--radius-none/sm/md/lg/xl/2xl`, `--shadow-sm/DEFAULT/md/lg`, lines 53-81) are **dead** — confirmed via grep that no component markup uses Tailwind utility classes like `rounded-lg` or `text-green-600` directly, everything goes through custom CSS in `@layer` blocks lower in the file that reference the *second* token system below. Delete lines 53-81 entirely.
2. `:root { ... }` (lines 213-249) — a plain CSS custom-property block. **This is the one every component's hand-written CSS actually consumes** (`var(--primary)`, `var(--radius-md)`, `var(--shadow-card)`, etc., used hundreds of times throughout the file). Keep this block, but replace its contents per the table below.

- [ ] **Step 1: Update the `@theme` block's typography primitives (styles.css:12-23)**

Replace:
```css
  --text-11: 11.05px;
  --text-13: 13.6px;
  --text-14: 14px;
  --text-15: 15px;
  --text-16: 16px;
  --text-18: 18px;
  --text-20: 20px;
  --text-22: 22px;
  --text-24: 24px;
  --text-40: 40px;
  --text-44: 44px;
  --text-58: 58px;
```
with:
```css
  --text-11: 11.05px;
  --text-13: 13.6px;
  --text-14: 14px;
  --text-15: 15px;
  --text-16: 16px;
  --text-18: 18px;
  --text-20: 20px;
  --text-22: 22px;
  --text-24: 24px;
  --text-40: 40px;
  --text-44: 44px;
  --text-64: 64px;
```
(`--text-58` becomes `--text-64` — every task that used `.type-h2`/`var(--text-58)` for the Hero H1 switches to the new value; grep for `text-58` after this task to confirm no leftover references before committing.)

- [ ] **Step 2: Delete the dead color/radius/shadow tokens from `@theme` (styles.css:53-81)**

Delete these 29 lines entirely (the blank line before `@theme`'s closing `}` at line 82 stays):
```css
  --color-dark-gray-800: #333333;
  --color-dark-gray-900: #121314;
  --color-blue-300: #6EC1E4;
  --color-blue-400: #1FC3FF;
  --color-blue-500: #5F778B;
  --color-blue-600: #3F527A;
  --color-blue-700: #3F444B;
  --color-blue-800: #14334F;
  --color-white-50: #FFFFFF;
  --color-white-100: #F1F1F1;
  --color-light-gray-100: #DDDDDD;
  --color-light-gray-200: #CCD6DF;
  --color-black: #000000;
  --color-green-600: #29A251;
  --color-green-800: #1A532D;
  --color-red: #CC3366;
  --color-purple: #BFCDDA;

  --radius-none: 999px;
  --radius-sm: 100px;
  --radius-md: 16px;
  --radius-lg: 5px;
  --radius-xl: 45px;
  --radius-2xl: 3px;

  --shadow-sm: rgba(0, 0, 0, 0.05) 0px 0px 30px 0px;
  --shadow-DEFAULT: rgba(87, 248, 141, 0.18) 0px 0px 3.60981px 23.6828px;
  --shadow-md: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
  --shadow-lg: rgba(87, 248, 141, 0.18) 0px 0px 3.60983px 23.6828px;
```

- [ ] **Step 3: Replace the `:root` block (styles.css:213-249) with the consolidated design system**

Replace the entire block with:
```css
:root {
  /* Cor */
  --bg-primary: #FFFFFF;
  --bg-secondary: #FAFAFA;
  --card-bg: #FFFFFF;

  --primary: #29A251;
  --primary-dark: #1A532D;
  --primary-transparent: rgba(41, 162, 81, 0.08);

  --text-primary: #111214;
  --text-secondary: #4B5563;
  --text-muted: #8A8F98;

  --border: #E5E7EB;
  --border-hover: rgba(41, 162, 81, 0.4);

  /* Sombra — neutra, sem tint de cor, quase imperceptível */
  --shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 8px 24px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 20px 48px rgba(15, 23, 42, 0.10);

  /* Retrocompat — mapeados para a escala neutra acima, evita ter que tocar toda regra que ainda referencia esses nomes nesta etapa */
  --shadow-card: var(--shadow-sm);
  --shadow-card-hover: var(--shadow-md);

  --transition-smooth: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* Radius — fonte única, sem duplicidade com @theme */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-pill: 999px;

  /* Espaçamento — grid de 8px */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-5: 48px;
  --space-6: 64px;
  --space-7: 96px;
  --space-8: 128px;
}
```

Note what got removed vs. mapped forward, so later tasks aren't surprised:
- `--bg-tertiary`, `--accent-blue*` (4 tokens), `--primary-glow`, `--primary-glow-trans`, `--shadow-green`, `--shadow-green-lg` are gone. Task 4-13 each grep for these names in the component they touch and replace with the neutral equivalents specified in that task (mostly `var(--primary)`/`var(--shadow-sm)`/`var(--shadow-md)`).
- `--shadow-card`/`--shadow-card-hover` are kept as names (used ~15 times across the file) but now point at the new neutral scale instead of the old green-tinted `rgba(20,51,79,...)` values.

- [ ] **Step 4: Fix the duplicate `.header-cta-btn` rule**

`.header-cta-btn` is defined twice: once at `styles.css:431-450` (outline style: transparent bg, 2px green border) and again at `styles.css:2469-2489` (filled style: solid green bg) — the second wins by source order today, making the first dead code. Delete the second definition (the one currently at ~line 2469-2489, right after `.footer-main`) entirely; Task 2 (Header) will rewrite the remaining one at ~line 431-450 with final values.

- [ ] **Step 5: Verify the build and confirm no dangling references**

Run: `npx astro build`
Expected: build succeeds with no CSS syntax errors.

Run: `grep -rn "text-58\|primary-glow\|accent-blue\|shadow-green\|radius-none\|radius-2xl\|radius-xl" src/`
Expected: matches only inside files that Task 4-13 will fix later (record the list in your commit message so the next task's implementer knows what's still pending) — this step is informational, not a hard gate, since later tasks clean these up component by component.

- [ ] **Step 6: Commit**

```bash
git add src/styles/styles.css
git commit -m "refactor: consolidate design tokens (fix duplicate radius/header-cta-btn, add 8px spacing scale)"
```

---

## Task 2: Header restyle

**Files:**
- Modify: `src/styles/styles.css:327-450` (`.header-main`, `.header-cta-btn`, `.nav-*`, `.brand-*`, `.mobile-menu-toggle`)
- Modify: `src/components/Header.astro` (markup unchanged structurally — same `nav-menu-list` id, same links — only class list tweaks if needed)

**Interfaces:**
- Consumes: `--text-primary`, `--text-secondary`, `--primary`, `--primary-dark`, `--border`, `--radius-pill`, `--shadow-sm`, `--space-*` from Task 1.
- Produces: nothing new consumed by later tasks (Header is a leaf in the visual hierarchy).

- [ ] **Step 1: Update `.header-main` and `.header-main.scrolled` (styles.css:327-352)**

Replace with:
```css
.header-main {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: var(--space-3) 0;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: padding 0.4s cubic-bezier(0.25, 1, 0.5, 1),
              background 0.4s cubic-bezier(0.25, 1, 0.5, 1),
              backdrop-filter 0.4s cubic-bezier(0.25, 1, 0.5, 1),
              border-bottom 0.4s cubic-bezier(0.25, 1, 0.5, 1),
              box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.header-main.scrolled {
  padding: var(--space-2) 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
```

- [ ] **Step 2: Update nav link + brand styles (styles.css:377-430)**

Keep structure, change only colors/weights to reference the new tokens (`.nav-link` uses `var(--text-secondary)`/`var(--text-primary)` — already token-based, no change needed there). Update `.brand-subtitle` (line 385-391) to drop the uppercase-letterspaced green micro-label look for a calmer one:
```css
.brand-subtitle {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-muted);
}
```

- [ ] **Step 3: Rewrite the single remaining `.header-cta-btn` (styles.css:431-450, after Task 1 Step 4 removed the duplicate)**

```css
.header-cta-btn {
  background: var(--primary);
  border: none;
  color: #FFFFFF;
  font-size: 0.825rem;
  font-weight: 700;
  padding: 10px 22px;
  border-radius: var(--radius-pill);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-xs);
  transition: var(--transition-smooth);
}

.header-cta-btn:hover {
  background: var(--primary-dark);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}
```

- [ ] **Step 4: Verify**

Run: `npx astro build`
Expected: succeeds.

Run: `grep -n "header-cta-btn" src/styles/styles.css`
Expected: exactly one rule block (plus its `:hover`), not two.

- [ ] **Step 5: Commit**

```bash
git add src/styles/styles.css src/components/Header.astro
git commit -m "style: restyle header on new design tokens"
```

---

## Task 3: Footer restyle + absorb final CTA banner

**Files:**
- Modify: `src/styles/styles.css:2462-2627` (`.footer-main` and children)
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Consumes: tokens from Task 1.
- Produces: a `.footer-cta-banner` block that Task 14 relies on existing before it deletes `CtaFinal.astro` — do Task 3 before Task 14.

- [ ] **Step 1: Add a CTA banner at the top of `Footer.astro`, before the existing `footer-grid` div**

Insert immediately after the `<footer class="footer-main" ...>` opening tag, before `<div class="container footer-grid">`:
```astro
    <div class="container footer-cta-banner">
      <div class="footer-cta-banner-inner">
        <h2 class="footer-cta-title">Seu iPhone merece o melhor reparo de Manaus</h2>
        <a href="#" class="btn-glow btn-whatsapp-global footer-cta-btn">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span>AGENDAR MEU ATENDIMENTO AGORA</span>
        </a>
      </div>
    </div>
```
(No `id` on this block — `CtaFinal.astro`'s old `.cta-section` had none either, nothing links to it.)

- [ ] **Step 2: Add the banner's CSS and restyle the rest of the footer (styles.css, replace lines 2462-2467 and append new rules right after)**

Replace `.footer-main` (styles.css:2462-2467):
```css
.footer-main {
  background: #111214;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 0 var(--space-4);
  color: rgba(255, 255, 255, 0.65);
}

.footer-cta-banner {
  padding: var(--space-7) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: var(--space-6);
}

.footer-cta-banner-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.footer-cta-title {
  font-size: 2rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: -0.01em;
  max-width: 560px;
}

.footer-cta-btn {
  flex-shrink: 0;
}
```

Note: `.footer-main .brand-subtitle { color: var(--primary-glow); }` (styles.css:2549) references the token deleted in Task 1 — change it to `color: var(--text-muted);` in this task (it's inside the footer CSS block this task owns).

- [ ] **Step 3: Verify**

Run: `npx astro build`
Expected: succeeds, no reference to `--primary-glow` remains in the footer block.

Run: `grep -n "primary-glow" src/styles/styles.css`
Expected: no matches anywhere in the file after this task (it was only used in Hero's `.text-gradient`, fixed in Task 5, and here).

- [ ] **Step 4: Commit**

```bash
git add src/styles/styles.css src/components/Footer.astro
git commit -m "feat: add footer CTA banner, restyle footer on new tokens"
```

---

## Task 4: BottomNav + FloatingWhatsapp restyle

**Files:**
- Modify: `src/styles/styles.css:2628-2750` (`.floating-whatsapp-container`, `.btn-whatsapp-floating`, `.bottom-nav*`)
- No markup changes to `BottomNav.astro` / `FloatingWhatsapp.astro` — CSS-value-only task.

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Restyle `.bottom-nav` shadow/border (styles.css:2694-2709)**

Change `box-shadow: 0 -4px 20px rgba(20, 51, 79, 0.08);` to `box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.06);` (matches the new neutral shadow tint instead of the old blue-tinted one). Everything else in this block already uses tokens — no other change needed.

- [ ] **Step 2: Leave `.btn-whatsapp-floating`'s WhatsApp-brand green (`#25d366`) as-is**

This is WhatsApp's own brand color on a single floating action button, not the site's `--primary` — it's the universally-recognized WhatsApp affordance and should stay untouched per the "keep verde but don't add more color" spirit; changing it would hurt recognizability, not help the premium feel.

- [ ] **Step 3: Verify**

Run: `npx astro build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/styles/styles.css
git commit -m "style: restyle bottom-nav shadow on neutral token"
```

---

## Task 5: Hero redesign

**Files:**
- Modify: `src/components/Hero.astro`
- Modify: `src/styles/styles.css:636-785` (`.hero-*`, `.text-gradient`)

**Interfaces:**
- Consumes: `--text-64` (from Task 1), `--primary`, `--primary-dark`, `--text-primary`, `--text-secondary`, `--space-*`.
- Produces: nothing new — Task 8 places `TrustStatsBar` after Hero in `index.astro`, not inside `Hero.astro`.

- [ ] **Step 1: Simplify `Hero.astro` markup — one visual change: drop the inline `style=` attribute on the response-time badge, move it to a class**

Replace:
```astro
              <div class="response-time-badge" style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 700; color: var(--primary-dark); margin-top: 12px; background: rgba(41, 162, 81, 0.08); padding: 6px 14px; border-radius: var(--radius-pill); border: 1px solid rgba(41, 162, 81, 0.2);">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary); display: inline-block; box-shadow: 0 0 8px var(--primary);"></span>
                ⚡ Resposta em &lt; 5 min • Técnicos hoje em Manaus
              </div>
```
with:
```astro
              <div class="response-time-badge">
                <span class="response-time-dot"></span>
                Resposta em &lt; 5 min • Técnicos hoje em Manaus
              </div>
```
(Dropped the ⚡ emoji per the spec's icon discipline — no emoji-as-icon.)

- [ ] **Step 2: Add the new classes' CSS, right after `.hero-btn-container` in styles.css (after line 779)**

```css
.response-time-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: var(--space-2);
}

.response-time-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  display: inline-block;
}
```

- [ ] **Step 3: Update Hero section spacing + typography (styles.css:636-785)**

Change `.hero-title` (styles.css:747-754):
```css
.hero-title {
  font-size: var(--text-64);
  margin-bottom: var(--space-3);
  line-height: 1.1;
  color: var(--text-primary);
  font-weight: 800;
  letter-spacing: -0.02em;
}
```

Change `.hero-description` (styles.css:762-768) — shorten line length, reduce bottom margin to fit the 8px scale:
```css
.hero-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
  max-width: 520px;
  line-height: 1.6;
}
```

Change `.hero-section` padding (styles.css:636-643) to use the spacing scale:
```css
.hero-section {
  position: relative;
  min-height: 100vh;
  padding: var(--space-7) 0 var(--space-5) 0;
  display: flex;
  align-items: center;
  background-color: var(--bg-primary);
}
```

Fix `.text-gradient` (styles.css:756-760), which references the now-deleted `--primary-glow`:
```css
.text-gradient {
  background: linear-gradient(135deg, var(--primary-dark) 20%, var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

- [ ] **Step 4: Verify**

Run: `npx astro build`
Expected: succeeds.

Run: `grep -n "response-time-badge\|text-gradient\|hero-title" src/components/Hero.astro src/styles/styles.css`
Expected: no inline `style=` attribute left on `.response-time-badge`'s markup; `.text-gradient` no longer references `--primary-glow`.

Manually open the dev server (`npm run dev`) and check the Hero at 375px, 768px, 1024px, 1440px — headline must not overflow/wrap awkwardly at any width, video must stay contained.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro src/styles/styles.css
git commit -m "style: redesign Hero typography, remove inline styles, fix dead token reference"
```

---

## Task 6: ComoFunciona — compact 3-step band

**Files:**
- Modify: `src/components/ComoFunciona.astro`
- Modify: `src/styles/styles.css:976-1054` (`.how-it-works-section`, `.timeline-*`)

**Interfaces:**
- Consumes: tokens from Task 1. Section id `#como-funciona` stays (not a nav target today, but keep it — cheap, consistent, and scroll-spy code operates generically on any `section[id]`).

- [ ] **Step 1: Trim `ComoFunciona.astro` copy and simplify markup**

Replace the full file content with:
```astro
    <!-- Faixa "Como Funciona" (compacta) -->
    <section id="como-funciona" class="how-it-works-section">
      <div class="container">
        <div class="how-it-works-grid">
          <div class="how-it-works-step scroll-reveal scroll-left">
            <span class="how-it-works-number">01</span>
            <div>
              <h3 class="how-it-works-title">Consulte o Preço</h3>
              <p class="how-it-works-text">Selecione seu modelo e veja o valor na hora.</p>
            </div>
          </div>

          <div class="how-it-works-step scroll-reveal scroll-top delay-1">
            <span class="how-it-works-number">02</span>
            <div>
              <h3 class="how-it-works-title">Agende pelo WhatsApp</h3>
              <p class="how-it-works-text">Marque o horário, o técnico vai até você.</p>
            </div>
          </div>

          <div class="how-it-works-step scroll-reveal scroll-right delay-2">
            <span class="how-it-works-number">03</span>
            <div>
              <h3 class="how-it-works-title">Reparo na Sua Frente</h3>
              <p class="how-it-works-text">Pronto em 20 a 40 minutos, você acompanha tudo.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Replace the section's CSS (styles.css:976-1054, `.how-it-works-section` through `.timeline-step p`)**

```css
.how-it-works-section {
  padding: var(--space-6) 0;
  background: var(--bg-secondary);
}

.how-it-works-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.how-it-works-step {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.how-it-works-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
  flex-shrink: 0;
  line-height: 1;
}

.how-it-works-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.how-it-works-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .how-it-works-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
}
```

(This replaces `.timeline-wrapper`, `.timeline-wrapper::before`, `.timeline-step`, `.step-number-glow`, and related hover rules — grep for `step-number-glow` and `timeline-wrapper` after this task to confirm nothing else in the codebase still references them.)

- [ ] **Step 3: Verify**

Run: `npx astro build`
Expected: succeeds.

Run: `grep -rn "timeline-wrapper\|step-number-glow\|timeline-step" src/`
Expected: no matches (confirms the old classes are fully retired, not just orphaned in CSS).

- [ ] **Step 4: Commit**

```bash
git add src/components/ComoFunciona.astro src/styles/styles.css
git commit -m "refactor: compact ComoFunciona into a 3-column band"
```

---

## Task 7: Diferenciais — merge into one 4-card grid

**Files:**
- Modify: `src/components/Diferenciais.astro`
- Modify: `src/styles/styles.css:900-975` (`.differentials-grid`, `.diff-card`) and `:465-527` (`.trust-shield-*`)

**Interfaces:**
- Consumes: tokens from Task 1. Section id `#diferenciais` stays — referenced by `Header.astro` nav, `BottomNav.astro`, `Footer.astro` links.

### Content decision (dedup — each fact stated exactly once site-wide within this section)

Today's 6 cards (3 in `#diferenciais`, 3 unnamed in `.trust-shield-section`) repeat ESD/IP68/Texas-Instruments facts that also appear in `Sobre.astro` (fixed in Task 12) and `Faq.astro`. This task collapses them to 4 cards, one fact each:

- [ ] **Step 1: Replace `Diferenciais.astro`'s full content**

```astro
    <!-- Seção de Diferenciais (unificada) -->
    <section id="diferenciais">
      <div class="container">
        <div class="section-header scroll-reveal scroll-top">
          <span class="section-label">Diferenciais Técnicos</span>
          <h2 class="section-title type-h2-44">Por Que Escolher a Brothers Techcell em Manaus?</h2>
          <p class="section-subtitle type-subheading-20">Conveniência delivery e máxima precisão técnica da melhor assistência especializada Apple de Manaus, diretamente no seu endereço.</p>
        </div>

        <div class="differentials-grid">
          <div class="diff-card scroll-reveal scroll-top">
            <div class="diff-icon-container">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </div>
            <h3 class="diff-title type-h3">100% Transparente, na Sua Frente</h3>
            <p class="diff-text type-body-16">Reparo feito na sua presença, sobre mantas antiestáticas (ESD) e bancadas homologadas. Restauramos o selo de vedação original (IP68) e nunca pedimos a senha do seu iPhone.</p>
          </div>

          <div class="diff-card scroll-reveal scroll-top delay-1">
            <div class="diff-icon-container">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
            </div>
            <h3 class="diff-title type-h3">Delivery Sem Custo em Manaus</h3>
            <p class="diff-text type-body-16">Zero taxa de deslocamento na maioria dos bairros de Manaus. Técnico até você em 20 a 40 minutos, em casa ou no trabalho.</p>
          </div>

          <div class="diff-card scroll-reveal scroll-top delay-2">
            <div class="diff-icon-container">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
            <h3 class="diff-title type-h3">Peças Premium, Garantia Real</h3>
            <p class="diff-text type-body-16">Displays OLED Super Retina XDR com <strong>True Tone</strong> e <strong>Face ID</strong> preservados. Até 6 meses de garantia nas peças Premium — confira o <a href="#comparativo-telas">Guia de Qualidade de Telas</a>.</p>
          </div>

          <div class="diff-card scroll-reveal scroll-top delay-3">
            <div class="diff-icon-container">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <h3 class="diff-title type-h3">Bateria com Chip Texas Instruments</h3>
            <p class="diff-text type-body-16">Baterias homologadas com controlador de carga Texas Instruments, preservando os ciclos de carga e a leitura correta de Saúde da Bateria.</p>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Replace `.differentials-grid` to a 4-column grid and delete `.trust-shield-*` (styles.css:465-527 and :900-975)**

Delete the entire `.trust-shield-section` block (styles.css:465-527, from the `/* TRUST SHIELD */` comment through `.trust-shield-info p`).

Replace `.differentials-grid` (styles.css:900-906ish):
```css
.differentials-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}

@media (max-width: 1024px) {
  .differentials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .differentials-grid {
    grid-template-columns: 1fr;
  }
}
```

Keep `.diff-card` (styles.css ~906-945) but drop the green-glow hover per the "sombra quase imperceptível" rule — replace its `box-shadow`/`::after`-glow hover rule with:
```css
.diff-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  transition: var(--transition-smooth);
}

.diff-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}
```
(Delete `.diff-card::after` and `.diff-card:hover::after` if present — the glow pseudo-element.)

- [ ] **Step 3: Verify**

Run: `npx astro build`
Expected: succeeds.

Run: `grep -rn "trust-shield" src/`
Expected: no matches anywhere (component and CSS both fully removed).

Run: `grep -c "mantas antiestáticas\|ESD\|IP68\|Texas Instruments" src/components/Diferenciais.astro src/components/Sobre.astro src/components/Faq.astro`
Expected (after Task 12 also runs): each fact (ESD, IP68, Texas Instruments) appears in `Diferenciais.astro` (authoritative statement) and may still legitimately appear once more in `Faq.astro` (answering a direct search query is a different intent than restating a differentiator — that's fine) but must NOT still appear in `Sobre.astro` after Task 12.

- [ ] **Step 4: Commit**

```bash
git add src/components/Diferenciais.astro src/styles/styles.css
git commit -m "refactor: merge Diferenciais + trust-shield into one 4-card grid, dedupe repeated trust facts"
```

---

## Task 8: TrustStatsBar (new) + merge ReelsShowcase/GoogleReviews into ProvaSocial

This is the biggest structural task — do it in one commit since an intermediate state would show the stats bar twice.

**Files:**
- Create: `src/components/TrustStatsBar.astro`
- Create: `src/components/ProvaSocial.astro`
- Delete: `src/components/ReelsShowcase.astro`
- Delete: `src/components/GoogleReviews.astro`
- Modify: `src/pages/index.astro` (imports + composition order)
- Modify: `src/styles/styles.css:1929-2218` (`.transparency-section`, `.reel-*`, `.trust-stats-bar`, `.reviews-section` and children — the last block currently lives scoped inside `GoogleReviews.astro`'s own `<style>` tag, not in `styles.css`)

**Interfaces:**
- Consumes: tokens from Task 1.
- Produces: `TrustStatsBar` renders standalone (no props). `ProvaSocial` renders standalone (no props), keeps `id="transparencia"` — the same anchor `Header.astro`'s nav and `BottomNav.astro`'s "Vídeos" link already target, so neither of those files needs to change.

- [ ] **Step 1: Create `TrustStatsBar.astro`** — same 4 stats as today's `trust-stats-bar` (currently embedded in `ReelsShowcase.astro`), same markup/classes, just its own file:

```astro
    <!-- Faixa de Prova Social (Estatísticas) -->
    <div class="container">
      <div class="trust-stats-bar scroll-reveal scroll-top">
        <div class="trust-stat-item">
          <div class="trust-stat-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
          <div class="trust-stat-data">
            <span class="trust-stat-number">2.500+</span>
            <span class="trust-stat-label">Reparos Realizados</span>
          </div>
        </div>
        <div class="trust-divider"></div>
        <div class="trust-stat-item">
          <div class="trust-stat-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          </div>
          <div class="trust-stat-data">
            <span class="trust-stat-number">100%</span>
            <span class="trust-stat-label">Transparente</span>
          </div>
        </div>
        <div class="trust-divider"></div>
        <div class="trust-stat-item">
          <div class="trust-stat-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
          </div>
          <div class="trust-stat-data">
            <span class="trust-stat-number">~30 min</span>
            <span class="trust-stat-label">Tempo Médio</span>
          </div>
        </div>
        <div class="trust-divider"></div>
        <div class="trust-stat-item">
          <div class="trust-stat-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>
          <div class="trust-stat-data">
            <span class="trust-stat-number">9+ Anos</span>
            <span class="trust-stat-label">de Experiência</span>
          </div>
        </div>
      </div>
    </div>
```

Note: dropped `data-count="2500"` from the first stat — grepping `main.js` confirms no function reads that attribute (no counter-animation exists today), so it was dead markup. If a future Motion/GSAP phase wants a count-up animation, it'll add the attribute back alongside the JS that reads it.

- [ ] **Step 2: Restyle `.trust-stats-bar` as a compact bar directly under the Hero (styles.css:2150-2217, keep classes, tighten values)**

```css
.trust-stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  flex-wrap: wrap;
  box-shadow: var(--shadow-xs);
}

.trust-stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  justify-content: center;
  padding: var(--space-1) var(--space-2);
  min-width: 180px;
}

.trust-stat-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-transparent);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-dark);
  flex-shrink: 0;
}

.trust-stat-icon svg { width: 20px; height: 20px; fill: currentColor; }

.trust-stat-data { display: flex; flex-direction: column; }

.trust-stat-number {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
}

.trust-stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.trust-divider { width: 1px; height: 40px; background: var(--border); flex-shrink: 0; }
```

(Note: `.trust-stat-icon`'s `background`/`color` switched from the deleted `--accent-blue-bg`/`--accent-blue` to `--primary-transparent`/`--primary-dark` — no blue accent color survives this redesign per the "poucas cores" constraint.)

- [ ] **Step 3: Create `ProvaSocial.astro`** — merges the reel-video grid + IG CTA from the old `ReelsShowcase.astro` (minus the stats bar, now its own component) with the review cards from `GoogleReviews.astro`, stacked under one header:

```astro
---
const reviews = [
  {
    name: "Carlos Eduardo M.",
    device: "iPhone 14 Pro Max",
    service: "Troca de Tela",
    comment: "Trocaram a tela na minha mesa do escritório em 25 minutos. Sensacional, agilidade pura e preço justo! Recomendo a todos de Manaus.",
    date: "Há 3 dias"
  },
  {
    name: "Fernanda Lima",
    device: "iPhone 13",
    service: "Troca de Bateria",
    comment: "A bateria do meu iPhone 13 durava 2 horas. O técnico veio até o meu trabalho no Adrianópolis e resolveu na hora com 6 meses de garantia.",
    date: "Há 1 semana"
  },
  {
    name: "Rafael Sampaio",
    device: "iPhone 15 Pro",
    service: "Troca de Tela Premium",
    comment: "Atendimento impecável! Fiz a troca da tela na minha frente, super transparente e com peças premium idênticas de fábrica.",
    date: "Há 2 semanas"
  },
  {
    name: "Beatriz Mendes",
    device: "iPhone 12",
    service: "Troca de Bateria e Tela",
    comment: "Preço justo, sem enrolação e atendimento nota 10. O agendamento pelo WhatsApp levou menos de 3 minutos.",
    date: "Há 3 semanas"
  }
];
---
    <!-- Prova Social: vídeos reais + avaliações -->
    <section id="transparencia" class="social-proof-section">
      <div class="container">
        <div class="section-header scroll-reveal scroll-top">
          <span class="section-label">Prova Social</span>
          <h2 class="section-title type-h2-44">Veja Como Trabalhamos</h2>
          <p class="section-subtitle type-subheading-20">Atendimentos reais filmados pela nossa equipe, e a experiência de quem já agendou. 5.0 ★★★★★ no Google Meu Negócio.</p>
        </div>

        <div class="reels-grid grid-2-columns">
          <div class="reel-card scroll-reveal scroll-top">
            <div class="reel-frame">
              <div class="reel-video-wrapper">
                <video src="/assets/troca-tela-iphone-13.mp4" muted playsinline loop preload="metadata" class="reel-video-element"></video>
                <div class="reel-video-overlay">
                  <div class="play-indicator-glow">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
            </div>
            <div class="reel-caption">
              <span class="reel-caption-tag">Troca de Tela iPhone 13</span>
              <p class="reel-caption-text type-body-16">Troca de tela completa realizada na residência do cliente sem que ele precise sair de casa ou do trabalho!</p>
              <a href="https://www.instagram.com/brothers_techcell/" target="_blank" rel="noopener noreferrer" class="reel-insta-btn">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                <span>Nosso Instagram</span>
              </a>
            </div>
          </div>

          <div class="reel-card scroll-reveal scroll-top delay-1">
            <div class="reel-frame">
              <div class="reel-video-wrapper">
                <video src="/assets/delivery-dose-dupla.mp4" muted playsinline loop preload="metadata" class="reel-video-element"></video>
                <div class="reel-video-overlay">
                  <div class="play-indicator-glow">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
            </div>
            <div class="reel-caption">
              <span class="reel-caption-tag">Delivery em Dose Dupla</span>
              <p class="reel-caption-text type-body-16">Eficiência em dose dupla! Atendimentos simultâneos rápidos em Manaus com o selo de transparência.</p>
              <a href="https://www.instagram.com/brothers_techcell/" target="_blank" rel="noopener noreferrer" class="reel-insta-btn">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                <span>Nosso Instagram</span>
              </a>
            </div>
          </div>
        </div>

        <div class="reviews-grid">
          {reviews.map((rev) => (
            <div class="review-card fancy-card scroll-reveal scroll-top">
              <div class="review-card-header">
                <div class="review-author-info">
                  <span class="author-avatar">{rev.name.charAt(0)}</span>
                  <div>
                    <h4 class="author-name">{rev.name}</h4>
                    <span class="author-device">{rev.device} • {rev.service}</span>
                  </div>
                </div>
                <span class="review-stars">★★★★★</span>
              </div>
              <p class="review-comment">"{rev.comment}"</p>
              <span class="review-date">{rev.date} • Avaliação Verificada no Google</span>
            </div>
          ))}
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Move review-card CSS out of `GoogleReviews.astro`'s scoped `<style>` (being deleted) into `styles.css`, alongside the reel CSS**

Add to `styles.css` right after the existing `.reel-*` rules (around line 2145, before the `TRUST STATS BAR` comment block which Task 8 Step 2 already updated):
```css
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.review-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: var(--transition-smooth);
}

.review-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-sm);
}

.review-card-header { display: flex; justify-content: space-between; align-items: center; }
.review-author-info { display: flex; align-items: center; gap: 12px; }

.author-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--primary-transparent);
  color: var(--primary-dark);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.author-name { font-size: 1rem; font-weight: 800; color: var(--text-primary); }
.author-device { font-size: 0.75rem; color: var(--text-muted); display: block; }
.review-stars { color: #ff9f43; font-size: 1rem; letter-spacing: 2px; }
.review-comment { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; font-style: italic; }
.review-date { font-size: 0.725rem; color: var(--text-muted); margin-top: auto; }

@media (max-width: 768px) {
  .reviews-grid { grid-template-columns: 1fr; gap: var(--space-2); }
}
```

Also add a `.social-proof-section { background: var(--bg-primary); }` rule and update `.reels-grid`/`.reel-card` (currently under the `TRANSPARENCY SECTION` comment at styles.css:1929+) to drop the now-unused `.transparency-section` class name in favor of `.social-proof-section` — rename that one selector, leave `.reel-*` children as-is (their classes are consumed by `main.js`'s `setupReelsAutoplay()` and must not change).

- [ ] **Step 5: Delete the old files and rewire `index.astro`**

```bash
git rm src/components/ReelsShowcase.astro src/components/GoogleReviews.astro
```

In `src/pages/index.astro`, replace:
```astro
import ReelsShowcase from '../components/ReelsShowcase.astro';
import GoogleReviews from '../components/GoogleReviews.astro';
```
with:
```astro
import TrustStatsBar from '../components/TrustStatsBar.astro';
import ProvaSocial from '../components/ProvaSocial.astro';
```

And replace the composition (currently `<Hero /> <ReelsShowcase /> <GoogleReviews /> <ComoFunciona /> <Diferenciais /> ...`) with:
```astro
    <Hero />
    <TrustStatsBar />
    <ComoFunciona />
    <Diferenciais />
    <ProvaSocial />
    <PricingSelector />
```
(`ProvaSocial` moves to right before `PricingSelector`, matching the approved IA order: Hero → stats → Como Funciona → Diferenciais → Prova Social → Pricing.)

- [ ] **Step 6: Verify**

Run: `npx astro build`
Expected: succeeds, no missing-import errors.

Run: `grep -rn "ReelsShowcase\|GoogleReviews" src/`
Expected: no matches.

Run: `grep -n 'id="transparencia"' src/components/ProvaSocial.astro`
Expected: exactly one match (the anchor Header/BottomNav still target).

Open dev server, confirm: both videos autoplay sequentially (Task's constraint — `.reel-card`/`.reel-video-wrapper video` classes preserved), hovering a video dims the other, all 4 reviews render.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: extract TrustStatsBar, merge ReelsShowcase+GoogleReviews into ProvaSocial"
```

---

## Task 9: PricingSelector — CSS-value-only restyle

**Files:**
- Modify: `src/styles/styles.css` (search for `.pricing-selector-container`, `.selector-tabs`, `.selector-tab`, `.price-selector-card`, `.fancy-card`, `.service-quality-row`, `.quality-badge`, `.quality-pricing`, `.btn-quality-order`, `.device-search-input-field`, `.model-chip-btn` — grep first, these weren't in the line ranges read during planning)
- **Do NOT modify** `src/components/PricingSelector.astro`'s class names or structure, and **do NOT modify** `src/scripts/main.js`'s `renderSelectorResults()`/`getQualityBenefitsHtml()` template strings — both must keep emitting the exact same class names for this task to be safe (per Global Constraints).

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Locate every rule for this component**

Run: `grep -n "^\.pricing-selector\|^\.selector-tab\|^\.price-selector-card\|^\.fancy-card\|^\.service-quality-row\|^\.quality-\|^\.btn-quality-order\|^\.device-search\|^\.model-chip-btn\|^\.search-" src/styles/styles.css`

Record the line ranges returned — edit each in place.

- [ ] **Step 2: Apply token substitutions only**

For every rule found in Step 1: replace any hardcoded hex color that matches an old token's resolved value (`#29a251`/`rgba(41, 162, 81, ...)` → `var(--primary)`/`var(--primary-transparent)` if not already a var; `rgba(20, 51, 79, ...)` shadow tints → `var(--shadow-sm)`/`var(--shadow-md)`; any leftover `var(--accent-blue*)`/`var(--primary-glow)` → `var(--primary)`/`var(--primary-dark)`), and any hardcoded padding/margin/gap in multiples of 8 or 4 → the matching `var(--space-*)` token. Do not change `border-radius` values on the tab pills or cards beyond swapping to `var(--radius-md)`/`var(--radius-pill)` where the current value is close (16px/24px → keep visually equivalent by using `--radius-md`/`--radius-lg`). Do not touch selectors, only declarations.

- [ ] **Step 3: Verify**

Run: `npx astro build`
Expected: succeeds.

Run: `grep -c "class=\"price-selector-card fancy-card\"" src/components/PricingSelector.astro` and `grep -c "price-selector-card fancy-card" src/scripts/main.js`
Expected: both still return their pre-task count (1 and 1 respectively) — confirms neither file's class strings were touched.

Open dev server: type a model into the search box (`#device-search-input`), confirm results re-render with the new visual style, confirm the "Telas e Baterias" / "Outros Serviços" tabs still switch panels, confirm a schedule link still opens `brothersystem.vercel.app/agendar?...`.

- [ ] **Step 4: Commit**

```bash
git add src/styles/styles.css
git commit -m "style: restyle PricingSelector on new tokens (CSS values only, no markup/JS change)"
```

---

## Task 10: ComparativoTelas restyle + compact

**Files:**
- Modify: `src/styles/styles.css:1055-1234` (`.comparison-section`, `.bento-card*`)
- Modify: `src/components/ComparativoTelas.astro` (copy trim only — keep `id="comparativo-telas"` and the `id="guia-qualidade"` anchor div exactly as-is; `Sobre.astro`'s `#guia-qualidade` link depends on it)

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Trim the Premium card's bullet list from 6 items to 4** (remove the 2 that duplicate Task 7's Diferenciais card 3 — "Fidelidade perfeita de cores" and "Restauração do selo de vedação IP68" are now stated once in Diferenciais):

In `ComparativoTelas.astro`, replace the `<ul class="bento-bullets premium ...">` items:
```astro
            <ul class="bento-bullets premium type-small-body" style="margin-bottom: 24px;">
              <li>Painel OLED Super Retina XDR com brilho de fábrica</li>
              <li>Suporte total a True Tone e Face ID</li>
              <li style="color: var(--primary); font-weight: 700;">★ 6 Meses (180 Dias) de Garantia Blindada</li>
              <li style="color: var(--primary); font-weight: 700;">★ Película 3D + Capinha Protetora de Brinde</li>
            </ul>
```
(Also drop the `var(--primary-glow)` inline color reference — it's gone as of Task 1 — use `var(--primary)`.)

- [ ] **Step 2: Replace `.comparison-section`/`.bento-card*` CSS (styles.css:1055-1234) values**

Change section padding to `padding: var(--space-6) 0;`, card `border-radius: var(--radius-lg);`, card `padding: var(--space-4);`, gap between the 2 bento cards to `var(--space-3)`, and replace the Premium card's glow border/shadow (`.bento-card.premium-destaque`, styles.css:1172-1194 — likely references `--primary-glow`/`--shadow-green-lg`) with `box-shadow: var(--shadow-md); border: 1px solid var(--primary-dark);`.

- [ ] **Step 3: Verify**

Run: `npx astro build`
Expected: succeeds.

Run: `grep -n 'id="comparativo-telas"\|id="guia-qualidade"' src/components/ComparativoTelas.astro`
Expected: both ids still present, unchanged.

Run: `grep -n 'guia-qualidade' src/components/Sobre.astro`
Expected: the link `href="#guia-qualidade"` is still there (untouched until Task 12).

- [ ] **Step 4: Commit**

```bash
git add src/components/ComparativoTelas.astro src/styles/styles.css
git commit -m "style: restyle ComparativoTelas, trim duplicate Premium bullets"
```

---

## Task 11: DiagnosticForm — CSS-value-only restyle, reduce visual weight

**Files:**
- Modify: `src/styles/styles.css` (`.diagnostic-section`, `.diagnostic-card`, `.symptom-btn` at ~2502-2539, and any `.diagnostic-*` rules — grep first)
- **Do NOT modify** `DiagnosticForm.astro`'s `.symptom-btn`/`data-symptom` attributes, `#diagnostic-device-select`, or `#btn-submit-diagnostic` ids — `setupDiagnosticWizard()` in `main.js` depends on all three.

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Locate every rule**

Run: `grep -n "^\.diagnostic-" src/styles/styles.css`

- [ ] **Step 2: Reduce the card's visual weight relative to `PricingSelector`**

The spec calls for this section to read as a secondary path, not compete with the main pricing card. Change `.diagnostic-card`'s `box-shadow` to `var(--shadow-xs)` (down from whatever glow it currently has), drop any `.diagnostic-glow` decorative pseudo-element/div styling to `display: none` in the CSS (leave the `<div class="diagnostic-glow">` markup — CSS-only task), and change the section's background to `var(--bg-secondary)` so it visually recedes one step behind the white `PricingSelector` section above it.

- [ ] **Step 3: Verify**

Run: `npx astro build`
Expected: succeeds.

Open dev server: click each symptom button, confirm `.active` class moves correctly and the WhatsApp link (`#btn-submit-diagnostic` href) updates with the right symptom + model text.

- [ ] **Step 4: Commit**

```bash
git add src/styles/styles.css
git commit -m "style: reduce DiagnosticForm visual weight relative to PricingSelector"
```

---

## Task 12: Sobre — trim duplicate copy, restyle

**Files:**
- Modify: `src/components/Sobre.astro`
- Modify: `src/styles/styles.css:2223-2325` (`.about-section` and children)

**Interfaces:**
- Consumes: tokens from Task 1. Section id `#sobre` stays — referenced by `Header.astro` nav and `Footer.astro`.

- [ ] **Step 1: Replace the two body paragraphs and remove the 2 duplicate highlight items**

Replace the `<div class="about-description ...">` block:
```astro
          <div class="about-description type-large-body">
            <p>Na <strong>Brothers Techcell</strong>, seu iPhone recebe o mesmo padrão técnico de uma assistência autorizada: especialistas atualizados no ecossistema Apple, atendimento em todos os bairros de Manaus e zero achismo. Confira nosso <a href="#guia-qualidade">Guia de Qualidade</a> ou nossas <a href="#faq">Perguntas Frequentes</a>.</p>
          </div>
```
(Merges the old 2 paragraphs into 1, drops the restated ESD/True-Tone/Face-ID/IP68/Texas-Instruments details — those now live exactly once in `Diferenciais.astro` from Task 7.)

Delete the entire `<div class="about-highlight-list">...</div>` block (both `about-highlight-item`s — "Laboratório Móvel & Proteção ESD" and "Chipset Texas Instruments & Selo Anatel" — are pure duplicates of Task 7's Diferenciais cards 1 and 4).

- [ ] **Step 2: Update the section's CSS (styles.css:2223-2325)**

`.about-section` background: replace the gradient with a flat `var(--bg-primary)`. `.experience-badge` (styles.css:2240-2250): change `border: 1px solid var(--primary)` + `box-shadow: var(--shadow-green)` to `border: 1px solid var(--border); box-shadow: var(--shadow-sm);`. Delete the now-orphaned `.about-highlight-list`/`.about-highlight-item`/`.check-icon`/`.about-highlight-text` rules (their markup no longer exists after Step 1) — grep to confirm no other file uses `.about-highlight-item` before deleting (expected: none).

- [ ] **Step 3: Verify**

Run: `npx astro build`
Expected: succeeds.

Run: `grep -c "mantas antiestáticas\|ESD\|IP68\|Texas Instruments" src/components/Sobre.astro`
Expected: `0`.

Run: `grep -rn "about-highlight" src/`
Expected: no matches (component and CSS both removed).

- [ ] **Step 4: Commit**

```bash
git add src/components/Sobre.astro src/styles/styles.css
git commit -m "refactor: trim Sobre copy (remove facts duplicated in Diferenciais), restyle"
```

---

## Task 13: Faq — restyle only

**Files:**
- Modify: `src/styles/styles.css:2330-2419ish` (`.faq-section`, `.faq-grid`, `.faq-item`, `.faq-question`, `.zero-click-summary-table` inline styles)
- **Do NOT modify** `Faq.astro`'s `.faq-item`/`.faq-question` structure, the `faqItems` array, or the JSON-LD script — `setupFaqAccordion()` in `main.js` depends on the class names, and the FAQ schema must keep matching the visible text exactly (Global Constraint + the original site's SEO investment).

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Token-substitute the CSS**

`.faq-section` background → `var(--bg-secondary)` (already token-based, confirm no hardcoded hex slipped in). `.faq-item` border/radius/hover already reference tokens (styles.css:2349-2357) — just confirm after Task 1 they resolve to the new neutral values, no edit needed unless grep finds a stray hardcoded color.

- [ ] **Step 2: Restyle the inline `zero-click-summary-table` in `Faq.astro`**

This table currently uses inline `style="..."` attributes with hardcoded `rgba(255,255,255,...)` values (dark-on-dark, styles.css shows this block assumed a dark section background that no longer applies after Task 1's flat light palette). Move these to a new `.zero-click-table` class in `styles.css` using `var(--border)`/`var(--text-primary)`/`var(--bg-secondary)` instead, and replace the inline `style=` attributes in `Faq.astro`'s table markup with `class="zero-click-table"` (table) and `class="zero-click-table-title"` (the `<h3>`).

- [ ] **Step 3: Verify**

Run: `npx astro build`
Expected: succeeds.

Open dev server: click a FAQ question, confirm only one item expands at a time (accordion behavior from `setupFaqAccordion()`), confirm the zero-click summary table is legible (not white-on-white — this is the actual regression risk from Step 2, since the table's colors were tuned for a dark background that Task 1 removed).

- [ ] **Step 4: Commit**

```bash
git add src/components/Faq.astro src/styles/styles.css
git commit -m "style: restyle Faq section and zero-click table for light background"
```

---

## Task 14: Remove CtaFinal

**Files:**
- Delete: `src/components/CtaFinal.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: Task 3's `.footer-cta-banner` must already exist (do this task after Task 3).

- [ ] **Step 1: Remove the import and usage**

In `src/pages/index.astro`, delete the line `import CtaFinal from '../components/CtaFinal.astro';` and delete the `<CtaFinal />` line (currently right after `<Faq />`).

- [ ] **Step 2: Delete the file**

```bash
git rm src/components/CtaFinal.astro
```

- [ ] **Step 3: Verify**

Run: `npx astro build`
Expected: succeeds, no missing-import error.

Run: `grep -rn "CtaFinal" src/`
Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove CtaFinal (redundant with 6 existing WhatsApp CTAs + new footer banner)"
```

---

## Task 15: Final integration QA

**Files:** none modified — verification only. If any check fails, fix in the relevant existing file and re-run this task's checks before committing.

- [ ] **Step 1: Full build**

Run: `npx astro build`
Expected: succeeds, generates `dist/index.html` plus all model/bairro/service/legal pages unchanged in count.

- [ ] **Step 2: Section count + anchor integrity**

Run: `grep -o '<section[^>]*id="[^"]*"' dist/index.html | sort`
Expected: exactly these 7 ids present once each: `inicio`, `transparencia`, `diferenciais`, `telas-precos`, `comparativo-telas`, `sobre`, `faq` (plus `como-funciona`, `diagnostico-wizard` if those sections kept their ids — confirm against what Tasks 6/11 actually shipped).

Run: `grep -o 'href="#[a-z-]*"' dist/index.html | sort -u`
Expected: every `href="#xxx"` printed here has a matching `id="xxx"` in the previous command's output (cross-check by eye — this catches any dangling anchor left over from the section merges/removal, e.g. the pre-existing dead `#baterias-precos` link in `Footer.astro`; fix it while you're here since it's now trivial to spot: point it at `#telas-precos` instead, same section handles both tabs).

- [ ] **Step 3: JSON-LD / visible-text parity**

Run: `grep -c "FAQPage\|ElectronicsStore\|LocalBusiness" dist/index.html`
Expected: same schema types present as before this plan started (3).

Manually diff `faqItems` text in `Faq.astro` against the rendered `<script type="application/ld+json">` block in `dist/index.html` — confirm every question/answer pair still matches verbatim (Task 13 didn't touch content, only styling, so this should be a no-op confirmation).

- [ ] **Step 4: No dead-code leftovers**

Run: `grep -rn "primary-glow\|accent-blue\|shadow-green\|trust-shield\|about-highlight\|timeline-wrapper\|step-number-glow\|ReelsShowcase\|GoogleReviews\|CtaFinal" src/`
Expected: zero matches.

- [ ] **Step 5: Responsive + WhatsApp CTA smoke test**

Run: `npm run dev`, open in a browser, and manually check:
- 375px, 768px, 1024px, 1440px, 1920px — no horizontal scroll anywhere on the page.
- Every visible "Agendar"/WhatsApp button opens `wa.me/<number>` with a populated `text=` param (spot-check Hero, Diferenciais card 3's guide link, PricingSelector "AGENDAR", DiagnosticForm submit, Sobre CTA, Faq CTA, Footer banner CTA).
- Header nav links (`Diferenciais`, `Tabela de Preços`, `Transparência`, `Sobre`) each scroll to the right section.
- BottomNav (mobile viewport) does the same for its 4 items.
- Model search in PricingSelector still returns correct prices for at least 2 different models (e.g. "15 Pro Max" and "13").

- [ ] **Step 6: Commit (only if Step 2's dead-link fix or any other small correction was made)**

```bash
git add -A
git commit -m "fix: correct dead #baterias-precos footer anchor found during final QA"
```

---

## Self-Review Notes (from the plan author)

- **Spec coverage:** every item in `docs/superpowers/specs/2026-07-27-redesign-home-premium-design.md` maps to a task — tokens (Task 1), Header/Footer/BottomNav/FloatingWhatsapp chrome (Tasks 2-4), Hero (Task 5), the 14→12 IA consolidation (Tasks 6-8, 14), the "restyle only" components (Tasks 9-11, 13), Sobre trim (Task 12), verification against the spec's 7 success criteria (Task 15).
- **Type/selector consistency:** cross-checked every id/class named in the Global Constraints section against actual `main.js` queries (`document.getElementById`/`querySelectorAll` calls) read in full during planning — not assumed.
- **Known follow-ups not in this plan** (flagged, not silently dropped): the pre-existing dead `#baterias-precos` footer link is called out in Task 15 rather than fixed blind earlier, since it was only discovered during the anchor-integrity check design, not observed directly in the source read. Motion/GSAP/Three.js/shadcn-style component variants/propagation to model+bairro pages/`frontend-design-review` remain explicitly out of scope per the spec.
