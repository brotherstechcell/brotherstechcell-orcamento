import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let mm;

document.addEventListener("astro:page-load", () => {
  mm?.revert();
  mm = gsap.matchMedia();

  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", (context, contextSafe) => {
    initHeroScrollScrub(contextSafe);
    initStickyPriceBar();
  });
});

function initHeroScrollScrub(contextSafe) {
  const video = document.getElementById("hero-scroll-video");
  const heroSection = document.getElementById("inicio");
  if (!video || !heroSection) return;

  // Same cross-document adoption issue documented in main.js's setupHeroScrollVideo():
  // Astro's ClientRouter can leave this element stuck in NETWORK_NO_SOURCE (with a
  // MEDIA_ERR_SRC_NOT_SUPPORTED error) after a client-side transition lands back on Home,
  // because the browser's own native autoplay attempt on cross-document adoption gets
  // rejected by Chromium's URL safety check before this handler ever runs. That leaves
  // `readyState` stuck at 0 and `loadedmetadata` never fires, so the ScrollTrigger below
  // would never be created. main.js's non-desktop code path already guards against this;
  // this desktop-only path needs the same load() reset. Harmless no-op on a normal first
  // load where nothing has failed.
  if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
    video.load();
  }

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
    // loadedmetadata fires asynchronously, after gsap.matchMedia()'s onMatch callback has
    // already returned, so ScrollTrigger.create() called directly from this listener would
    // fall outside the matchMedia Context's synchronous tracking window and never get
    // revert()'d on the next astro:page-load - a real leak, not just a theoretical one
    // (reproduced: 4 repeated Home<->inner-page transitions before video metadata finished
    // loading grew ScrollTrigger.getAll().length from 2 to 5). contextSafe() re-enters that
    // tracking window for setScrub()'s synchronous execution so the trigger stays trackable.
    video.addEventListener("loadedmetadata", contextSafe ? contextSafe(setScrub) : setScrub, {
      once: true,
    });
  }
}

function initStickyPriceBar() {
  const bar = document.getElementById("sticky-price-bar");
  const pricingSection = document.getElementById("telas-precos");
  const footer = document.querySelector(".footer-main");
  const floatingBtn = document.querySelector(".floating-whatsapp-container");
  if (!bar || !pricingSection || !footer) return;

  ScrollTrigger.create({
    trigger: pricingSection,
    start: "bottom top",
    endTrigger: footer,
    end: "top bottom",
    onToggle: (self) => {
      bar.classList.toggle("visible", self.isActive);
      floatingBtn?.classList.toggle("sticky-bar-active", self.isActive);
    },
  });
}
