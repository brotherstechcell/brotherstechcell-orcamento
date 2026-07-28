# Motion — Microinterações (Fase 6) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add counter animation to the 4 TrustStatsBar numbers, a staggered word-reveal to the Hero headline, and site-wide page transitions — without breaking any existing interactive JS (price selector, FAQ accordion, mobile menu, WhatsApp links) that currently only initializes on `DOMContentLoaded`.

**Architecture:** A new `src/scripts/motion.js` module (parallel to the existing `main.js`) owns the two new animations, using the `motion` npm package (already installed, unused until now) for the counter and word-reveal. Astro's `<ClientRouter />` (from `astro:transitions`) is added to the shared `BaseLayout.astro` for page transitions; because that makes internal navigations client-side (no full page reload), `main.js`'s existing `DOMContentLoaded` listener is migrated to `astro:page-load` — the Astro-documented drop-in replacement that fires on both the initial load and every subsequent transition — so none of the existing interactive features silently stop working after the first navigation.

**Tech Stack:** Astro 7 (`astro:transitions` — `<ClientRouter />`), `motion` npm package (`animate`, `inView`, `stagger`, `splitText`), vanilla JS (no new dependencies beyond what's already installed).

## Global Constraints

- Ripple effects are explicitly out of scope (spec: doesn't match the established Apple/Stripe/Linear visual language — a Material Design convention).
- Every new animation must check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and skip straight to the final visible state when true. Page-transition reduced-motion handling is automatic (built into `<ClientRouter />`, confirmed via Astro's own docs) — no code needed for that part specifically.
- No `transition:persist` on any element in this plan — the default (full DOM swap per navigation, no persisted elements) is what makes the `astro:page-load` migration sufficient on its own; persisting elements would require additional listener-cleanup logic that is explicitly out of scope here.
- Do not touch GSAP or Three.js in this plan — reserved for their own future phases per the spec.
- This repo has no test framework. Verification is `npx astro build` succeeding (298 pages, unchanged count) plus manual browser checks. This is the established convention for this project, not a gap.

---

## Task 1: Counter animation + Hero text reveal

**Files:**
- Create: `src/scripts/motion.js`
- Modify: `src/components/TrustStatsBar.astro` (add `data-count-*` attributes to the 4 stat numbers)
- Modify: `src/components/Hero.astro:12` (remove `scroll-reveal scroll-left delay-1` from the H1's class list)
- Modify: `src/styles/styles.css` (`.hero-title` rule — add `opacity: 0;`)
- Modify: `src/pages/index.astro` (add the `motion.js` script tag)

**Interfaces:**
- Consumes: `motion` package exports `animate`, `inView`, `stagger`, `splitText` (all confirmed available in the installed `motion` package's vanilla JS API).
- Produces: `motion.js` self-initializes via its own `astro:page-load` listener — no other file calls into it directly. Task 2 must NOT also attach a competing `astro:page-load` listener for the same concerns; Task 2's job is only `main.js`'s existing listener + `BaseLayout.astro`.

- [ ] **Step 1: Create `src/scripts/motion.js`**

```js
import { animate, inView, stagger, splitText } from "motion";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function formatCount(value, format) {
  const rounded = Math.round(value);
  return format === "thousands" ? rounded.toLocaleString("pt-BR") : String(rounded);
}

function initCounterAnimation() {
  const numbers = document.querySelectorAll(".trust-stat-number[data-count-to]");
  if (!numbers.length) return;

  numbers.forEach((el) => {
    const to = Number(el.getAttribute("data-count-to"));
    const prefix = el.getAttribute("data-count-prefix") || "";
    const suffix = el.getAttribute("data-count-suffix") || "";
    const format = el.getAttribute("data-count-format") || "plain";

    if (prefersReducedMotion()) {
      el.textContent = `${prefix}${formatCount(to, format)}${suffix}`;
      return;
    }

    el.textContent = `${prefix}0${suffix}`;

    const stop = inView(el, () => {
      animate(0, to, {
        duration: 1.2,
        onUpdate: (latest) => {
          el.textContent = `${prefix}${formatCount(latest, format)}${suffix}`;
        },
      });
      stop();
    }, { amount: 0.6 });
  });
}

function initHeroTextReveal() {
  const heroTitle = document.querySelector(".hero-title");
  if (!heroTitle) return;

  if (prefersReducedMotion()) {
    heroTitle.style.opacity = "1";
    return;
  }

  const { words } = splitText(".hero-title");
  animate(words, { opacity: [0, 1], y: [12, 0] }, { duration: 0.5, delay: stagger(0.04) });
}

document.addEventListener("astro:page-load", () => {
  initCounterAnimation();
  initHeroTextReveal();
});
```

Notes for the implementer:
- `inView`'s callback fires every time the element enters the viewport unless you cancel it — `stop()` (the function `inView` returns) is called inside the callback itself so the count only ever runs once per page load, not every time the user scrolls the stat back into view.
- `.hero-title` only exists on the home page (`Hero.astro` is not used on model/service/bairro pages) — `initHeroTextReveal`'s `if (!heroTitle) return;` guard makes this a safe no-op everywhere else.
- `initCounterAnimation`'s `if (!numbers.length) return;` guard makes it a safe no-op on any page without a `TrustStatsBar` (currently only the home page has one).

- [ ] **Step 2: Add `data-count-*` attributes to the 4 stat numbers in `TrustStatsBar.astro`**

Replace each of the 4 `<span class="trust-stat-number">...</span>` lines:

```astro
            <span class="trust-stat-number" data-count-to="2500" data-count-format="thousands" data-count-suffix="+">2.500+</span>
```
```astro
            <span class="trust-stat-number" data-count-to="100" data-count-suffix="%">100%</span>
```
```astro
            <span class="trust-stat-number" data-count-to="30" data-count-prefix="~" data-count-suffix=" min">~30 min</span>
```
```astro
            <span class="trust-stat-number" data-count-to="9" data-count-suffix="+ Anos">9+ Anos</span>
```

The static text content is left exactly as-is (unchanged) — it's both the correct final value the counter animates to and the correct fallback if JavaScript never runs at all.

- [ ] **Step 3: Prevent double-animation on the Hero headline**

`Hero.astro:12` currently reads:
```astro
            <h1 class="hero-title type-h2 scroll-reveal scroll-left delay-1">
```
Change to:
```astro
            <h1 class="hero-title type-h2">
```
(Removes the generic `.scroll-reveal` container-fade classes — the new word-by-word reveal replaces that entrance animation specifically for this element. The sibling elements — `.hero-pill`, `.hero-description`, `.hero-btn-container` — keep their existing `scroll-reveal` classes unchanged.)

In `src/styles/styles.css`, find the `.hero-title` rule (property list includes `font-size: var(--text-64);`) and add one property:
```css
.hero-title {
  font-size: var(--text-64);
  margin-bottom: var(--space-3);
  line-height: 1.1;
  color: var(--text-primary);
  font-weight: 800;
  letter-spacing: -0.02em;
  opacity: 0;
}
```
(Only the `opacity: 0;` line is new — everything else in the rule is unchanged.) This starts the H1 invisible so `initHeroTextReveal`'s `animate(words, { opacity: [0, 1], ... })` has a clean entrance instead of a flash-of-visible-text-then-reset. If JavaScript never runs, the H1 stays invisible — this matches the existing, already-accepted site convention for every other `.scroll-reveal` element (none of which have a `<noscript>` fallback either), so it's consistent with current behavior, not a new risk category.

- [ ] **Step 4: Wire the script into `index.astro`**

`src/pages/index.astro` currently ends with:
```astro
  <script src="../scripts/prices.js"></script>
  <script src="../scripts/main.js"></script>
</BaseLayout>
```
Add the new script tag after `main.js`:
```astro
  <script src="../scripts/prices.js"></script>
  <script src="../scripts/main.js"></script>
  <script src="../scripts/motion.js"></script>
</BaseLayout>
```

- [ ] **Step 5: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages (unchanged count).

Run: `grep -c "data-count-to" src/components/TrustStatsBar.astro`
Expected: `4`

Run: `grep -n "scroll-reveal" src/components/Hero.astro`
Expected: 3 matches (`.hero-pill`, `.hero-description`, `.hero-btn-container`) — NOT the H1 line.

Start the dev server (`npm run dev`) and open the home page. Confirm in the browser:
- The 4 stat numbers start at their zero/prefix state and count up to their final value shortly after the stats bar scrolls into view.
- The Hero H1 reveals word-by-word on page load (not instantly, not via the old fade-slide-in).
- No layout shift or flash-of-fully-visible-then-reset on the H1.

- [ ] **Step 6: Commit**

```bash
git add src/scripts/motion.js src/components/TrustStatsBar.astro src/components/Hero.astro src/styles/styles.css src/pages/index.astro
git commit -m "feat: add counter animation to TrustStatsBar and word-reveal to Hero headline"
```

---

## Task 2: Site-wide page transitions

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (add `<ClientRouter />`)
- Modify: `src/scripts/main.js:9` (change the initialization event)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: nothing consumed by Task 3 beyond "the site still works" — Task 3 is verification only.

This task must land as one atomic change — shipping `<ClientRouter />` without the `main.js` migration would silently break the price selector, FAQ accordion, mobile menu, and WhatsApp link rewriting on every page after the user's first click to a new page (confirmed via Astro's own documentation: "When view transitions are enabled, code that normally runs on `DOMContentLoaded` should be updated to execute on [`astro:page-load`] instead").

- [ ] **Step 1: Add `<ClientRouter />` to `BaseLayout.astro`**

Add the import in the frontmatter (top of the file, alongside the existing `import '../styles/styles.css';`):
```astro
---
import '../styles/styles.css';
import { ClientRouter } from "astro:transitions";
```
(Rest of the frontmatter — `interface Props`, `const { title, ... }`, `siteUrl`, `baseLocalBusinessSchema` — is unchanged.)

Add the component as the last thing in `<head>`, right after the `extraJsonLd` map (currently the last lines before `</head>`):
```astro
  {extraJsonLd.map((json) => (
    <script type="application/ld+json" set:html={json} />
  ))}

  <ClientRouter />
</head>
```

Do not add `transition:animate` to any element and do not add `transition:persist` to `<Header />`, `<Footer />`, or anything else — the default crossfade with a full DOM swap per navigation is the intended scope for this task (see Global Constraints).

- [ ] **Step 2: Migrate `main.js`'s initialization event**

`src/scripts/main.js:9` currently reads:
```js
document.addEventListener("DOMContentLoaded", async () => {
```
Change to:
```js
document.addEventListener("astro:page-load", async () => {
```
This is the only line that changes in the entire file — every function body inside the handler (`initPricingSelector`, `updateWhatsAppLinks`, `setupScrollEffects`, `setupVideoCarousel`, `setupHeroScrollVideo`, `setupScrollReveal`, `setupFaqAccordion`, `setupReelsAutoplay`, `setupDiagnosticWizard`, and the pricing-sync `fetch` logic) stays exactly as it is.

- [ ] **Step 3: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages (unchanged count).

Run: `grep -n "DOMContentLoaded" src/scripts/main.js`
Expected: no matches.

Run: `grep -n "astro:page-load" src/scripts/main.js`
Expected: 1 match, on the line that used to say `DOMContentLoaded`.

Start the dev server (`npm run dev`). In the browser:
1. Load the home page directly (full page load). Confirm the price selector works (search a model, prices update) and the FAQ accordion opens/closes.
2. Click an internal link that navigates to a different page (e.g. a footer link to `/servicos/troca-de-tela`, or the logo link back to `/`). Confirm the URL changes and the new page's content is visible (this proves `<ClientRouter />` is intercepting navigation).
3. **On that second page** (reached via client-side navigation, not a fresh load), confirm the interactive features specific to that page still work — e.g. if you navigated to a service page, its FAQ accordion still opens/closes; if you navigated to the home page, the price selector and FAQ still work. This is the step that would fail if the `astro:page-load` migration were missing or wrong.
4. Confirm the mobile menu toggle (`#mobile-menu-toggle`) still opens/closes the nav after a client-side navigation, not just on first load.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro src/scripts/main.js
git commit -m "feat: enable Astro page transitions, migrate main.js init to astro:page-load"
```

---

## Task 3: Final integration QA

**Files:** none modified — verification only. If a check fails, fix it in the relevant file from Task 1 or 2 and re-run this task's checks before committing.

- [ ] **Step 1: Full build**

Run: `npx astro build`
Expected: succeeds, 298 pages — same count as before this plan.

- [ ] **Step 2: Reduced-motion check**

In the browser dev tools, enable "prefers-reduced-motion: reduce" (Chrome DevTools → Rendering tab → "Emulate CSS media feature prefers-reduced-motion" → "reduce"). Reload the home page. Confirm:
- The Hero H1 is immediately visible at full opacity (no word-by-word reveal, no invisible/stuck-at-zero state).
- The 4 stat numbers show their final values immediately (2.500+, 100%, ~30 min, 9+ Anos), not a count-up.
- Page transitions between links feel instant / non-animated (Astro's `<ClientRouter />` handles this automatically — confirm it's actually off, not just fast).

- [ ] **Step 3: Cross-page-type smoke test**

Navigate (via real link clicks, not URL bar) through at least: Home → a `/servicos/{slug}` page → a `/iphone-{model}/{service}` page → an `/atendimento/{bairro}` page → back to Home. Confirm:
- No console errors at any point.
- Each page's own interactive elements work after arriving via client-side navigation (FAQ accordions on service/bairro pages use the same `setupFaqAccordion()` from `main.js` — this is the highest-risk regression point, since those pages were never touched by Task 1 or 2 directly).
- The floating WhatsApp button and bottom nav (mobile viewport) still populate their `href` correctly on every page (`updateWhatsAppLinks()` must still be running via the migrated event).

- [ ] **Step 4: No dead-code / leftover check**

Run: `grep -rn "DOMContentLoaded" src/`
Expected: no matches anywhere in `src/` (confirms no other script still uses the old event that would now silently stop working after the first navigation).

- [ ] **Step 5: Commit (only if Step 2 or 3 surfaced a fix)**

```bash
git add -A
git commit -m "fix: <describe whatever was found during final motion QA>"
```

## Self-Review Notes (from the plan author)

- **Spec coverage:** counter animation (Task 1), Hero text reveal (Task 1), page transitions (Task 2), `prefers-reduced-motion` handling for both new animations (Task 1's code) and confirmation that `<ClientRouter />` handles its own reduced-motion automatically (Task 3 Step 2 verifies this rather than assuming it), the mandatory `main.js` event migration (Task 2) — all covered.
- **API surface used** (`animate`, `inView`, `stagger`, `splitText` from `motion`; `ClientRouter` from `astro:transitions`; the `astro:page-load` event) was verified against current documentation before writing this plan, not assumed from training data — Astro 7 and the installed `motion` version both confirmed to support every call used here.
- **Type/consistency check:** `motion.js` is the only file that reads `.trust-stat-number[data-count-to]` and `.hero-title` — the attribute names and class names it depends on (Task 1 Steps 2-3) match exactly what Task 1 Step 1's code queries for. `main.js`'s function names are unchanged by Task 2, so nothing downstream of them needed updating.
