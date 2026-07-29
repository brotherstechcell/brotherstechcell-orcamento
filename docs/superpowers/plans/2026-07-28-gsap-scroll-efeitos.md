# GSAP — Efeitos de Scroll Premium (Fase 7) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two GSAP-driven effects to the homepage — a scroll-scrubbed Hero video (desktop only) and a fixed price/CTA bar that appears once the user scrolls past the pricing section (desktop only) — without breaking the existing Hero video autoplay (mobile), the existing price-selector/FAQ/WhatsApp interactivity, or accumulating `ScrollTrigger`s across `<ClientRouter />` page transitions the way Fase 6 (Motion) initially accumulated event listeners before its final-review fix.

**Architecture:** A new `src/scripts/gsap-effects.js` module (parallel to `main.js` and `motion.js`), using `gsap.matchMedia()` — **not** `ScrollTrigger.matchMedia()`, which does not exist in the installed version — to scope both effects to a single condition (desktop width AND no reduced-motion preference), with the `MatchMedia` object's own `.revert()` called at the start of every `astro:page-load` to prevent `ScrollTrigger` accumulation across client-side navigations. `src/scripts/main.js` gets one small addition (a guard in `setupHeroScrollVideo()` so it cedes control of the video element when GSAP owns it) and one small addition (syncing the new sticky bar's model name whenever `renderSelectorResults()` runs).

**Tech Stack:** GSAP 3.15.0 + its `ScrollTrigger` plugin (both already installed, unused until this plan), vanilla JS, Astro `astro:page-load` lifecycle (established in Fase 6).

## Global Constraints

- The correct API is `gsap.matchMedia()` (returns a `MatchMedia` object with `.add(mediaQueryString, callback)`), confirmed against `node_modules/gsap/types/gsap-core.d.ts` in this repo. `ScrollTrigger.matchMedia` does not exist in `gsap@3.15.0` — do not use it, even if you recall it from other GSAP versions/tutorials.
- Both new effects (Hero scroll-scrub, sticky price bar) are gated behind a single combined media query: `"(min-width: 1024px) and (prefers-reduced-motion: no-preference)"`. Below 1024px or with reduced-motion on, neither effect runs — existing behavior (Hero autoplay-loop, no sticky bar) is completely unchanged.
- `setupHeroScrollVideo(signal)` in `src/scripts/main.js` (currently lines 861-908) is untouched in its internals — only a new early-return guard is added at its top. Every other line in that function, and the rest of `main.js`, stays byte-identical.
- The sticky price bar shows the selected model name and a WhatsApp CTA only — it does not display a price. Do not add price-extraction logic to avoid a second source of truth for pricing (the price is already rendered by `renderSelectorResults()`).
- `MatchMedia.revert()` is called at the start of every `astro:page-load` firing (mirroring Fase 6's `pageAbortController?.abort()` pattern) so `ScrollTrigger`s don't accumulate across client-side navigations — this is not optional, it's the exact bug class Fase 6's final review found and fixed for listeners; GSAP's `ScrollTrigger` has the identical risk.
- This repo has no test framework. Verification is `npx astro build` succeeding (298 pages) plus manual/Playwright browser checks — the established convention for this project.

---

## Task 1: Hero video scroll-scrub

**Files:**
- Create: `src/scripts/gsap-effects.js`
- Modify: `src/scripts/main.js:861` (`setupHeroScrollVideo` — add a guard at the top of the function)
- Modify: `src/pages/index.astro:118` (add the new script tag after `motion.js`)

**Interfaces:**
- Consumes: nothing from other new-plan files (this is the first task).
- Produces: `gsap-effects.js`'s top-level `astro:page-load` listener, `mm` module variable, and `initHeroScrollScrub()` function — Task 2 adds a second function call (`initStickyPriceBar()`) inside the SAME `mm.add(...)` callback this task creates, so Task 2's brief will reference this exact structure. Do not wrap the `mm.add(...)` callback's body in anything Task 2 can't easily extend (keep it as a plain function body with sequential statements).

- [ ] **Step 1: Create `src/scripts/gsap-effects.js`**

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let mm;

document.addEventListener("astro:page-load", () => {
  mm?.revert();
  mm = gsap.matchMedia();

  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    initHeroScrollScrub();
  });
});

