import { animate, inView, stagger } from "motion";

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

    const stop = inView(el, () => {
      el.textContent = `${prefix}0${suffix}`;
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

  heroTitle.style.opacity = "1";

  // motion-plus's text-splitting helper (a paid add-on) isn't available in
  // the installed "motion" package, so words are split manually here. Text
  // nodes are split into per-word spans; non-text child nodes (e.g. the
  // `.text-gradient` span around "na Sua Frente") are moved as-is so their
  // existing styling is preserved, and animate as a single stagger unit
  // rather than being split further.
  const words = [];
  const childNodes = Array.from(heroTitle.childNodes);
  const fragment = document.createDocumentFragment();

  childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/\s+/).filter((part) => part.length > 0);
      parts.forEach((part) => {
        const span = document.createElement("span");
        span.textContent = part;
        span.style.display = "inline-block";
        fragment.appendChild(span);
        fragment.appendChild(document.createTextNode(" "));
        words.push(span);
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.style.display = "inline-block";
      fragment.appendChild(node);
      fragment.appendChild(document.createTextNode(" "));
      words.push(node);
    }
    // any other node type (comments, etc.) is intentionally dropped — nothing to animate
  });

  heroTitle.textContent = "";
  heroTitle.appendChild(fragment);

  animate(words, { opacity: [0, 1], y: [12, 0] }, { duration: 0.5, delay: stagger(0.04) });
}

document.addEventListener("astro:page-load", () => {
  initCounterAnimation();
  initHeroTextReveal();
});
