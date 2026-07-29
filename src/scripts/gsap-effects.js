import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let mm;

document.addEventListener("astro:page-load", () => {
  mm?.revert();
  mm = gsap.matchMedia();

  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    initHeroScrollScrub();
    initStickyPriceBar();
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
