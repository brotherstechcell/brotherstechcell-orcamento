import { animate, inView } from "motion";

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

// NOTE: Hero word-by-word text reveal (initHeroTextReveal) is deferred.
// The brief's implementation depends on `splitText`, which is NOT part of
// the installed "motion" package (v12.42.2) — it is a `motion-plus` feature
// (a separate, paid add-on package that is not installed and not in
// package.json). Importing it from "motion" fails `astro build` with:
//   [MISSING_EXPORT] "splitText" is not exported by
//   "node_modules/motion/dist/es/index.mjs"
// Hero.astro and styles.css were intentionally left untouched so the
// existing scroll-reveal entrance animation on the H1 keeps working
// unchanged until this is resolved (install motion-plus, hand-roll a
// word-split helper, or pick a different reveal approach).

document.addEventListener("astro:page-load", () => {
  initCounterAnimation();
});
