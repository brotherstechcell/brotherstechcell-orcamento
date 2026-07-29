# Fase 9 — Correções da Revisão de Design (frontend-design-review) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 40 objective findings from the Fase 9 audit (`​.superpowers/sdd/2026-07-29-frontend-design-review/consolidated-findings.md`) — the mobile hamburger menu bug (broken site-wide), WCAG 2.2 AA contrast/keyboard/ARIA gaps, a horizontal-overflow bug, and confirmed Lighthouse performance opportunities — across the Home page and the shared chrome (Header/Footer/BottomNav/FloatingWhatsapp).

**Architecture:** Ten independently reviewable tasks, grouped by root cause rather than by file, so each task has a single clear "is this fixed?" test. The headline fix (Task 1) removes `setupMobileMenuToggle()`'s dependency on the pricing dropdown, which is the root cause of the menu being broken on every page. Color-contrast, animation, and CSS-only tasks (2, 3, 8) touch only `styles.css`. Interaction tasks (4, 5, 6) add real keyboard/ARIA support to custom controls. Task 7 is a large but purely mechanical `aria-hidden`/label-parity sweep. Tasks 9-10 are the two Lighthouse-driven performance fixes plus the one user-approved new UI element (Hero pause button).

**Tech Stack:** Astro 7 components/pages, vanilla JS (`src/scripts/main.js`, `src/scripts/gsap-effects.js`), CSS custom properties (`src/styles/styles.css`), Astro's built-in `astro:assets` image pipeline (Sharp, already installed).

## Global Constraints

- Scope is the Home page (`src/pages/index.astro` + its components) and shared chrome (`Header.astro`, `Footer.astro`, `BottomNav.astro`, `FloatingWhatsapp.astro`) only. Do not touch `ModelHero`, `ServiceFaq`, `ServiceSymptoms`, `NeighborhoodHero`, or any other component exclusive to `/iphone-[model]/[service]`, `/servicos/[slug]`, `/atendimento/[bairro]` pages.
- No test framework in this repo. Verification is `npx astro build` succeeding (298 pages) plus manual/browser checks — the established convention for this project.
- Every color contrast fix must keep the site's existing green/orange palette family (darken, don't replace with an unrelated hue) — this was the user's implicit expectation throughout the redesign work, and matches WCAG's requirement (reach 4.5:1) without a brand change.
- `gsap-effects.js`'s existing `mm.revert()`-based cleanup (established across 3 fix rounds in the prior GSAP phase) must not be altered in its internal logic — Task 9's dynamic-import change only changes how the module is *loaded*, never its internal `astro:page-load`/`gsap.matchMedia()` behavior.
- `src/scripts/main.js`'s `pageAbortController`/`{ signal }` cleanup pattern (established in the Motion phase) must be followed for any new `window`/`document`-level listener added in this plan — element-scoped listeners (on elements that get replaced on DOM swap) don't need it, but anything added to `window`/`document` does.

---

## Task 1: Fix the hamburger menu (root cause) and related Header accessibility gaps

**Files:**
- Modify: `src/scripts/main.js:135-144` (top-level `astro:page-load` handler), `src/scripts/main.js:239-263` (`setupMobileMenuToggle`), `src/scripts/main.js:268-278` (`initPricingSelector`)
- Modify: `src/components/Header.astro:4,25` (logo href, toggle button `aria-expanded`)
- Modify: `src/styles/styles.css:2445-2454` (`.mobile-menu-toggle` size), `src/styles/styles.css:2802-2826` (`.nav-links` visibility)

**Interfaces:**
- Produces: `setupMobileMenuToggle(signal)` becomes a top-level call in the `astro:page-load` handler, no longer nested inside `initPricingSelector`. No other task depends on this function's internals.

- [ ] **Step 1: Extract `setupMobileMenuToggle` to run unconditionally**

In `src/scripts/main.js`, `initPricingSelector` currently starts (lines 268-278):
```js
function initPricingSelector(signal) {
  const dropdown = document.getElementById("device-search-select");
  const tabTelasBaterias = document.getElementById("tab-btn-telas-baterias");
  const tabOutrosServicos = document.getElementById("tab-btn-outros-servicos");
  const panelTelasBaterias = document.getElementById("panel-telas-baterias");
  const panelOutrosServicos = document.getElementById("panel-outros-servicos");

  const diagDropdown = document.getElementById("diagnostic-device-select");
  if (!dropdown || !CONFIG.devices) return;

  setupMobileMenuToggle(signal);

  // 1. Popular o Dropdown ordenado de forma lógica com optgroups
```
Remove the `setupMobileMenuToggle(signal);` call from `initPricingSelector` (delete that line and the blank line after it), so the function reads:
```js
function initPricingSelector(signal) {
  const dropdown = document.getElementById("device-search-select");
  const tabTelasBaterias = document.getElementById("tab-btn-telas-baterias");
  const tabOutrosServicos = document.getElementById("tab-btn-outros-servicos");
  const panelTelasBaterias = document.getElementById("panel-telas-baterias");
  const panelOutrosServicos = document.getElementById("panel-outros-servicos");

  const diagDropdown = document.getElementById("diagnostic-device-select");
  if (!dropdown || !CONFIG.devices) return;

  // 1. Popular o Dropdown ordenado de forma lógica com optgroups
```

The top-level `astro:page-load` handler currently ends with (lines 135-144):
```js
  initPricingSelector(pageSignal);
  updateWhatsAppLinks();
  setupScrollEffects(pageSignal);
  setupVideoCarousel();
  setupHeroScrollVideo(pageSignal);
  setupScrollReveal(pageSignal);
  setupFaqAccordion();
  setupReelsAutoplay(pageSignal);
  setupDiagnosticWizard();
});
```
Add `setupMobileMenuToggle(pageSignal);` as its own call, before `initPricingSelector`:
```js
  setupMobileMenuToggle(pageSignal);
  initPricingSelector(pageSignal);
  updateWhatsAppLinks();
  setupScrollEffects(pageSignal);
  setupVideoCarousel();
  setupHeroScrollVideo(pageSignal);
  setupScrollReveal(pageSignal);
  setupFaqAccordion();
  setupReelsAutoplay(pageSignal);
  setupDiagnosticWizard();
});
```
This one change fixes both root causes: it's no longer gated behind the `#device-search-select` early-return (fixes the 3 non-Home pages), and it's no longer called a second time from inside the `if (merged)` branch at line 51 (fixes the Home double-registration, since that branch only ever called it indirectly through `initPricingSelector`, never directly).

- [ ] **Step 2: Add real `aria-expanded` toggling**

