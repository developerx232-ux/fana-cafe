/**
 * Lenis smooth scroll singleton synced with GSAP ScrollTrigger.
 * Automatically disables inertia smoothing when `prefers-reduced-motion: reduce` is active.
 */
import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGSAP } from "./gsap";

let lenisInstance: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;

export function initLenis(): Lenis | null {
  if (typeof window === "undefined") return null;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return null;

  if (lenisInstance) return lenisInstance;

  registerGSAP();

  lenisInstance = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.5,
    infinite: false,
  });

  lenisInstance.on("scroll", ScrollTrigger.update);

  tickerCallback = (time: number) => {
    lenisInstance?.raf(time * 1000);
  };
  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  return lenisInstance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function stopLenis(): void {
  lenisInstance?.stop();
}

export function startLenis(): void {
  lenisInstance?.start();
}

export function scrollToTarget(
  target: string | number | HTMLElement,
  options?: { offset?: number }
): void {
  const defaultOffset = typeof target === "number" ? 0 : -72;
  const offset = options?.offset ?? defaultOffset;

  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset });
  } else if (typeof target === "number") {
    window.scrollTo({ top: Math.max(0, target + offset), behavior: "auto" });
  } else if (typeof target === "string") {
    const el = document.querySelector(target);
    el?.scrollIntoView({ behavior: "auto", block: "start" });
  } else {
    target.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

export function destroyLenis(): void {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}