function initHeroScrollScrub() {
  const video = document.getElementById("hero-scroll-video");
  const heroSection = document.getElementById("inicio");
  if (!video || !heroSection) return;

  video.pause();
  video.removeAttribute("loop");

  const setScrub = () => {
    ScrollTrigger.create({
      trigger: heroSection,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        if (video.duration) {
          video.currentTime = self.progress * video.duration;
        }
      },
    });
  };

  if (video.readyState >= 1) {
    setScrub();
  } else {
    video.addEventListener("loadedmetadata", setScrub, { once: true });
  }
}
```
(`video.readyState >= 1` is `HAVE_METADATA` — `video.duration` is already known at that point. The video has `preload="auto"` in `Hero.astro`, so metadata is very likely already loaded by the time this runs; the `loadedmetadata` listener is the fallback for the rare case it isn't yet.)

- [ ] **Step 2: Add the ownership guard to `setupHeroScrollVideo` in `src/scripts/main.js`**

The function currently starts (line 861):
```js
function setupHeroScrollVideo(signal) {
  const video = document.getElementById("hero-scroll-video");
  const heroSection = document.getElementById("inicio");
  if (!video || !heroSection) return;

  const tryPlay = () => {
```
Add a new guard clause right after the existing `if (!video || !heroSection) return;` line, before `const tryPlay = () => {`:
```js
function setupHeroScrollVideo(signal) {
  const video = document.getElementById("hero-scroll-video");
  const heroSection = document.getElementById("inicio");
  if (!video || !heroSection) return;

  const isDesktopScrollScrub =
    window.matchMedia("(min-width: 1024px)").matches &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  if (isDesktopScrollScrub) return;

  const tryPlay = () => {
```
Every other line in the function (the `tryPlay` closure, the load-guard comment block, the `if (video.error || ...)` check, `tryPlay()` call, the `IntersectionObserver`, `signal.addEventListener("abort", ...)`) stays exactly as it is today — this task adds exactly 5 new lines (the guard) and touches nothing else in this file.

- [ ] **Step 3: Wire the script tag into `index.astro`**

`src/pages/index.astro` currently ends with (lines 116-118):
```astro
  <script src="../scripts/prices.js"></script>
  <script src="../scripts/main.js"></script>
  <script src="../scripts/motion.js"></script>
</BaseLayout>
```
Add the new script tag after `motion.js`:
```astro
  <script src="../scripts/prices.js"></script>
  <script src="../scripts/main.js"></script>
  <script src="../scripts/motion.js"></script>
  <script src="../scripts/gsap-effects.js"></script>
</BaseLayout>
```

- [ ] **Step 4: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages (unchanged count).

Run: `grep -n "ScrollTrigger.matchMedia" src/scripts/gsap-effects.js`
Expected: no matches (confirms the correct `gsap.matchMedia()` API is used, not the nonexistent `ScrollTrigger.matchMedia`).

Start the dev server (`npm run dev`) and open the home page in a browser at a desktop width (≥1024px):
- Confirm the Hero video does NOT autoplay/loop on its own — it should sit at frame 0 (or wherever `currentTime` lands) until you scroll.
- Scroll down through the Hero section slowly and confirm the video's `currentTime` advances roughly in sync with scroll position (you can inspect `document.getElementById('hero-scroll-video').currentTime` in the console while scrolling).
- Scroll back up and confirm the video plays in reverse (currentTime decreases).

Resize the browser to a mobile width (<1024px) or use device emulation, reload the page, and confirm the Hero video autoplays and loops exactly as it did before this task (unchanged behavior).

Enable "prefers-reduced-motion: reduce" in DevTools, reload at a desktop width, and confirm the Hero video falls back to autoplay/loop (not scroll-scrub).

- [ ] **Step 5: Commit**

```bash
git add src/scripts/gsap-effects.js src/scripts/main.js src/pages/index.astro
git commit -m "feat: add GSAP scroll-scrub to Hero video on desktop"
```

---

## Task 2: Sticky price/CTA bar

**Files:**
- Create: `src/components/StickyPriceBar.astro`
- Modify: `src/pages/index.astro` (import + render `<StickyPriceBar />`)
- Modify: `src/styles/styles.css` (new `.sticky-price-bar*` rules)
- Modify: `src/scripts/main.js` (sync model name + WhatsApp link in `renderSelectorResults()`)
- Modify: `src/scripts/gsap-effects.js` (add `initStickyPriceBar()`, call it from the same `mm.add(...)` callback Task 1 created)

**Interfaces:**
- Consumes: Task 1's `mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => { initHeroScrollScrub(); })` callback in `gsap-effects.js` — this task adds a second function call inside that same callback body, it does not create a new `mm.add(...)` block.
- Produces: nothing consumed by Task 3 (verification only).

- [ ] **Step 1: Create `src/components/StickyPriceBar.astro`**

```astro
    <div class="sticky-price-bar" id="sticky-price-bar">
      <div class="container sticky-price-bar-inner">
        <span class="sticky-price-bar-model">iPhone <strong id="sticky-price-bar-model-name">—</strong></span>
        <a href="#" class="btn-glow btn-whatsapp-global sticky-price-bar-cta" id="sticky-price-bar-cta">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span>AGENDAR AGORA</span>
        </a>
      </div>
    </div>
```
No `data-message` attribute on the CTA link — its `href` is set dynamically by `main.js` (Step 3 below), the same pattern already used by `DiagnosticForm`'s submit button.

- [ ] **Step 2: Add the CSS block to `src/styles/styles.css`**

Add this new block (anywhere after the `:root` token block, e.g. near the end of the file alongside other component-specific blocks):
```css
/* ============================================================
   STICKY PRICE BAR (desktop only)
   ============================================================ */

.sticky-price-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 997;
  background: var(--card-bg);
  border-top: 1px solid var(--border);
  box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.08);
  padding: var(--space-2) 0;
  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.sticky-price-bar.visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.sticky-price-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.sticky-price-bar-model {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

@media (prefers-reduced-motion: reduce) {
  .sticky-price-bar {
    transition-duration: 0.01ms;
  }
}

@media (max-width: 1023px) {
  .sticky-price-bar {
    display: none;
  }
}
```
The `@media (max-width: 1023px) { display: none; }` rule is the belt-and-suspenders guarantee the bar never shows on mobile — `initStickyPriceBar()` (Step 5) never even runs there, but this makes the intent explicit in CSS too, and avoids stacking a second fixed bottom bar on top of `BottomNav`'s own WhatsApp CTA item.

- [ ] **Step 3: Sync the model name and WhatsApp link in `renderSelectorResults()` in `src/scripts/main.js`**

The function currently ends with (around lines 690-692):
```js
  resultsGrid.appendChild(screenCard);
  resultsGrid.appendChild(batteryCard);
}
```
Add the sync logic right after `resultsGrid.appendChild(batteryCard);`, still inside the function, before the closing `}`:
```js
  resultsGrid.appendChild(screenCard);
  resultsGrid.appendChild(batteryCard);

  const stickyModelName = document.getElementById("sticky-price-bar-model-name");
  const stickyCta = document.getElementById("sticky-price-bar-cta");
  if (stickyModelName) stickyModelName.textContent = modelName;
  if (stickyCta) {
    const message = encodeURIComponent(`Olá! Quero saber o preço da troca de tela/bateria do meu iPhone ${modelName}.`);
    stickyCta.setAttribute("href", `https://wa.me/${CONFIG.contact.phoneRaw}?text=${message}`);
  }
}
```
`renderSelectorResults(modelName)` already receives `modelName` as its parameter (used throughout the function for the screen/battery card titles) — this reuses that same value, no new parameter needed. Both `stickyModelName`/`stickyCta` lookups are null-guarded because `renderSelectorResults` is called on every page that has a `#selector-results-grid` element (i.e., only the home page has `StickyPriceBar` in the DOM at all — this function itself is only ever invoked from `PricingSelector`-related code, which only exists on the home page, but the guards cost nothing and make the function safe regardless).

- [ ] **Step 4: Render `<StickyPriceBar />` in `src/pages/index.astro`**

Add the import alongside the other component imports (after `import BottomNav from '../components/BottomNav.astro';`):
```astro
import BottomNav from '../components/BottomNav.astro';
import StickyPriceBar from '../components/StickyPriceBar.astro';
```
Add the component render after `<BottomNav />` (before the script tags):
```astro
  <Footer />
  <FloatingWhatsapp />
  <BottomNav />
  <StickyPriceBar />
  <script src="../scripts/prices.js"></script>
```

- [ ] **Step 5: Add `initStickyPriceBar()` to `src/scripts/gsap-effects.js`**

Add the new function anywhere after `initHeroScrollScrub()`:
```js
function initStickyPriceBar() {
  const bar = document.getElementById("sticky-price-bar");
  const pricingSection = document.getElementById("telas-precos");
  const footer = document.querySelector(".footer-main");
  if (!bar || !pricingSection || !footer) return;

  ScrollTrigger.create({
    trigger: pricingSection,
    start: "bottom top",
    endTrigger: footer,
    end: "top bottom",
    toggleClass: { targets: bar, className: "visible" },
  });
}
```
Then update the `mm.add(...)` callback from Task 1 to call both functions:
```js
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    initHeroScrollScrub();
    initStickyPriceBar();
  });
```

- [ ] **Step 6: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages.

Run: `grep -c "sticky-price-bar-model-name\|sticky-price-bar-cta" src/scripts/main.js`
Expected: `2` (one `getElementById` call for each id).

Start the dev server, open the home page at a desktop width (≥1024px):
- Confirm the sticky bar is NOT visible near the top of the page.
- Type a different model into the price search box (e.g. "13 Pro Max") and confirm the results update as before — this triggers `renderSelectorResults()`.
- Scroll down past the `PricingSelector` section (`#telas-precos`) and confirm the sticky bar slides up from the bottom, showing the model you just selected.
- Continue scrolling to the Footer and confirm the bar disappears again before/as the Footer comes into view (no overlap with the Footer's own CTA banner).
- Scroll back up above `#telas-precos` and confirm the bar disappears.
- Click the sticky bar's "AGENDAR AGORA" button (while it's visible) and confirm it opens WhatsApp with a message mentioning the currently-selected model.

Resize to mobile width (<1024px), reload, scroll through the whole page, and confirm the sticky bar never appears at any point (CSS `display: none` takes effect, and `initStickyPriceBar()` never runs since the media query doesn't match).

- [ ] **Step 7: Commit**

```bash
git add src/components/StickyPriceBar.astro src/pages/index.astro src/styles/styles.css src/scripts/main.js src/scripts/gsap-effects.js
git commit -m "feat: add desktop sticky price/CTA bar with GSAP ScrollTrigger"
```

---

## Task 3: Final integration QA

**Files:** none modified — verification only. If a check fails, fix it in the relevant file from Task 1 or 2 and re-run this task's checks before committing.

- [ ] **Step 1: Full build**

Run: `npx astro build`
Expected: succeeds, 298 pages — same count as before this plan.

- [ ] **Step 2: `ScrollTrigger` accumulation check across page transitions**

Start the dev server, open the home page at a desktop width (≥1024px). Using the browser console (or Playwright), click through several internal navigations and back to home (e.g. Home → a `/servicos/{slug}` page → Home, repeated 3-4 times via real link clicks, not URL bar). After the loop, run in the console:
```js
console.log(ScrollTrigger.getAll().length)
```
Expected: a small, stable number (roughly 2 — one for the Hero scroll-scrub, one for the sticky bar — NOT growing with each navigation). If this number scales with the number of navigations performed, the `mm?.revert()` call at the top of the `astro:page-load` handler in `gsap-effects.js` isn't working as intended — investigate and fix before proceeding.

- [ ] **Step 3: Reduced-motion check**

Enable "prefers-reduced-motion: reduce" in DevTools. Reload the home page at a desktop width. Confirm: Hero video autoplays/loops (not scroll-scrub), sticky bar never appears no matter how far you scroll.

- [ ] **Step 4: Cross-page-type smoke test**

Navigate through Home → a `/servicos/{slug}` page → an `/iphone-{model}/{service}` page → an `/atendimento/{bairro}` page → back to Home (via real link clicks). Confirm: no console errors at any point, the price selector and FAQ accordion still work on every page that has them, the Hero video and sticky bar still work correctly after arriving at Home via client-side navigation (not just a fresh load) — this is the same category of regression Fase 6's Task 3 found for `<video>` elements, re-verify it isn't reintroduced here.

- [ ] **Step 5: Mobile regression check**

At a mobile width (<1024px), repeat the cross-page-type smoke test. Confirm the Hero video autoplay/loop and all existing interactivity work exactly as they did before this plan — zero visible change on mobile.

- [ ] **Step 6: Commit (only if Steps 2-5 surfaced a fix)**

```bash
git add -A
git commit -m "fix: <describe whatever was found during final GSAP QA>"
```

## Self-Review Notes (from the plan author)

- **Spec coverage:** Hero scroll-scrub with desktop/mobile/reduced-motion branching (Task 1), sticky price bar scoped to the same desktop-and-not-reduced-motion condition with mobile `display: none` as defense-in-depth (Task 2), `ScrollTrigger` cleanup across page transitions (Task 1's `mm?.revert()`, verified explicitly in Task 3 Step 2) — all covered.
- **API verified, not assumed:** `gsap.matchMedia()` (not `ScrollTrigger.matchMedia()`) was checked directly against `node_modules/gsap/types/gsap-core.d.ts` in this repo before this plan was written — the exact API mistake category that cost a fix-round in the Motion plan (`motion-plus`'s `splitText`) was checked for here specifically.
- **Type/consistency check:** `initHeroScrollScrub()` and `initStickyPriceBar()` (Task 1 and Task 2) are both called from the same `mm.add(...)` callback in `gsap-effects.js` — Task 2's Step 5 shows the exact before/after of that callback so there's no ambiguity about where the second function call goes.
