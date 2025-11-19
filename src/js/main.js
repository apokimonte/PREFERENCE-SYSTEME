import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

(function () {
  const headerElement = document.querySelector(".header__element--center");
  const header = document.querySelector(".header");

  if (!headerElement || !header) return;

  headerElement.style.willChange = "transform";

  gsap.to(headerElement, {
    y: 200,
    scrollTrigger: {
      trigger: header,
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });
})();

const loadingWrapper = document.querySelector(".loading");

let hideTimeout = null;

if (loadingWrapper) loadingWrapper.style.transition = "opacity 0.2s ease";

const deleteMessage = document.querySelector(".section__third");

if (deleteMessage) deleteMessage.style.transition = "opacity 0.2s ease";

function showLoading() {
  if (!loadingWrapper) return;
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  loadingWrapper.style.display = "";

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

  hideTimeout = setTimeout(() => {
    if (loadingWrapper && loadingWrapper.style.opacity === "0")
      loadingWrapper.style.display = "none";
  }, 500);
}

function showDeleteMessage() {
  if (!deleteMessage) return;
  deleteMessage.style.display = "";

  requestAnimationFrame(() => {
    deleteMessage.style.opacity = "1";
  });
}

function hideDeleteMessage() {
  if (!deleteMessage) return;
  deleteMessage.style.opacity = "0.001";

  setTimeout(() => {
    if (deleteMessage && deleteMessage.style.opacity === "0")
      deleteMessage.style.display = "none";
  }, 200);
}

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

ScrollTrigger.create({
  trigger: "#trigger2",
  start: "center bottom",
  end: "center top",
  onEnter: showDeleteMessage,
  onLeave: hideDeleteMessage,
  onEnterBack: showDeleteMessage,
  onLeaveBack: hideDeleteMessage,
});

(function () {
  const section = document.querySelector(".section__first");
  if (!section) return;

  const bubbleLeft = section.querySelector(".section__first--left");
  const bubbleRight = section.querySelector(".section__first--right");
  const mecs = section.querySelector(".section__first--center");

  if (!bubbleLeft || !bubbleRight || !mecs) return;

  mecs.style.willChange = "transform";

  const setY = gsap.quickSetter(mecs, "y", "px");

  let currentY = 0;
  const SMOOTH = 0.15;

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

    currentY = lerp(currentY, delta, SMOOTH);

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

  requestAnimationFrame(update);
})();

(function () {
  const contentImages = document.querySelectorAll('[class^="content_image_"]');

  if (!contentImages.length) return;

  contentImages.forEach((img) => {
    img.style.willChange = "opacity, transform, filter";

    gsap.to(img, {
      scrollTrigger: {
        trigger: img,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const progress = self.progress;
          const clamped = Math.max(0, Math.min(1, progress));
          const opacity = clamped < 0.5 ? clamped * 2 : (1 - clamped) * 2;
          const parallaxY = (clamped - 0.5) * 20;
          const scale = 0.8 + clamped * 0.4;
          const rotation = (clamped - 0.5) * 8;
          const blur = (1 - clamped) * 0;
          const skewX = (clamped - 0.5) * 4;

          img.style.opacity = Math.max(0, Math.min(1, opacity));
          img.style.transform = `translateY(${parallaxY}px) scale(${scale}) rotate(${rotation}deg) skewX(${skewX}deg)`;
          img.style.filter = `blur(${blur}px)`;
        },
      },
      duration: 1,
    });
  });
})();
