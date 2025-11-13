import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const loadingWrapper = document.querySelector(".loading");

let hideTimeout = null;

// ensure a smooth opacity transition
if (loadingWrapper) loadingWrapper.style.transition = "opacity 0.2s ease";

const deleteMessage = document.querySelector(".section__third");

// ensure a smooth opacity transition for delete message
if (deleteMessage) deleteMessage.style.transition = "opacity 0.2s ease";

function showLoading() {
  if (!loadingWrapper) return;
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  loadingWrapper.style.display = "";
  // ensure layout applied before changing opacity
  requestAnimationFrame(() => {
    loadingWrapper.style.opacity = "1";
    loadingWrapper.style.pointerEvents = "";
  });
}

function hideLoading() {
  if (!loadingWrapper) return;
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  loadingWrapper.style.opacity = "0";
  loadingWrapper.style.pointerEvents = "none";
  // delay setting display none to avoid flashes while scrub animates opacity
  hideTimeout = setTimeout(() => {
    if (loadingWrapper && loadingWrapper.style.opacity === "0")
      loadingWrapper.style.display = "none";
  }, 500); // 0.5s delay
}

function showDeleteMessage() {
  if (!deleteMessage) return;
  deleteMessage.style.display = "";
  // ensure layout applied before changing opacity
  requestAnimationFrame(() => {
    deleteMessage.style.opacity = "1";
  });
}

function hideDeleteMessage() {
  if (!deleteMessage) return;
  deleteMessage.style.opacity = "0.001";
  // delay setting display none
  setTimeout(() => {
    if (deleteMessage && deleteMessage.style.opacity === "0")
      deleteMessage.style.display = "none";
  }, 200); // 0.2s delay
}

// start hidden before trigger
hideLoading();
hideDeleteMessage();

gsap.fromTo(
  ".progress__loading",
  { width: "0%" },
  {
    width: "100%",
    ease: "none",
    scrollTrigger: {
      trigger: "#trigger2",
      start: "center center",
      end: "center top",
      scrub: true,
      pin: true,
      onUpdate: (self) => {
        const percent = (self.progress * 100).toFixed(2);
        const el = document.querySelector(".progress_text");
        if (el) el.textContent = `${percent}%`;

        // show while between start and end, hide at the very start or at the end
        if (self.progress > 0 && self.progress < 1) {
          showLoading();
        } else {
          hideLoading();
        }
      },
      onEnter: () => {
        showLoading();
        hideDeleteMessage();
      },
      onEnterBack: () => {
        showLoading();
        hideDeleteMessage();
      },
      onLeave: hideLoading,
      onLeaveBack: hideLoading,
    },
  }
);

// Separate ScrollTrigger for .delete-message
ScrollTrigger.create({
  trigger: "#trigger2",
  start: "center bottom",
  end: "center top",
  onEnter: showDeleteMessage,
  onLeave: hideDeleteMessage,
  onEnterBack: showDeleteMessage,
  onLeaveBack: hideDeleteMessage,
});

// ...existing code...
(function () {
  const section = document.querySelector(".section__first");
  if (!section) return;

  const bubbleLeft = section.querySelector(".section__first--left"); // bulle_3
  const bubbleRight = section.querySelector(".section__first--right"); // bulle_4
  const mecs = section.querySelector(".section__first--center"); // MECS 2

  if (!bubbleLeft || !bubbleRight || !mecs) return;

  // perf hint
  mecs.style.willChange = "transform";

  // use GSAP quickSetter for smooth GPU-backed translation on the Y axis
  const setY = gsap.quickSetter(mecs, "y", "px");

  let currentY = 0; // used for lerp smoothing
  const SMOOTH = 0.15; // 0 = no movement, 1 = instant. Ajuste pour plus/moins de lissage.

  function clamp(v, a = 0, b = 1) {
    return Math.min(b, Math.max(a, v));
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function update() {
    const rectSection = section.getBoundingClientRect();
    const sectionTopDoc = window.scrollY + rectSection.top;
    const sectionHeight = rectSection.height;
    const viewportH = window.innerHeight;
    const scrollY = window.scrollY;

    const progress = clamp(
      (scrollY + viewportH - sectionTopDoc) / (sectionHeight + viewportH),
      0,
      1
    );

    const leftRect = bubbleLeft.getBoundingClientRect();
    const rightRect = bubbleRight.getBoundingClientRect();
    const mecsRect = mecs.getBoundingClientRect();

    const leftCenterDocY = window.scrollY + leftRect.top + leftRect.height / 2;
    const rightCenterDocY =
      window.scrollY + rightRect.top + rightRect.height / 2;
    const mecsCenterDocY = window.scrollY + mecsRect.top + mecsRect.height / 2;

    const targetCenterDocY = lerp(leftCenterDocY, rightCenterDocY, progress);
    const delta = targetCenterDocY - mecsCenterDocY;

    // Smoothly interpolate the applied Y so movement is less jittery
    currentY = lerp(currentY, delta, SMOOTH);

    // apply via GSAP quickSetter (uses translate3d under the hood)
    setY(currentY);
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(update));
  // initial
  requestAnimationFrame(update);
})();
// ...existing code...