`setupMobileMenuToggle` currently reads (lines 239-263):
```js
function setupMobileMenuToggle(signal) {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const navList = document.getElementById("nav-menu-list");
  if (!toggleBtn || !navList) return;

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navList.classList.toggle("mobile-open");
    toggleBtn.classList.toggle("active");
  });

  document.querySelectorAll("#nav-menu-list a").forEach(link => {
    link.addEventListener("click", () => {
      navList.classList.remove("mobile-open");
      toggleBtn.classList.remove("active");
    });
  });

  document.addEventListener("click", (e) => {
    if (!navList.contains(e.target) && !toggleBtn.contains(e.target)) {
      navList.classList.remove("mobile-open");
      toggleBtn.classList.remove("active");
    }
  }, { signal });
}
```
Replace it with (adds `aria-expanded` toggling to all 3 places the menu can close, and toggles the button's `aria-label` between open/closed states):
```js
function setupMobileMenuToggle(signal) {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const navList = document.getElementById("nav-menu-list");
  if (!toggleBtn || !navList) return;

  const setOpen = (isOpen) => {
    navList.classList.toggle("mobile-open", isOpen);
    toggleBtn.classList.toggle("active", isOpen);
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    toggleBtn.setAttribute("aria-label", isOpen ? "Fechar Menu" : "Abrir Menu");
  };

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!navList.classList.contains("mobile-open"));
  });

  document.querySelectorAll("#nav-menu-list a").forEach(link => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("click", (e) => {
    if (!navList.contains(e.target) && !toggleBtn.contains(e.target)) {
      setOpen(false);
    }
  }, { signal });
}
```

- [ ] **Step 3: Add the initial `aria-expanded` attribute and fix the dead logo link in `Header.astro`**

`src/components/Header.astro` currently has (line 4):
```astro
      <a href="#inicio" class="brand-logo-link" aria-label="Voltar para o início do site">
```
Change to:
```astro
      <a href="/" class="brand-logo-link" aria-label="Voltar para o início do site">
```
(`href="#inicio"` only resolves on Home, which has `id="inicio"` — on every other page this is a dead click. `href="/"` works from anywhere and still lands on Home.)

And line 25:
```astro
        <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Abrir Menu">
```
Change to:
```astro
        <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Abrir Menu" aria-expanded="false">
```

- [ ] **Step 4: Increase the hamburger toggle's touch target to 44px**

In `src/styles/styles.css`, the `.mobile-menu-toggle` base rule currently reads (lines 2445-2454):
```css
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: var(--transition-fast);
}
```
Change to:
```css
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 6px;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: var(--transition-fast);
}
```
(`align-items`/`justify-content` here only take effect once the mobile media query switches `display: none` to `display: flex` at line 2796 — harmless on desktop where the rule never applies.)

- [ ] **Step 5: Make `.nav-links` invisible-when-closed to keyboard/AT, not just visually hidden**

In `src/styles/styles.css`, the `.nav-links` mobile rule currently reads (lines 2802-2826):
```css
  .nav-links {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border-bottom: 1px solid var(--border);
    flex-direction: column;
    padding: 24px;
    gap: 16px;
    box-shadow: 0 12px 32px rgba(20, 51, 79, 0.12);
    transform: translateY(-150%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 999;
  }

  .nav-links.mobile-open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
```
Replace with (same pattern already used for `.sticky-price-bar` in the GSAP phase — `visibility` flips at the end of the close transition, immediately on open):
```css
  .nav-links {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border-bottom: 1px solid var(--border);
    flex-direction: column;
    padding: 24px;
    gap: 16px;
    box-shadow: 0 12px 32px rgba(20, 51, 79, 0.12);
    transform: translateY(-150%);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s linear 0.35s;
    z-index: 999;
  }

  .nav-links.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transition-delay: 0s;
  }
```

- [ ] **Step 6: Increase mobile nav-link row height to 44px**

Find the mobile-width rule for `.nav-link` inside `.nav-links` in `src/styles/styles.css` (search for `.nav-links a` or check the `.nav-link` rules active inside the same `@media (max-width: 1023px)` block that starts before line 2792 — read the file around lines 2792-2850 to find the exact current padding, since the base `.nav-link` rule at line 376 doesn't include the mobile-specific sizing). Add (or extend, if a mobile-scoped `.nav-link` rule already exists in that block) a rule inside that same media query:
```css
  .nav-links .nav-link {
    display: block;
    padding: 12px 4px;
  }
```
This targets only the mobile dropdown-panel links, giving each row ~44px of tappable height (font-size 0.875rem + line-height + 24px total vertical padding), without affecting the desktop horizontal nav's `.nav-link` sizing.

- [ ] **Step 7: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages.

Run: `grep -n "setupMobileMenuToggle(signal);" src/scripts/main.js`
Expected: no matches inside `initPricingSelector` (only the definition itself and the new top-level call at the page-load handler should remain — confirm with `grep -n "setupMobileMenuToggle" src/scripts/main.js`, expecting exactly 2 matches: the function definition and the one new call site).

Start the dev server, and on each of `/`, `/servicos/troca-de-tela`, `/iphone-6/troca-de-tela`, `/atendimento/adrianopolis` at a mobile viewport (< 1024px): click the hamburger button and confirm the menu opens (panel becomes visible, `aria-expanded` becomes `"true"`, button label becomes "Fechar Menu"); click a nav link and confirm the menu closes; click the hamburger again to open, then click outside the panel and confirm it closes. Tab through the header with the menu closed and confirm you cannot tab into the (invisible) nav links until the menu is opened. On `/servicos/troca-de-tela`, click the logo and confirm it navigates to Home.

- [ ] **Step 8: Commit**

```bash
git add src/scripts/main.js src/components/Header.astro src/styles/styles.css
git commit -m "fix: repair mobile hamburger menu broken on every page, add focus/ARIA state"
```

---

## Task 2: Fix color contrast (--text-muted, primary CTA buttons, orange accent)

**Files:**
- Modify: `src/styles/styles.css:196` (`--text-muted` token), `src/styles/styles.css:407-426` (`.header-cta-btn`), `src/styles/styles.css:1742-1756` (`.btn-quality-order.btn-premium-cta`)
- Modify: `src/components/ComparativoTelas.astro:14,21,23-24` (inline orange styles)

**Interfaces:** none — CSS/inline-style only, no JS/markup structure changes.

- [ ] **Step 1: Darken `--text-muted`**

In `src/styles/styles.css`, line 196:
```css
  --text-muted: #8A8F98;
```
Change to:
```css
  --text-muted: #6B7280;
```
(`#8A8F98` on white is ≈3.25:1, failing WCAG AA's 4.5:1 for normal text. `#6B7280` on white is ≈4.83:1, passing with margin. Every component using `var(--text-muted)` — `TrustStatsBar`'s stat labels, `ProvaSocial`'s review dates, the price-selector's clear-search icon, `Sobre.astro`'s caption — is fixed by this one token change.)

- [ ] **Step 2: Fix the header CTA button's white-on-green contrast**

In `src/styles/styles.css`, lines 407-426:
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
Change to:
```css
.header-cta-btn {
  background: var(--primary-dark);
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
  filter: brightness(1.15);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}
```
(`--primary-dark` (`#1A532D`) with white text is ≈9:1 — well above 4.5:1. The button already visually "reads" as the site's green brand accent since `--primary-dark` is part of the same token family. `filter: brightness(1.15)` replaces the old hover color-swap with a lightening effect, keeping a hover cue without needing a third color value.)

- [ ] **Step 3: Fix the "AGENDAR PREMIUM" gradient button's contrast**

In `src/styles/styles.css`, lines 1742-1756:
```css
.btn-quality-order.btn-premium-cta {
  background: linear-gradient(135deg, var(--primary) 0%, #3bd671 100%);
  color: #FFFFFF;
  border: none;
  box-shadow: 0 4px 15px rgba(41, 162, 81, 0.25);
  position: relative;
  overflow: hidden;
}

.btn-quality-order.btn-premium-cta:hover {
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
  box-shadow: 0 6px 20px rgba(41, 162, 81, 0.4);
  transform: translateY(-2.5px) scale(1.025);
}
```
Change to:
```css
.btn-quality-order.btn-premium-cta {
  background: linear-gradient(135deg, var(--primary-dark) 0%, #22703D 100%);
  color: #FFFFFF;
  border: none;
  box-shadow: 0 4px 15px rgba(41, 162, 81, 0.25);
  position: relative;
  overflow: hidden;
}

.btn-quality-order.btn-premium-cta:hover {
  filter: brightness(1.1);
  box-shadow: 0 6px 20px rgba(41, 162, 81, 0.4);
  transform: translateY(-2.5px) scale(1.025);
}
```
(Both gradient endpoints now pass 4.5:1 with white text: `--primary-dark` ≈9:1, `#22703D` ≈6.1:1 — the previous gradient's `--primary`/`#3bd671` endpoints were ≈3.3:1 and lower. Same `filter: brightness()` hover treatment as Step 2, for the same reason.)

- [ ] **Step 4: Darken the orange accent in `ComparativoTelas.astro`**

In `src/components/ComparativoTelas.astro`, line 14:
```astro
            <div class="bento-badge intermediate" style="background: rgba(255, 159, 67, 0.08); color: #ff9f43; border: 1px solid rgba(255, 159, 67, 0.2);">ECONÔMICA</div>
```
Change to:
```astro
            <div class="bento-badge intermediate" style="background: rgba(255, 159, 67, 0.08); color: #B45309; border: 1px solid rgba(255, 159, 67, 0.2);">ECONÔMICA</div>
```
Line 21:
```astro
              <li style="color: #ff9f43; font-weight: 700;">★ 3 Meses de Garantia Real em Manaus</li>
```
Change to:
```astro
              <li style="color: #B45309; font-weight: 700;">★ 3 Meses de Garantia Real em Manaus</li>
```
Lines 23-24:
```astro
            <a href="#telas-precos" class="btn-bento-cta basic"
              style="margin-top: auto; padding: 12px 0; text-align: center; border-radius: var(--radius-pill); font-size: 0.8rem; font-weight: 800; border: 1px solid rgba(255, 159, 67, 0.3); color: #ff9f43; background: rgba(255, 159, 67, 0.04);">
```
Change to:
```astro
            <a href="#telas-precos" class="btn-bento-cta basic"
              style="margin-top: auto; padding: 12px 0; text-align: center; border-radius: var(--radius-pill); font-size: 0.8rem; font-weight: 800; border: 1px solid rgba(255, 159, 67, 0.3); color: #B45309; background: rgba(255, 159, 67, 0.04);">
```
(`#ff9f43` on white/near-white is ≈2:1. `#B45309` is ≈5:1 — a darker amber that still reads as the same "orange/economical" accent family, just meeting contrast. The `border`/`background` `rgba(255, 159, 67, ...)` values are left unchanged — they're decorative fills/borders, not text, so 1.4.3 doesn't apply to them the same way; WCAG 1.4.11 (non-text contrast, 3:1) does apply to the border since it's a UI-component boundary, and `rgba(255, 159, 67, 0.3)` against white computes well above 3:1 already, so no change needed there.)

- [ ] **Step 5: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages.

Run: `grep -n "#ff9f43" src/components/ComparativoTelas.astro`
Expected: no matches for the 3 text-color usages fixed above (the badge/bullet/button colors) — note the file may still contain `rgba(255, 159, 67, ...)` for borders/backgrounds, which is expected and correct per Step 4's reasoning.

In a browser, open the home page and visually confirm: the header's "AGENDAR DELIVERY" button, the "AGENDAR PREMIUM" pricing card buttons, and the "Econômica" comparison card's badge/bullet/button all still read clearly as part of the site's green/orange palette, just slightly darker — no jarring color shift.

- [ ] **Step 6: Commit**

```bash
git add src/styles/styles.css src/components/ComparativoTelas.astro
git commit -m "fix: darken --text-muted, CTA button, and orange accent to meet WCAG 1.4.3 contrast"
```

---

## Task 3: Gate infinite CSS animations behind prefers-reduced-motion

**Files:**
- Modify: `src/styles/styles.css:3474-3478` (existing `@media (prefers-reduced-motion: reduce)` block)

**Interfaces:** none.

- [ ] **Step 1: Add the 4 infinite animations to the existing reduced-motion block**

In `src/styles/styles.css`, the block currently reads (lines 3474-3478):
```css
@media (prefers-reduced-motion: reduce) {
  .sticky-price-bar {
    transition-duration: 0.01ms;
  }
}
```
Change to:
```css
@media (prefers-reduced-motion: reduce) {
  .sticky-price-bar {
    transition-duration: 0.01ms;
  }

  .btn-glow,
  .pulse-dot,
  .btn-whatsapp-floating::before,
  .bottom-nav-item.bottom-nav-cta {
    animation: none;
  }
}
```
(This stops all 4 `infinite` animations — `cta-glow-pulse` on every "AGENDAR..." CTA sitewide via `.btn-glow`, `pulse` on the Hero pill's dot via `.pulse-dot`, `pulse-ring` on the floating WhatsApp button via `.btn-whatsapp-floating::before`, and `pulse-cta-glow` on the BottomNav's CTA tab — for users who've set the OS-level reduced-motion preference, per WCAG 2.2.2.)

- [ ] **Step 2: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages.

Enable "prefers-reduced-motion: reduce" in DevTools, reload the home page, and confirm none of the "AGENDAR..." buttons glow/pulse, the Hero pill's dot is static, the floating WhatsApp button (desktop, once scrolled past 300px) has no pulsing ring, and the BottomNav's CTA tab (mobile) doesn't glow. Disable reduced-motion and confirm all 4 animations play normally again.

- [ ] **Step 3: Commit**

```bash
git add src/styles/styles.css
git commit -m "fix: pause infinite CTA/pulse animations under prefers-reduced-motion"
```

---

## Task 4: Keyboard access for the clear-search button, video reel frames, and missing focus-visible styles

**Files:**
- Modify: `src/components/PricingSelector.astro:83` (clear-search `<span>` → `<button>`)
- Modify: `src/components/ProvaSocial.astro:44,65` (`.reel-frame` role/tabindex/aria-label)
- Modify: `src/scripts/main.js:1048-1070` (`setupReelsAutoplay`'s reel-frame click handler)
- Modify: `src/styles/styles.css` (new `:focus-visible` rules for `.symptom-btn`, `.selector-tab`, `.faq-question`; reset default button chrome on `#search-input-clear-btn`)

**Interfaces:** none — no other task depends on these changes.

- [ ] **Step 1: Convert the clear-search `<span>` to a real `<button>`**

In `src/components/PricingSelector.astro`, line 83:
```astro
                <span id="search-input-clear-btn" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); cursor: pointer; display: none; font-weight: 700; color: var(--text-muted); font-size: 1.1rem; padding: 4px;">✕</span>
```
Change to:
```astro
                <button type="button" id="search-input-clear-btn" aria-label="Limpar busca" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); cursor: pointer; display: none; font-weight: 700; color: var(--text-muted); font-size: 1.1rem; padding: 4px; background: none; border: none; line-height: 1;">✕</button>
```
(All of `src/scripts/main.js`'s existing references — `document.getElementById("search-input-clear-btn")`, `.style.display`, `.addEventListener("click", ...)` — work identically on a `<button>`; no JS changes needed for this step. `background: none; border: none; line-height: 1;` reset the browser's default button chrome so it looks the same as the old `<span>`.)

- [ ] **Step 2: Make `.reel-frame` keyboard-operable**

In `src/components/ProvaSocial.astro`, line 44:
```astro
            <div class="reel-frame">
```
Change to:
```astro
            <div class="reel-frame" role="button" tabindex="0" aria-label="Reproduzir vídeo: Troca de Tela iPhone 13">
```
Line 65:
```astro
            <div class="reel-frame">
```
Change to:
```astro
            <div class="reel-frame" role="button" tabindex="0" aria-label="Reproduzir vídeo: Delivery em Dose Dupla">
```

In `src/scripts/main.js`, `setupReelsAutoplay`'s reel-frame click wiring currently reads (lines 1048-1070):
```js
      // Clique no frame do vídeo liga/desliga o som ou alterna o foco
      const frame = card.querySelector(".reel-frame");
      if (frame) {
        frame.style.cursor = "pointer";
        frame.addEventListener("click", (e) => {
          // Evita que o clique dispare ações se clicar no botão do Instagram
          if (e.target.closest(".reel-insta-btn")) return;
          
          // Se o vídeo clicado não for o ativo, ativa ele
          if (currentActiveIndex !== index) {
            playVideoAtIndex(index);
            video.muted = false; // Começa tocando com som
            card.classList.add("sound-active");
          } else {
            // Se já for o ativo, apenas alterna o mute (som)
            video.muted = !video.muted;
            if (!video.muted) {
              card.classList.add("sound-active");
            } else {
              card.classList.remove("sound-active");
            }
          }
        });
      }
```
Replace with (extracts the shared logic into a named function so both `click` and `keydown` can call it):
```js
      // Clique (ou Enter/Espaço) no frame do vídeo liga/desliga o som ou alterna o foco
      const frame = card.querySelector(".reel-frame");
      if (frame) {
        frame.style.cursor = "pointer";
        const activateFrame = (e) => {
          // Evita que o clique dispare ações se clicar no botão do Instagram
          if (e.target.closest(".reel-insta-btn")) return;

          // Se o vídeo clicado não for o ativo, ativa ele
          if (currentActiveIndex !== index) {
            playVideoAtIndex(index);
            video.muted = false; // Começa tocando com som
            card.classList.add("sound-active");
          } else {
            // Se já for o ativo, apenas alterna o mute (som)
            video.muted = !video.muted;
            if (!video.muted) {
              card.classList.add("sound-active");
            } else {
              card.classList.remove("sound-active");
            }
          }
        };
        frame.addEventListener("click", activateFrame);
        frame.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activateFrame(e);
          }
        });
      }
```

- [ ] **Step 3: Add `:focus-visible` styles for the 3 components missing them**

In `src/styles/styles.css`, `.symptom-btn` (line 1261), `.selector-tab` (line 1407), and `.faq-question` (line 2280) each currently end their rule block with `outline: none;` and no replacement. Add one new rule anywhere after all three are defined (e.g., right after the `.faq-question` rule block, before `.faq-question-icon`):
```css
.symptom-btn:focus-visible,
.selector-tab:focus-visible,
.faq-question:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```
(`:focus-visible` (not `:focus`) shows the ring only for keyboard focus, not mouse clicks — consistent with how modern browsers already treat native controls, and matches the existing `.search-select-dropdown:focus`/`.device-search-input-field:focus` pattern's intent without duplicating their box-shadow treatment, since these three are buttons, not inputs.)

- [ ] **Step 4: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages.

Run: `grep -n "search-input-clear-btn" src/components/PricingSelector.astro`
Expected: shows the new `<button type="button" ...>` opening tag.

In a browser: type a model name into the price search box, confirm the "✕" clear button appears and Tab-focuses correctly (visible focus ring), click it and confirm it clears the search. Tab to a FAQ question, a pricing tab, and a diagnostic symptom button and confirm each shows a visible green outline when focused via keyboard (not on mouse click). Tab to a reel card's video frame (not just the Instagram link inside it) and confirm it's reachable and that pressing Enter or Space toggles its sound/activates it, matching a mouse click.

- [ ] **Step 5: Commit**

```bash
git add src/components/PricingSelector.astro src/components/ProvaSocial.astro src/scripts/main.js src/styles/styles.css
git commit -m "fix: keyboard access for clear-search button, video reel frames, and focus-visible styles"
```

---

## Task 5: Pricing tabs (aria-labelledby + arrow-key nav) and diagnostic symptom buttons (aria-pressed + fieldset)

**Files:**
- Modify: `src/components/PricingSelector.astro:75,236` (tab panels)
- Modify: `src/components/DiagnosticForm.astro:17-39` (symptom group markup)
- Modify: `src/scripts/main.js:316-337` (tab click handlers), `src/scripts/main.js:1109-1117` (symptom button click handler)

**Interfaces:** none.

- [ ] **Step 1: Add `aria-labelledby` to the two tab panels**

In `src/components/PricingSelector.astro`, line 75:
```astro
          <div class="selector-panel active" id="panel-telas-baterias" role="tabpanel">
```
Change to:
```astro
          <div class="selector-panel active" id="panel-telas-baterias" role="tabpanel" aria-labelledby="tab-btn-telas-baterias">
```
Line 236:
```astro
          <div class="selector-panel" id="panel-outros-servicos" role="tabpanel">
```
Change to:
```astro
          <div class="selector-panel" id="panel-outros-servicos" role="tabpanel" aria-labelledby="tab-btn-outros-servicos">
```

- [ ] **Step 2: Add Left/Right arrow-key switching between the two tabs**

In `src/scripts/main.js`, `initPricingSelector`'s tab-management block currently ends (lines 316-337):
```js
  // 3. Gerenciar Abas ("Telas e Baterias" vs "Outros Serviços")
  if (tabTelasBaterias && tabOutrosServicos) {
    tabTelasBaterias.addEventListener("click", () => {
      tabTelasBaterias.classList.add("active");
      tabTelasBaterias.setAttribute("aria-selected", "true");
      tabOutrosServicos.classList.remove("active");
      tabOutrosServicos.setAttribute("aria-selected", "false");
      
      panelTelasBaterias.classList.add("active");
      panelOutrosServicos.classList.remove("active");
    });
    
    tabOutrosServicos.addEventListener("click", () => {
      tabOutrosServicos.classList.add("active");
      tabOutrosServicos.setAttribute("aria-selected", "true");
      tabTelasBaterias.classList.remove("active");
      tabTelasBaterias.setAttribute("aria-selected", "false");
      
      panelOutrosServicos.classList.add("active");
      panelTelasBaterias.classList.remove("active");
    });
  }
```
Add this immediately after the closing `}` of that `if` block (still inside `initPricingSelector`):
```js

  if (tabTelasBaterias && tabOutrosServicos) {
    const tabOrder = [tabTelasBaterias, tabOutrosServicos];
    tabOrder.forEach((tab, i) => {
      tab.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        const nextIndex = (i + (e.key === "ArrowRight" ? 1 : -1) + tabOrder.length) % tabOrder.length;
        const nextTab = tabOrder[nextIndex];
        nextTab.focus();
        nextTab.click();
      });
    });
  }
```
(Reuses `.click()` to trigger the existing activation logic above rather than duplicating it — standard ARIA Tabs authoring-practice pattern: Left/Right moves focus to and activates the adjacent tab.)

- [ ] **Step 3: Wrap the symptom buttons in a `<fieldset>`/`<legend>` and add `aria-pressed`**

In `src/components/DiagnosticForm.astro`, lines 17-39 currently read:
```astro
              <div class="diagnostic-form-group">
                <label class="search-label">Selecione o Sintoma do Aparelho:</label>
                <div class="symptom-grid">
                  <button class="symptom-btn active" data-symptom="Troca de Tela (Tela Quebrada / Sem Toque)">
                    <span>📱</span> Tela Quebrada
                  </button>
                  <button class="symptom-btn" data-symptom="Troca de Bateria (Bateria Viciada / Saúde Baixa)">
                    <span>🔋</span> Bateria Viciada
                  </button>
                  <button class="symptom-btn" data-symptom="Problema de Carga (iPhone Não liga / Não carrega)">
                    <span>🔌</span> Não Carrega
                  </button>
                  <button class="symptom-btn" data-symptom="Reparo Avançado (Caiu na água / Molhou)">
                    <span>💧</span> Caiu na Água
                  </button>
                  <button class="symptom-btn" data-symptom="Troca de Câmera (Foco quebrado / Lente trincada)">
                    <span>📸</span> Câmera Borrada
                  </button>
                  <button class="symptom-btn" data-symptom="Outros Serviços (Face ID / Tampa Traseira / Áudio)">
                    <span>⚙️</span> Outros Defeitos
                  </button>
                </div>
              </div>
```
Change to:
```astro
              <fieldset class="diagnostic-form-group" style="border: none; padding: 0; margin: 0;">
                <legend class="search-label" style="padding: 0; float: none;">Selecione o Sintoma do Aparelho:</legend>
                <div class="symptom-grid">
                  <button class="symptom-btn active" data-symptom="Troca de Tela (Tela Quebrada / Sem Toque)" aria-pressed="true">
                    <span aria-hidden="true">📱</span> Tela Quebrada
                  </button>
                  <button class="symptom-btn" data-symptom="Troca de Bateria (Bateria Viciada / Saúde Baixa)" aria-pressed="false">
                    <span aria-hidden="true">🔋</span> Bateria Viciada
                  </button>
                  <button class="symptom-btn" data-symptom="Problema de Carga (iPhone Não liga / Não carrega)" aria-pressed="false">
                    <span aria-hidden="true">🔌</span> Não Carrega
                  </button>
                  <button class="symptom-btn" data-symptom="Reparo Avançado (Caiu na água / Molhou)" aria-pressed="false">
                    <span aria-hidden="true">💧</span> Caiu na Água
                  </button>
                  <button class="symptom-btn" data-symptom="Troca de Câmera (Foco quebrado / Lente trincada)" aria-pressed="false">
                    <span aria-hidden="true">📸</span> Câmera Borrada
                  </button>
                  <button class="symptom-btn" data-symptom="Outros Serviços (Face ID / Tampa Traseira / Áudio)" aria-pressed="false">
                    <span aria-hidden="true">⚙️</span> Outros Defeitos
                  </button>
                </div>
              </fieldset>
```
(`border: none; padding: 0; margin: 0;` on the `fieldset` and `padding: 0; float: none;` on the `legend` reset the browsers' default fieldset/legend chrome so the visual layout is unchanged — `.diagnostic-form-group`'s existing CSS class still applies normally to the `fieldset` element. The `aria-hidden="true"` on each emoji `<span>` is this task's Step 3 bonus — same fix as Task 7's bulk sweep would apply here, done inline since this block is already being rewritten.)

- [ ] **Step 4: Toggle `aria-pressed` in the click handler**

In `src/scripts/main.js`, `setupDiagnosticWizard`'s symptom-button click handler currently reads (lines 1109-1117):
```js
  // 1. Escuta cliques nos botões de sintomas
  symptomBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      symptomBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSymptom = btn.getAttribute("data-symptom");
      updateDiagnosticLink();
    });
  });
```
Change to:
```js
  // 1. Escuta cliques nos botões de sintomas
  symptomBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      symptomBtns.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      selectedSymptom = btn.getAttribute("data-symptom");
      updateDiagnosticLink();
    });
  });
```

- [ ] **Step 5: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages.

Run: `grep -c "aria-pressed" src/components/DiagnosticForm.astro`
Expected: `6` (one per symptom button).

In a browser, on the home page: Tab to the "Telas e Baterias" pricing tab, press the Right arrow key, and confirm focus and the active panel both move to "Outros Serviços"; press Left to return. Click each of the 6 diagnostic symptom buttons and inspect (DevTools) that `aria-pressed` is `"true"` only on the clicked one.

- [ ] **Step 6: Commit**

```bash
git add src/components/PricingSelector.astro src/components/DiagnosticForm.astro src/scripts/main.js
git commit -m "fix: add tab arrow-key navigation and symptom-button pressed state"
```

---

## Task 6: FAQ accordion — real aria-expanded, aria-controls, and hide collapsed content from the a11y tree

**Files:**
- Modify: `src/components/Faq.astro:103-196` (7 `.faq-item` blocks)
- Modify: `src/scripts/main.js:940-952` (`setupFaqAccordion`)

**Interfaces:** none.

- [ ] **Step 1: Add unique `id`s to each answer panel and `aria-controls` to each button**

In `src/components/Faq.astro`, each of the 7 `.faq-item` blocks currently follows this shape (shown for item 1, lines 102-112 — repeat the equivalent change for all 7, numbering `faq-answer-1` through `faq-answer-7` in document order):
```astro
            <div class="faq-item">
              <button class="faq-question" aria-expanded="false">
                <span>Onde consertar a tela do iPhone 15 Pro Max hoje em Manaus com atendimento no mesmo dia?</span>
                <span class="faq-question-icon">+</span>
              </button>
              <div class="faq-answer">
                <div class="faq-answer-inner">
```
Change every occurrence's opening button/answer tags to:
```astro
            <div class="faq-item">
              <button class="faq-question" aria-expanded="false" aria-controls="faq-answer-1">
                <span>Onde consertar a tela do iPhone 15 Pro Max hoje em Manaus com atendimento no mesmo dia?</span>
                <span class="faq-question-icon" aria-hidden="true">+</span>
              </button>
              <div class="faq-answer" id="faq-answer-1" aria-hidden="true">
                <div class="faq-answer-inner">
```
Apply the same pattern to the remaining 6 items in the file (in order: `faq-answer-2` at the "Como funciona o conserto..." item, `faq-answer-3` at "A troca de tela...True Tone", `faq-answer-4` at "Quanto tempo demora...bateria", `faq-answer-5` at "O iPhone continua resistente...água", `faq-answer-6` at "Qual o valor...garantia", `faq-answer-7` at "A Brothers Techcell busca e entrega...") — each button gets `aria-controls="faq-answer-N"` added after its existing `aria-expanded="false"`, each `.faq-answer` div gets `id="faq-answer-N" aria-hidden="true"` added, and each `.faq-question-icon` span gets `aria-hidden="true"` added. All 7 items start collapsed, so all 7 start with `aria-expanded="false"` (unchanged) and `aria-hidden="true"` (new) — none needs a different initial state.

- [ ] **Step 2: Toggle `aria-expanded` and `aria-hidden` in the accordion's click handler**

In `src/scripts/main.js`, `setupFaqAccordion` currently reads (lines 940-952):
```js
function setupFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}
```
Change to:
```js
function setupFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        i.querySelector('.faq-answer')?.setAttribute('aria-hidden', 'true');
      });
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
      }
    });
  });
}
```
(`aria-hidden` is a pure accessibility-tree property — it doesn't affect the `max-height`-based CSS collapse animation at all, so no CSS changes are needed here; the visual transition and the accessibility state are fixed independently and don't interact.)

- [ ] **Step 3: Add `scope="col"` to the summary table headers**

In `src/components/Faq.astro`, lines 62-67:
```astro
                  <tr>
                    <th>Serviço</th>
                    <th>Tempo Estimado</th>
                    <th>Garantia</th>
                    <th>Local</th>
                  </tr>
```
Change to:
```astro
                  <tr>
                    <th scope="col">Serviço</th>
                    <th scope="col">Tempo Estimado</th>
                    <th scope="col">Garantia</th>
                    <th scope="col">Local</th>
                  </tr>
```

- [ ] **Step 4: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages.

Run: `grep -c "aria-controls=\"faq-answer-" src/components/Faq.astro` — expected `7`.
Run: `grep -c "id=\"faq-answer-" src/components/Faq.astro` — expected `7`.

In a browser: click each of the 7 FAQ questions and confirm (DevTools) that `aria-expanded` becomes `"true"` and the matching `.faq-answer`'s `aria-hidden` becomes `"false"` only for the open one, while all others read `"false"`/`"true"` respectively; confirm the visual expand/collapse animation is unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/components/Faq.astro src/scripts/main.js
git commit -m "fix: make FAQ accordion's aria-expanded/aria-hidden reflect real state"
```

---

## Task 7: Bulk mechanical accessibility fixes (decorative icons, star ratings, aria-current, server-rendered label parity)

**Files:**
- Modify: `src/components/Hero.astro:22,45`
- Modify: `src/components/Diferenciais.astro:13,23,33,43`
- Modify: `src/components/Footer.astro:7,55,64,73,83,92`
- Modify: `src/components/BottomNav.astro:4,10,17,24,31`
- Modify: `src/components/FloatingWhatsapp.astro:4`
- Modify: `src/components/PricingSelector.astro:119,146,151,163-165,179,205,210,222-224,262`
- Modify: `src/components/DiagnosticForm.astro:49,60` (the 2 non-emoji SVGs — the 6 emoji spans were already handled in Task 5 Step 3)
- Modify: `src/components/ProvaSocial.astro:49,58,70,79,97`
- Modify: `src/scripts/main.js:775-780` (`setupScrollEffects`'s active-link section)

**Interfaces:** none — every change in this task is either `aria-hidden="true"` added to a purely decorative `<svg>` opening tag, an `aria-label` added to a server-rendered link to match its JS-rendered equivalent, or `scope`/`aria-current` additions. None change behavior.

- [ ] **Step 1: Add `aria-hidden="true"` to every decorative SVG**

For each file/line below, add `aria-hidden="true"` as an attribute on the `<svg ...>` opening tag (the icon is always paired with adjacent visible text, e.g. "AGENDAR MEU REPARO AGORA!", so its accessible name already comes from that text — these icons should never be separately announced):

- `src/components/Hero.astro:22` — the WhatsApp icon inside `<a href="#" class="btn-glow btn-whatsapp-global">`.
- `src/components/Hero.astro:45` — `<svg class="indicator-arrow" ...>` inside `#mobile-scroll-arrow`.
- `src/components/Diferenciais.astro:13,23,33,43` — the 4 `diff-icon-container` SVGs.
- `src/components/Footer.astro:7` — the logo-adjacent icon at the top of the footer.
- `src/components/Footer.astro:55,64,73,83,92` — the 5 `footer-contact-icon` SVGs.
- `src/components/BottomNav.astro:4,10,17,24,31` — the 5 `bottom-nav-icon` SVGs.
- `src/components/FloatingWhatsapp.astro:4` — the WhatsApp icon (the link itself already has `aria-label="Fale conosco no WhatsApp"`, so this icon's own accessible name would otherwise be redundant).
- `src/components/PricingSelector.astro:119,179` — the two `icon-service-type` SVGs (tela/bateria icons in the results grid).
- `src/components/PricingSelector.astro:146,151,205,210` — the 4 `benefit-icon` SVGs (garantia/brinde icons).
- `src/components/PricingSelector.astro:262` — the WhatsApp icon inside "SOLICITAR OUTRO SERVIÇO".
- `src/components/DiagnosticForm.astro:49` — the select-arrow SVG.
- `src/components/DiagnosticForm.astro:60` — the WhatsApp icon inside the diagnostic submit button.
- `src/components/ProvaSocial.astro:49,70` — the 2 play-indicator-glow SVGs.
- `src/components/ProvaSocial.astro:58,79` — the 2 Instagram-icon SVGs inside `.reel-insta-btn`.

Example of the change (Hero.astro:22, showing the pattern to apply at every line above):
```astro
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
```
becomes:
```astro
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
```
(For SVGs that already have other attributes like `class="..."` or `fill="currentColor"`, add `aria-hidden="true"` alongside them on the same opening tag — the exact attribute order doesn't matter.)

- [ ] **Step 2: Add an accessible label to the star-rating display**

In `src/components/ProvaSocial.astro`, line 97:
```astro
                <span class="review-stars">★★★★★</span>
```
Change to:
```astro
                <span class="review-stars" aria-label="Avaliação: 5 de 5 estrelas"><span aria-hidden="true">★★★★★</span></span>
```

- [ ] **Step 3: Add `aria-label` parity to the server-rendered "AGENDAR" buttons**

In `src/components/PricingSelector.astro`, lines 163-165 (inside the screen-quality card's `.map()`):
```astro
                            <a href={`https://brothersystem.vercel.app/agendar?link=tela&device=${encodeURIComponent(defaultModel)}&quality=${encodeURIComponent(displayQuality)}`} target="_blank" rel="noopener noreferrer" class={isPremium ? "btn-quality-order btn-premium-cta" : "btn-quality-order"}>
                              {isPremium ? 'AGENDAR PREMIUM' : 'AGENDAR'}
                            </a>
```
Change to:
```astro
                            <a href={`https://brothersystem.vercel.app/agendar?link=tela&device=${encodeURIComponent(defaultModel)}&quality=${encodeURIComponent(displayQuality)}`} target="_blank" rel="noopener noreferrer" class={isPremium ? "btn-quality-order btn-premium-cta" : "btn-quality-order"} aria-label={`Agendar troca de tela ${displayQuality} para iPhone ${defaultModel}`}>
                              {isPremium ? 'AGENDAR PREMIUM' : 'AGENDAR'}
                            </a>
```
Lines 222-224 (inside the battery-quality card's `.map()`):
```astro
                            <a href={`https://brothersystem.vercel.app/agendar?link=bateria&device=${encodeURIComponent(defaultModel)}&quality=${encodeURIComponent(displayQuality)}`} target="_blank" rel="noopener noreferrer" class="btn-quality-order">
                              AGENDAR
                            </a>
```
Change to:
```astro
                            <a href={`https://brothersystem.vercel.app/agendar?link=bateria&device=${encodeURIComponent(defaultModel)}&quality=${encodeURIComponent(displayQuality)}`} target="_blank" rel="noopener noreferrer" class="btn-quality-order" aria-label={`Agendar troca de bateria ${displayQuality} para iPhone ${defaultModel}`}>
                              AGENDAR
                            </a>
```

- [ ] **Step 4: Add `aria-current` to the active nav link**

In `src/scripts/main.js`, `setupScrollEffects`'s active-link section currently reads (lines 775-780):
```js
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelectorAll(".nav-link, .bottom-nav-item").forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
```
Change to:
```js
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelectorAll(".nav-link, .bottom-nav-item").forEach(link => {
          link.classList.remove("active");
          link.removeAttribute("aria-current");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
            link.setAttribute("aria-current", "true");
          }
        });
      }
```

- [ ] **Step 5: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages.

Run: `grep -c "aria-hidden=\"true\"" src/components/Hero.astro src/components/Diferenciais.astro src/components/Footer.astro src/components/BottomNav.astro src/components/FloatingWhatsapp.astro src/components/PricingSelector.astro src/components/DiagnosticForm.astro src/components/ProvaSocial.astro`
Expected: a per-file count matching (at least) the number of lines listed for that file in Step 1 (`DiagnosticForm.astro` will show 8 — the 6 emoji spans from Task 5 plus the 2 SVGs from this task; every other file's count should exactly match its Step 1 line list).

Scroll the home page and confirm (DevTools) `aria-current="true"` appears on exactly one `.nav-link`/`.bottom-nav-item` at a time, matching the currently-scrolled section.

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero.astro src/components/Diferenciais.astro src/components/Footer.astro src/components/BottomNav.astro src/components/FloatingWhatsapp.astro src/components/PricingSelector.astro src/components/DiagnosticForm.astro src/components/ProvaSocial.astro src/scripts/main.js
git commit -m "fix: aria-hidden decorative icons, star-rating label, nav aria-current, button label parity"
```

---

## Task 8: Fix horizontal overflow from the footer CTA button

**Files:**
- Modify: `src/styles/styles.css:2441-2443` (`.footer-cta-btn`)

**Interfaces:** none.

- [ ] **Step 1: Let the footer CTA button shrink and wrap instead of overflowing**

In `src/styles/styles.css`, lines 2441-2443:
```css
.footer-cta-btn {
  flex-shrink: 0;
}
```
Change to:
```css
.footer-cta-btn {
  flex-shrink: 1;
  min-width: 0;
  max-width: 100%;
  white-space: normal;
  text-align: center;
}
```
(This is shared chrome — `Footer.astro` renders on every page, so this single fix resolves the 46-61px horizontal overflow found at 375/390px on all 4 tested pages, not just Home. The button's `<span>AGENDAR MEU ATENDIMENTO AGORA</span>` text can now wrap onto a second line at narrow widths instead of forcing the button past the viewport edge; `min-height: 48px` from the existing shared touch-target rule still applies, so a 2-line button just grows taller.)

- [ ] **Step 2: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages.

At a 375px-wide viewport (DevTools device toolbar), load `/`, `/servicos/troca-de-tela`, `/iphone-6/troca-de-tela`, and `/atendimento/adrianopolis` and confirm: no horizontal scrollbar, `document.documentElement.scrollWidth` equals `document.documentElement.clientWidth` (or very close — run `document.documentElement.scrollWidth - document.documentElement.clientWidth` in the console on each page, expect `0`, down from the previously measured 61px), and the footer CTA button's text wraps cleanly onto 2 lines with no visual overlap with surrounding content.

- [ ] **Step 3: Commit**

```bash
git add src/styles/styles.css
git commit -m "fix: stop footer CTA button from causing horizontal overflow on narrow mobile widths"
```

---

## Task 9: Performance — gate reel video autoplay, defer GSAP off mobile, fix render-blocking fonts, optimize the logo

**Files:**
- Modify: `src/scripts/main.js:959-1021` (`setupReelsAutoplay`'s initial play call)
- Modify: `src/pages/index.astro` (script-tag section)
- Modify: `src/layouts/BaseLayout.astro` (`<head>` font loading)
- Modify: `src/styles/styles.css:1` (remove the CSS `@import` for fonts)
- Create: `src/assets/logo-brotherstechcell.jpeg` (moved from `public/`)
- Modify: `src/components/Header.astro:5` and `src/components/Footer.astro:18` (logo `<img>` → `astro:assets` `<Image>`)
- Delete: `public/Logo Brotherstechcell.jpeg` (superseded by the moved copy)

**Interfaces:**
- Produces: nothing consumed by other tasks — this task is independent of Tasks 1-8 and 10.

- [ ] **Step 1: Gate the reel carousel's initial autoplay behind an IntersectionObserver**

In `src/scripts/main.js`, `setupReelsAutoplay`'s local-video branch currently calls `playVideoAtIndex(0)` unconditionally right after defining the function (line 1021, inside the `if (localVideos.length > 0) { ... }` block, after `function playVideoAtIndex(index) { ... }`'s closing brace):
```js
    // Inicializa tocando o primeiro vídeo
    playVideoAtIndex(0);
```
Replace that single line with an IntersectionObserver-gated version, mirroring the pattern already used by `setupHeroScrollVideo`:
```js
    // Só inicia o autoplay quando a seção de reels estiver próxima da viewport —
    // evita baixar/tocar o vídeo de 3.5MB do primeiro reel em todo carregamento de página,
    // mesmo quando a seção está fora de tela (mesmo padrão já usado no vídeo do Hero).
    const reelsSection = document.getElementById("transparencia");
    if (reelsSection) {
      const reelsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            playVideoAtIndex(0);
            reelsObserver.disconnect();
          }
        });
      }, { threshold: 0.05 });
      reelsObserver.observe(reelsSection);
      signal.addEventListener("abort", () => reelsObserver.disconnect());
    } else {
      playVideoAtIndex(0);
    }
```
(One-shot: once the section is first observed intersecting, it plays the first reel and disconnects — the existing `onended`-chained sequential playback in `playVideoAtIndex` takes over from there, unchanged. The `else` branch is a defensive fallback in case `#transparencia` — `ProvaSocial.astro`'s section id — isn't found, matching this codebase's existing null-guard conventions rather than silently doing nothing.)

- [ ] **Step 2: Defer loading `gsap-effects.js` off mobile viewports**

In `src/pages/index.astro`, find the script tag:
```astro
  <script src="../scripts/gsap-effects.js"></script>
```
Replace it with an inline bootstrap script that only imports the module when the viewport is desktop-width, re-checked on every `astro:page-load` (so a client-side navigation while already at desktop width still loads it, even if the very first page load on this browser tab was at mobile width):
```astro
  <script>
    function loadGsapEffectsIfDesktop() {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        import("../scripts/gsap-effects.js");
      }
    }
    document.addEventListener("astro:page-load", loadGsapEffectsIfDesktop);
  </script>
```
(This does not touch `gsap-effects.js` itself — its internal `astro:page-load` listener, `gsap.matchMedia()` gating, and `mm.revert()` cleanup from the prior GSAP phase are completely unchanged; only the *loading strategy* changes, from an unconditional `<script src>` to a conditionally-dynamic-imported module. Below 1024px, the ~44.8KB gzipped chunk is never requested at all — Lighthouds's mobile trace confirmed 100% of this chunk's app logic is unreachable there. The one accepted trade-off: if a user loads the page at <1024px and then resizes the *same* browser tab past 1024px without navigating anywhere, the effects won't activate until the next `astro:page-load` fires (a real navigation) — real users on physical devices don't cross this breakpoint by resizing mid-session, so this doesn't affect the site's actual mobile/desktop audience; it only affects manual desktop-browser window-resize testing, which the plan's own verification step below accounts for.)

- [ ] **Step 3: Move Google Fonts loading from a render-blocking CSS `@import` to a preconnected `<link>`**

In `src/styles/styles.css`, remove line 1:
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
```
(Leave line 2, the blank line, and line 3's `@import "tailwindcss";` untouched — only the Google Fonts `@import` is removed.)

In `src/layouts/BaseLayout.astro`, the `<head>` currently starts (lines 72-75):
```astro
<head>
  <meta name="google-site-verification" content="WndbJR-QXJNCwGbGdOiNh35Sm1i2d1Ah6Oml1o_nd8o" />
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```
Add the font `<link>` tags right after the viewport meta tag:
```astro
<head>
  <meta name="google-site-verification" content="WndbJR-QXJNCwGbGdOiNh35Sm1i2d1Ah6Oml1o_nd8o" />
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap">
```
(A `<link rel="stylesheet">` discovered directly in the HTML `<head>` is fetched by the browser's preloader immediately during HTML parsing, before the browser even starts downloading `styles.css` — unlike a CSS `@import`, which can only be discovered after `styles.css` itself has already started downloading and been parsed far enough to reach line 1. Combined with `preconnect`, this removes the ~1049ms critical-path cost Lighthouse measured for font loading, without changing which fonts load or their `font-display: swap` behavior.)

- [ ] **Step 4: Move the logo into `src/assets/` and serve it through `astro:assets`**

Move the file (same JPEG bytes, just relocated and renamed to match this project's existing `src/assets/` naming convention — lowercase, hyphenated, no spaces, matching `icone-tela.jpg`/`icone-bateria.jpg` already imported in `main.js`):
```bash
git mv "public/Logo Brotherstechcell.jpeg" "src/assets/logo-brotherstechcell.jpeg"
```

In `src/components/Header.astro`, add the imports at the top of the frontmatter (currently the file has no frontmatter fence at all — add one as the very first lines):
```astro
---
import { Image } from 'astro:assets';
import logoSrc from '../assets/logo-brotherstechcell.jpeg';
---
```
Then change line 5 (now shifted down by the new frontmatter block, but unambiguous by content):
```astro
        <img src="/Logo Brotherstechcell.jpeg" class="logo-img" alt="Logo Brothers Techcell - Voltar para o início">
```
to:
```astro
        <Image src={logoSrc} class="logo-img" alt="Logo Brothers Techcell - Voltar para o início" width={90} height={102} format="webp" quality={80} />
```

In `src/components/Footer.astro`, check whether the file already has a frontmatter fence (`---` block) at the top — if it does, add the two import lines inside the existing fence; if it doesn't, add a new fence exactly as shown for Header.astro above. Then change:
```astro
          <img src="/Logo Brotherstechcell.jpeg" class="logo-img" alt="Brothers Techcell - Assistência Técnica Especializada Apple em Manaus AM"
```
to:
```astro
          <Image src={logoSrc} class="logo-img" alt="Brothers Techcell - Assistência Técnica Especializada Apple em Manaus AM" width={90} height={102} format="webp" quality={80} />
```
(keep whatever the rest of that tag's attributes were, e.g. a closing `>` on the next line — only the tag name and the `src`/new `width`/`height`/`format`/`quality` attributes change, `class` and `alt` stay as they were.)

(`width={90} height={102}` preserves the source image's exact aspect ratio (1023×1156 ≈ 0.885, and 90/102 ≈ 0.882) at roughly 2x the ~45px display height for retina sharpness. Astro's built-in image service (Sharp, already installed in this project) resizes and re-encodes to WebP at build time — replacing the currently-shipped 39.7KB JPEG at its full 1023×1156 intrinsic size with a properly-sized WebP in the low single-digit KB. `.logo-img`'s existing CSS (`height: 45px`/`38px` at different breakpoints, `width: auto`) is unaffected — it continues to control the final rendered size exactly as before; the HTML `width`/`height` attributes only declare the aspect ratio so the browser can reserve layout space before the image loads, preventing CLS.)

- [ ] **Step 5: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages, and the build output should show new optimized image asset(s) generated under `dist/_astro/` for the logo (look for a filename containing `logo-brotherstechcell` in the build log or `dist/_astro/`).

Run: `ls public/ | grep -i logo`
Expected: no output (the file no longer exists in `public/`).

Run: `grep -rn "Logo Brotherstechcell.jpeg" src/`
Expected: no matches (both `<img src="/Logo Brotherstechcell.jpeg">` references were replaced with `<Image src={logoSrc} ...>`).

Start the dev server, load the home page at a mobile viewport (<1024px), and confirm in DevTools Network tab: no request to `fonts.googleapis.com/css2` shows as render-blocking-critical-path in a Lighthouse run (re-run `npx astro build && npx astro preview` then `npx lighthouse http://localhost:4321/ --preset=mobile --only-categories=performance` if the Lighthouse CLI is available, and compare FCP/LCP against the baseline of 3.5s/4.1s recorded in the audit — expect measurable improvement, though exact numbers will vary run-to-run); confirm no request to `gsap-effects` or any GSAP chunk appears in the Network tab at all at this viewport. Resize to ≥1024px, reload, and confirm a GSAP-named chunk *does* load and the Hero scroll-scrub/sticky bar still work. Scroll to the reels section on any viewport and confirm the first reel video only starts playing once that section nears the viewport, not immediately on page load. Confirm the header/footer logo still renders crisply and at the same visual size as before.

- [ ] **Step 6: Commit**

```bash
git add src/scripts/main.js src/pages/index.astro src/layouts/BaseLayout.astro src/styles/styles.css src/components/Header.astro src/components/Footer.astro src/assets/logo-brotherstechcell.jpeg
git add -u public/
git commit -m "perf: gate reel autoplay and GSAP loading, fix render-blocking fonts, optimize logo"
```

---

## Task 10: Add a pause/play control to the Hero background video

**Files:**
- Modify: `src/components/Hero.astro:36-40` (`.hero-video-inner`)
- Modify: `src/styles/styles.css` (new `.hero-video-toggle` rules, `.hero-video-inner` positioning context)
- Modify: `src/scripts/main.js` (`setupHeroScrollVideo`)

**Interfaces:** none.

- [ ] **Step 1: Add the toggle button markup**

In `src/components/Hero.astro`, lines 36-40 currently read:
```astro
          <div class="hero-video-side scroll-reveal scroll-right">
            <div class="hero-video-inner">
              <video id="hero-scroll-video" src="/assets/hero-iphone-disassembly.mp4" autoplay loop muted playsinline
                preload="auto"></video>
            </div>
```
Change to:
```astro
          <div class="hero-video-side scroll-reveal scroll-right">
            <div class="hero-video-inner">
              <video id="hero-scroll-video" src="/assets/hero-iphone-disassembly.mp4" autoplay loop muted playsinline
                preload="auto"></video>
              <button id="hero-video-toggle" class="hero-video-toggle" aria-label="Pausar vídeo" aria-pressed="false">
                <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
                <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="display: none;"><path d="M8 5v14l11-7z" /></svg>
              </button>
            </div>
```

- [ ] **Step 2: Style the button, and hide it specifically where the video isn't auto-playing**

In `src/styles/styles.css`, `.hero-video-inner` currently reads (lines 654-665 area — confirm exact current content before editing, since Tasks 1-9 don't touch this block but line numbers may have shifted slightly from earlier edits in this same plan; search for `.hero-video-inner {` to find its current position):
```css
.hero-video-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  overflow: hidden; /* Oculta qualquer transbordo */
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
```
Add `position: relative;` to this rule (needed so the button can be positioned absolutely within it) — insert it as a new line anywhere in the existing declaration block, e.g. right after `display: flex;`:
```css
.hero-video-inner {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  background: transparent;
  overflow: hidden; /* Oculta qualquer transbordo */
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
```
Then add a new rule block anywhere after it (e.g. right after `#hero-scroll-video`'s rule):
```css
.hero-video-toggle {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: none;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
  z-index: 5;
}

.hero-video-toggle:hover {
  background: rgba(0, 0, 0, 0.65);
}

.hero-video-toggle:focus-visible {
  outline: 2px solid #FFFFFF;
  outline-offset: 2px;
}

.hero-video-toggle svg {
  width: 18px;
  height: 18px;
}

@media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
  .hero-video-toggle {
    display: none;
  }
}
```
(The last rule hides the button specifically in the one scenario where the video isn't auto-playing at all — desktop scroll-scrub mode, where `currentTime` is driven directly by the user's own scroll input, not by autoplay, so WCAG 2.2.2's pause requirement doesn't apply there. `.hero-video-side` is already `display: none` below 1024px via an existing rule, so the button is automatically hidden on mobile as a side effect of its ancestor being hidden — no separate mobile rule is needed. That leaves the button visible in exactly the one remaining case where the video does autoplay/loop and is visible: desktop width with `prefers-reduced-motion: reduce`.)

- [ ] **Step 3: Wire the toggle button, and stop the existing IntersectionObserver from overriding a manual pause**

In `src/scripts/main.js`, `setupHeroScrollVideo(signal)` currently starts:
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
    const playPromise = video.play();
```
Read the full current function (it continues through the `tryPlay` closure, the `video.error`/`NETWORK_NO_SOURCE` load guard, the `tryPlay()` call, and the `IntersectionObserver` block with `videoObserver.observe(heroSection)` / `signal.addEventListener("abort", () => videoObserver.disconnect())`) before editing, since this plan must not restate code that other tasks may have touched — this task only adds new lines, it does not rewrite any existing line in this function.

Add a `let userPaused = false;` declaration immediately after the `if (isDesktopScrollScrub) return;` guard, so `tryPlay` can be changed to respect it — change:
```js
  const tryPlay = () => {
    const playPromise = video.play();
```
to:
```js
  let userPaused = false;

  const tryPlay = () => {
    if (userPaused) return;
    const playPromise = video.play();
```
Find the existing `IntersectionObserver` callback (it currently does `entry.isIntersecting ? video.play().catch(() => {}) : video.pause()` inside `entries.forEach(entry => { ... })`) and change its intersecting branch from:
```js
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
```
to:
```js
            if (entry.isIntersecting) {
              if (!userPaused) video.play().catch(() => {});
            } else {
              video.pause();
            }
```
Finally, add the toggle button wiring at the very end of `setupHeroScrollVideo`, right before its closing `}` (after the existing `signal.addEventListener("abort", () => videoObserver.disconnect());` line):
```js

  const toggleBtn = document.getElementById("hero-video-toggle");
  if (toggleBtn) {
    const updateToggleUI = (paused) => {
      toggleBtn.setAttribute("aria-pressed", String(paused));
      toggleBtn.setAttribute("aria-label", paused ? "Reproduzir vídeo" : "Pausar vídeo");
      toggleBtn.querySelector(".icon-pause").style.display = paused ? "none" : "";
      toggleBtn.querySelector(".icon-play").style.display = paused ? "" : "none";
    };
    toggleBtn.addEventListener("click", () => {
      if (video.paused) {
        userPaused = false;
        video.play().catch(() => {});
        updateToggleUI(false);
      } else {
        userPaused = true;
        video.pause();
        updateToggleUI(true);
      }
    }, { signal });
  }
```

- [ ] **Step 4: Verify**

Run: `npx astro build`
Expected: succeeds, 298 pages.

Enable "prefers-reduced-motion: reduce" in DevTools at a desktop viewport (≥1024px) and reload the home page — confirm the pause button is now visible over the Hero video (bottom-right corner), the video is autoplaying/looping, and clicking the button pauses it (icon swaps to a play triangle, `aria-pressed` becomes `"true"`). Click again and confirm it resumes. Scroll the Hero section out of view and back into view while paused, and confirm it stays paused (does not auto-resume). Disable reduced-motion (still ≥1024px) and confirm the button disappears (scroll-scrub mode). At a mobile viewport (<1024px, any motion preference), confirm the button is not visible (the whole `.hero-video-side` is hidden there).

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro src/styles/styles.css src/scripts/main.js
git commit -m "feat: add pause/play control to Hero video for WCAG 2.2.2 compliance"
```

## Self-Review Notes (from the plan author)

- **Spec coverage:** all 8 clusters from `consolidated-findings.md` map to a task (Cluster 1→Task 1, Cluster 2→Task 2, Cluster 3→Task 3, Cluster 4→Tasks 4-5, Cluster 5→Task 6, Cluster 6→Task 7, Cluster 7→Tasks 1+8, Cluster 8→Task 9), plus the user-approved Hero pause button (Task 10). The one item explicitly deferred in the spec (typography/radius fragmentation, orphan-page linking) has no task, as intended.
- **Placeholder scan:** every step carries the exact current code and its exact replacement, gathered by reading the live files during planning — no "add appropriate handling" or "similar to Task N" placeholders.
- **Type/consistency check:** `setupMobileMenuToggle(signal)` (Task 1) is called with the same `pageSignal` variable name used by every other top-level call in the `astro:page-load` handler; the `contextSafe`/`mm.revert()` machinery Task 9 relies on (via the dynamic-import wrapper) is read, not modified, matching Task 9's own Global Constraint; Task 10's `userPaused` flag is scoped inside `setupHeroScrollVideo`'s closure, not module-level, so it can't leak into or collide with Task 9's separate `gsap-effects.js` module.
- **Sequencing note for the controller:** Tasks 1 and 5 both edit `initPricingSelector`/tab-handling code in `main.js`, and Task 1, Task 9, and Task 10 all edit `setupHeroScrollVideo`/the top-level `astro:page-load` handler in the same file — execute the tasks in the numbered order above (not in parallel) so each task's diff applies cleanly against the previous task's already-committed result, consistent with this plan's (and this project's established SDD practice's) rule against parallel implementer dispatch.
