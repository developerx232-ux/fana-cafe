"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  MENU_CATEGORIES,
  MENU_ITEMS,
  type MenuCategoryId,
  type MenuItem,
} from "@/data/menu";
import { gsap, registerGSAP } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";
import { useOrderDrawer } from "@/components/order-drawer/OrderDrawerProvider";

const CATEGORY_LABELS: Record<Exclude<MenuCategoryId, "all">, string> = {
  coffee: "Signature Coffee",
  smoothies: "Juice & Smoothies",
  heritage: "Feast Boards",
  platters: "Grills & Platters",
  wraps: "Wraps & Bites",
  patisserie: "Bakery & Patisserie",
};

export default function MenuShowcaseSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgAtmosphereRef = useRef<HTMLDivElement | null>(null);
  const headingBlockRef = useRef<HTMLDivElement | null>(null);
  const filterBarRef = useRef<HTMLDivElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Per-plate outer wrappers (positioned in 3D carousel space) and inner wrappers (cursor 3D float)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemInnerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const glowRef = useRef<HTMLDivElement | null>(null);
  const infoRef = useRef<HTMLDivElement | null>(null);

  // Continuous float index proxy animated smoothly by GSAP
  const posProxyRef = useRef<{ value: number }>({ value: 0 });

  // Mobile Touch drag gesture state
  const touchDragStateRef = useRef<{
    active: boolean;
    startX: number;
    startValue: number;
    moved: boolean;
  }>({
    active: false,
    startX: 0,
    startValue: 0,
    moved: false,
  });

  // State
  const [activeCategory, setActiveCategory] = useState<MenuCategoryId>("all");
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);

  const activeIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const queuedStepsRef = useRef(0);
  const executeNavigationRef = useRef<(dir: number) => void>(() => {});
  const accumXRef = useRef(0);
  const lastXRef = useRef<number | null>(null);

  // Damped 3D cursor physics targets (frame-rate independent ticker interpolation)
  const targetCursorRef = useRef({
    x: 0,
    y: 0,
    rotX: 0,
    rotY: 0,
    scale: 1,
    glowX: 0,
    glowY: 0,
  });
  const currentCursorRef = useRef({
    x: 0,
    y: 0,
    rotX: 0,
    rotY: 0,
    scale: 1,
    glowX: 0,
    glowY: 0,
  });

  const wheelAccumRef = useRef(0);
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDesktop = useMediaQuery("(min-width: 1024px)", true);
  const isTablet = useMediaQuery("(min-width: 640px)", true);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", false);

  const { startCustomizing } = useOrderDrawer();

  const filteredItems = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return MENU_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchesQuery =
        trimmed.length === 0 ||
        item.name.toLowerCase().includes(trimmed) ||
        item.subtitle.toLowerCase().includes(trimmed);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const itemCount = filteredItems.length;
  const safeActiveIndex =
    itemCount > 0 ? Math.min(activeIndex, itemCount - 1) : 0;
  const safeDisplayIndex =
    itemCount > 0 ? Math.min(displayIndex, itemCount - 1) : 0;
  const activeItem: MenuItem | null =
    itemCount > 0 ? filteredItems[safeDisplayIndex] : null;

  useEffect(() => {
    activeIndexRef.current = safeActiveIndex;
  }, [safeActiveIndex]);

  // ─── 3D / 2.5D Physical Depth Layout Engine ────────────────────────────────
  const apply3DLayout = useCallback(
    (floatPos: number) => {
      const stageWidth =
        stageRef.current?.clientWidth ||
        (isDesktop ? 1280 : isTablet ? 768 : 390);
      const spacing = isDesktop
        ? Math.min(stageWidth * 0.31, 410)
        : isTablet
          ? Math.min(stageWidth * 0.42, 310)
          : Math.min(stageWidth * 0.68, 255);

      itemRefs.current.forEach((el, idx) => {
        if (!el) return;
        const offset = idx - floatPos;
        const abs = Math.abs(offset);

        // Cull far-off items cleanly for performance
        if (abs > 2.35) {
          gsap.set(el, {
            opacity: 0,
            pointerEvents: "none",
            visibility: "hidden",
          });
          return;
        }

        const clamped = Math.min(abs, 2.2);
        const x = offset * spacing;

        // Physical depth: active plate scales to full size; neighbors gracefully recede
        const scale =
          abs <= 1
            ? 1.0 - abs * 0.28 // 1.0 (active) down to 0.72 (neighbor)
            : Math.max(0.46, 0.72 - (clamped - 1) * 0.22);

        const y = clamped * (isDesktop ? 20 : 14);
        const rotateY = reducedMotion
          ? 0
          : Math.max(-20, Math.min(20, -offset * 12));

        // Smooth opacity curve: active is 1.0, immediate neighbors are ~0.60
        const opacity =
          abs < 0.05
            ? 1
            : Math.max(
                0,
                1 - Math.pow(Math.min(abs / 2.15, 1), 1.1) * 0.94
              );

        // Depth blur: active item is tack-sharp (0px), neighbors soften gently (6-8px)
        const blurPx = reducedMotion
          ? 0
          : abs < 0.08
            ? 0
            : Math.min(abs * 5.5, 9);

        const brightness = Math.max(0.55, 1 - Math.min(abs, 1.6) * 0.22);

        gsap.set(el, {
          visibility: "visible",
          pointerEvents: abs < 1.35 ? "auto" : "none",
          x,
          y,
          scale,
          rotateY,
          opacity,
          zIndex: Math.round(50 - Math.min(abs, 3) * 12),
          filter:
            blurPx === 0 && brightness >= 0.99
              ? "none"
              : `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`,
          force3D: true,
        });
      });
    },
    [isDesktop, isTablet, reducedMotion]
  );

  // ─── Frame-Rate Independent 3D Floating Interpolator (GSAP Ticker) ─────────
  const updateCursorPhysics = useCallback(
    (dt: number) => {
      if (reducedMotion) return;

      const target = targetCursorRef.current;
      const current = currentCursorRef.current;

      // Exponential damping factor (lambda = 8.5) ensures silky, frame-rate independent movement
      const factor = 1 - Math.exp(-8.5 * dt);

      current.x += (target.x - current.x) * factor;
      current.y += (target.y - current.y) * factor;
      current.rotX += (target.rotX - current.rotX) * factor;
      current.rotY += (target.rotY - current.rotY) * factor;
      current.scale += (target.scale - current.scale) * factor;
      current.glowX += (target.glowX - current.glowX) * factor;
      current.glowY += (target.glowY - current.glowY) * factor;

      // Apply to active plate inner wrapper (isolated from carousel outer wrapper)
      const activeInner = itemInnerRefs.current[safeActiveIndex];
      if (activeInner) {
        gsap.set(activeInner, {
          x: current.x,
          y: current.y,
          rotateX: current.rotX,
          rotateY: current.rotY,
          scale: current.scale,
          force3D: true,
        });
      }

      // Apply to glow parallax
      if (glowRef.current) {
        gsap.set(glowRef.current, {
          x: current.glowX,
          y: current.glowY,
          force3D: true,
        });
      }
    },
    [safeActiveIndex, reducedMotion]
  );

  useEffect(() => {
    registerGSAP();

    const tickerFn = (_time: number, deltaTime: number) => {
      // Clamp dt to max 50ms to prevent jumps on tab switch
      const dt = Math.min(deltaTime / 1000, 0.05);
      updateCursorPhysics(dt);
    };

    gsap.ticker.add(tickerFn);
    return () => {
      gsap.ticker.remove(tickerFn);
    };
  }, [updateCursorPhysics]);

  // ─── Ultra-Smooth, Cinematic 0.88s Product Transition ───────────────────────
  const executeNavigation = useCallback(
    (dir: number) => {
      const currentIdx = activeIndexRef.current;
      const targetIdx = Math.min(itemCount - 1, Math.max(0, currentIdx + dir));

      if (targetIdx === currentIdx) {
        queuedStepsRef.current = 0;
        return;
      }

      isTransitioningRef.current = true;
      activeIndexRef.current = targetIdx;
      setActiveIndex(targetIdx);

      // Smoothly rebase cursor target to neutral during the transition
      targetCursorRef.current = {
        x: 0,
        y: 0,
        rotX: 0,
        rotY: 0,
        scale: 1,
        glowX: 0,
        glowY: 0,
      };
      accumXRef.current = 0;

      // Cinematic 0.88s ease: "power3.inOut" transition
      gsap.killTweensOf(posProxyRef.current);
      gsap.to(posProxyRef.current, {
        value: targetIdx,
        duration: 0.88,
        ease: "power3.inOut",
        onUpdate: () => {
          apply3DLayout(posProxyRef.current.value);
        },
        onComplete: () => {
          isTransitioningRef.current = false;

          // If visitor continued moving in the same direction during transition, execute queued step
          if (queuedStepsRef.current !== 0) {
            const nextDir = queuedStepsRef.current;
            queuedStepsRef.current = 0;
            executeNavigationRef.current(nextDir);
          }
        },
      });

      // Synchronize text update: fade out old text (0.26s), switch content at midpoint, fade in new text (0.50s)
      if (infoRef.current) {
        gsap.killTweensOf(infoRef.current);
        const textTl = gsap.timeline();
        textTl
          .to(infoRef.current, {
            opacity: 0,
            y: -8,
            duration: 0.26,
            ease: "power2.in",
            onComplete: () => {
              setDisplayIndex(targetIdx);
            },
          })
          .fromTo(
            infoRef.current,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.50,
              ease: "power3.out",
            }
          );
      } else {
        setDisplayIndex(targetIdx);
      }

      // Warm active spotlight glow: subtle expand, warm pulse, and elegant settle
      if (glowRef.current) {
        gsap.killTweensOf(glowRef.current);
        gsap.fromTo(
          glowRef.current,
          { scale: 0.85, opacity: 0.55 },
          {
            scale: 1.05,
            opacity: 1,
            duration: 0.88,
            ease: "power2.out",
            onComplete: () => {
              gsap.to(glowRef.current, {
                scale: 1.0,
                opacity: 0.92,
                duration: 0.60,
                ease: "power1.out",
              });
            },
          }
        );
      }
    },
    [itemCount, apply3DLayout]
  );

  useEffect(() => {
    executeNavigationRef.current = executeNavigation;
  }, [executeNavigation]);

  const requestNavigation = useCallback(
    (dir: number) => {
      if (isTransitioningRef.current) {
        // Limit queue to exactly 1 step in the same direction to keep browsing fully controlled
        if (
          queuedStepsRef.current === 0 ||
          Math.sign(queuedStepsRef.current) === Math.sign(dir)
        ) {
          queuedStepsRef.current = Math.sign(dir);
        }
        return;
      }
      executeNavigation(dir);
    },
    [executeNavigation]
  );

  const handleManualStep = useCallback(
    (targetIdx: number) => {
      const clamped = Math.min(itemCount - 1, Math.max(0, targetIdx));
      const dir = clamped - activeIndexRef.current;
      if (dir === 0) return;
      queuedStepsRef.current = 0; // Clear any pending queue on direct click
      executeNavigation(dir);
    },
    [itemCount, executeNavigation]
  );

  // ─── Section Entrance ScrollTrigger ────────────────────────────────────────
  useEffect(() => {
    registerGSAP();

    if (reducedMotion || !sectionRef.current) {
      if (bgAtmosphereRef.current) gsap.set(bgAtmosphereRef.current, { opacity: 1 });
      if (headingBlockRef.current) gsap.set(headingBlockRef.current, { opacity: 1, y: 0 });
      if (filterBarRef.current) gsap.set(filterBarRef.current, { opacity: 1, y: 0 });
      if (stageContainerRef.current) gsap.set(stageContainerRef.current, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const enterTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          once: true,
        },
      });

      enterTl
        .fromTo(
          bgAtmosphereRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1.2, ease: "power2.out" }
        )
        .fromTo(
          headingBlockRef.current,
          { opacity: 0, y: 28, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.85,
            ease: "power3.out",
          },
          "-=0.85"
        )
        .fromTo(
          filterBarRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.55"
        )
        .fromTo(
          stageContainerRef.current,
          { opacity: 0, y: 32, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.92,
            ease: "power3.out",
          },
          "-=0.5"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Re-layout whenever filtered list or viewport size changes
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, filteredItems.length);
    itemInnerRefs.current = itemInnerRefs.current.slice(0, filteredItems.length);
    posProxyRef.current.value = safeActiveIndex;
    apply3DLayout(safeActiveIndex);

    const onResize = () => apply3DLayout(posProxyRef.current.value);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [filteredItems.length, safeActiveIndex, apply3DLayout]);

  // Reset active position cleanly when changing category or search query
  const handleCategorySelect = (catId: MenuCategoryId) => {
    setActiveCategory(catId);
    setActiveIndex(0);
    setDisplayIndex(0);
    posProxyRef.current.value = 0;
    accumXRef.current = 0;
    lastXRef.current = null;
    queuedStepsRef.current = 0;
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
    setDisplayIndex(0);
    posProxyRef.current.value = 0;
    accumXRef.current = 0;
    lastXRef.current = null;
    queuedStepsRef.current = 0;
  };

  // ─── Central Stage: Ultra-Smooth Damped Cursor Physics & 36px Intent Navigation ──
  const handleStagePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || e.pointerType === "touch") return;
    lastXRef.current = e.clientX;
    accumXRef.current = 0;
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      handleTouchPointerMove(e);
      return;
    }

    if (reducedMotion || !stageRef.current) {
      return;
    }

    const rect = stageRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const relX = e.clientX - centerX;
    const relY = e.clientY - centerY;

    // Active interaction radius around the featured product (380px X / 220px Y)
    const isOverFeatured =
      Math.abs(relX) < (isDesktop ? 380 : 300) &&
      Math.abs(relY) < (isDesktop ? 220 : 180);

    if (isOverFeatured) {
      // 1. DAMPED TARGET COORDINATES (interpolated by GSAP ticker physics)
      const normX = Math.max(-1, Math.min(1, relX / 180));
      const normY = Math.max(-1, Math.min(1, relY / 130));

      targetCursorRef.current = {
        x: normX * 18,
        y: normY * 12,
        rotY: normX * 4.5,
        rotX: -normY * 4.0,
        scale: 1.025,
        glowX: normX * 10,
        glowY: normY * 7,
      };

      // 2. ACCUMULATED HORIZONTAL INTENT NAVIGATION
      if (lastXRef.current !== null) {
        const deltaX = e.clientX - lastXRef.current;

        // Ensure vertical movements (e.g. moving toward filters or CTA) do not trigger product changes
        if (Math.abs(relY) < 165 && Math.abs(deltaX) > 0) {
          if (
            accumXRef.current !== 0 &&
            Math.sign(deltaX) !== Math.sign(accumXRef.current)
          ) {
            // Reversing movement direction resets accumulator
            accumXRef.current = deltaX;
          } else {
            accumXRef.current += deltaX;
          }

          const INTENT_THRESHOLD = 36; // 36px intentional horizontal movement

          if (accumXRef.current >= INTENT_THRESHOLD) {
            accumXRef.current = 0;
            requestNavigation(1); // Next plate
          } else if (accumXRef.current <= -INTENT_THRESHOLD) {
            accumXRef.current = 0;
            requestNavigation(-1); // Previous plate
          }
        }
      }
      lastXRef.current = e.clientX;
    } else {
      // Outside active zone: gently settle to neutral
      targetCursorRef.current = {
        x: 0,
        y: 0,
        rotX: 0,
        rotY: 0,
        scale: 1,
        glowX: 0,
        glowY: 0,
      };
      lastXRef.current = null;
      accumXRef.current = 0;
    }
  };

  const handleStagePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || e.pointerType === "touch") return;
    targetCursorRef.current = {
      x: 0,
      y: 0,
      rotX: 0,
      rotY: 0,
      scale: 1,
      glowX: 0,
      glowY: 0,
    };
    lastXRef.current = null;
    accumXRef.current = 0;
  };

  // ─── Mobile Touch Drag / Flick Handling (Preserved for Touch Devices) ───────
  const handleTouchPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch" || itemCount <= 1) return;
    if ((e.target as HTMLElement).closest("button")) return;

    gsap.killTweensOf(posProxyRef.current);
    touchDragStateRef.current = {
      active: true,
      startX: e.clientX,
      startValue: posProxyRef.current.value,
      moved: false,
    };
  };

  const handleTouchPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!touchDragStateRef.current.active) return;
    const dx = e.clientX - touchDragStateRef.current.startX;
    if (Math.abs(dx) > 8) touchDragStateRef.current.moved = true;

    const dragUnit = 220;
    const rawPos = touchDragStateRef.current.startValue - dx / dragUnit;
    const bounded = Math.max(-0.35, Math.min(itemCount - 1 + 0.35, rawPos));

    posProxyRef.current.value = bounded;
    apply3DLayout(bounded);
  };

  const handleTouchPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!touchDragStateRef.current.active) return;
    const dx = e.clientX - touchDragStateRef.current.startX;
    const wasMoved = touchDragStateRef.current.moved;
    touchDragStateRef.current.active = false;

    if (!wasMoved) return;

    // Flick detection on mobile
    let target = Math.round(posProxyRef.current.value);
    if (Math.abs(dx) > 40 && target === Math.round(touchDragStateRef.current.startValue)) {
      target += dx < 0 ? 1 : -1;
    }
    const clamped = Math.min(itemCount - 1, Math.max(0, target));
    const dir = clamped - activeIndexRef.current;
    if (dir !== 0) executeNavigation(dir);
  };

  // ─── Trackpad Horizontal Swipe (Does Not Trap Normal Vertical Scroll) ───────
  const handleStageWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (itemCount <= 1) return;
    const isHorizontalGesture =
      Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
    if (!isHorizontalGesture) return;

    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    wheelAccumRef.current += delta;

    if (Math.abs(wheelAccumRef.current) >= 55) {
      const dir = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;
      requestNavigation(dir);
    }

    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(() => {
      wheelAccumRef.current = 0;
    }, 180);
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      requestNavigation(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      requestNavigation(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      handleManualStep(0);
    } else if (e.key === "End") {
      e.preventDefault();
      handleManualStep(itemCount - 1);
    }
  };

  return (
    <section
      id="menu"
      ref={sectionRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      aria-label="The Fana Menu"
      className="relative scroll-mt-20 overflow-hidden bg-fana-dark pt-28 pb-24 text-fana-cream focus:outline-none sm:pt-32 sm:pb-28 lg:pt-36 lg:pb-32"
    >
      {/* ─── Seamless Top & Bottom Section Continuity Feathers ────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-32 bg-gradient-to-b from-fana-dark via-fana-dark/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-fana-dark via-fana-dark/70 to-transparent"
      />

      {/* ─── Layered Atmospheric Espresso & Subtle Café Line Art ──────────── */}
      <div
        ref={bgAtmosphereRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden will-change-[opacity]"
      >
        {/* Warm espresso-brown & botanical ambient pools */}
        <div className="absolute left-1/2 top-[50%] h-[42rem] w-[62rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,90,43,0.18)_0%,rgba(245,158,11,0.06)_38%,transparent_72%)] blur-[80px]" />
        <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-fana-green/15 blur-[120px]" />
        <div className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-fana-wood/15 blur-[120px]" />

        {/* Subtle concentric coffee-ring arcs behind spotlight (9% opacity) */}
        <svg
          viewBox="0 0 1200 720"
          fill="none"
          className="absolute left-1/2 top-[53%] w-[960px] max-w-[140vw] -translate-x-1/2 -translate-y-1/2 opacity-[0.09]"
        >
          <circle
            cx="600"
            cy="360"
            r="215"
            stroke="#E8DFD5"
            strokeWidth="1"
            strokeDasharray="3 8"
          />
          <circle
            cx="600"
            cy="360"
            r="290"
            stroke="#F59E0B"
            strokeWidth="0.8"
            opacity="0.65"
          />
          <circle
            cx="600"
            cy="360"
            r="375"
            stroke="#8B5A2B"
            strokeWidth="0.7"
            strokeDasharray="10 14"
          />
          {/* Delicate rising coffee-steam curves */}
          <path
            d="M540 240 C510 185, 565 135, 535 72"
            stroke="#E8DFD5"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M600 220 C635 160, 575 110, 610 45"
            stroke="#F59E0B"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M660 245 C690 190, 645 140, 675 82"
            stroke="#E8DFD5"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>

        {/* Subtle botanical leaf line accents in outer corners */}
        <svg
          viewBox="0 0 260 320"
          fill="none"
          className="absolute -left-6 top-20 hidden w-56 opacity-[0.10] lg:block"
        >
          <path
            d="M20 300 C40 210, 110 130, 215 35"
            stroke="#E8DFD5"
            strokeWidth="1"
          />
          <path
            d="M72 224 C32 204, 24 156, 62 126 C92 152, 98 194, 72 224Z"
            stroke="#E8DFD5"
            strokeWidth="0.9"
          />
          <path
            d="M122 156 C158 142, 198 158, 210 198 C166 206, 134 188, 122 156Z"
            stroke="#F59E0B"
            strokeWidth="0.9"
          />
          <path
            d="M158 100 C124 80, 126 38, 166 20 C190 48, 188 82, 158 100Z"
            stroke="#E8DFD5"
            strokeWidth="0.9"
          />
        </svg>

        <svg
          viewBox="0 0 260 320"
          fill="none"
          className="absolute -right-6 bottom-16 hidden w-56 rotate-180 opacity-[0.09] lg:block"
        >
          <path
            d="M20 300 C40 210, 110 130, 215 35"
            stroke="#E8DFD5"
            strokeWidth="1"
          />
          <path
            d="M72 224 C32 204, 24 156, 62 126 C92 152, 98 194, 72 224Z"
            stroke="#E8DFD5"
            strokeWidth="0.9"
          />
          <path
            d="M122 156 C158 142, 198 158, 210 198 C166 206, 134 188, 122 156Z"
            stroke="#F59E0B"
            strokeWidth="0.9"
          />
          <path
            d="M158 100 C124 80, 126 38, 166 20 C190 48, 188 82, 158 100Z"
            stroke="#E8DFD5"
            strokeWidth="0.9"
          />
        </svg>
      </div>

      {/* ─── Main Content Container ──────────────────────────────────────── */}
      <div className="relative z-10 w-full px-5 sm:px-8 md:px-[clamp(1.75rem,6vw,6rem)]">
        {/* Editorial Heading + Search (Staggered Entrance on Scroll) */}
        <div
          ref={headingBlockRef}
          className="flex flex-col justify-between gap-6 will-change-[transform,opacity] lg:flex-row lg:items-end"
        >
          <div className="max-w-2xl space-y-2.5">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.26em] text-fana-gold">
              The Fana Menu
            </p>
            <h2 className="font-display text-3xl leading-[1.08] tracking-tight text-fana-cream sm:text-4xl lg:text-5xl">
              Crafted to Share. Savored at Your Table.
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-fana-cream/70 sm:text-base">
              Explore coffee, fresh smoothies, generous plates, and something sweet.
            </p>
          </div>

          {/* Sleek Dark Glass Search Input */}
          <div className="w-full max-w-sm">
            <label htmlFor="menu-search" className="sr-only">
              Search Fana Cafe menu
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fana-cream/45"
                aria-hidden="true"
              />
              <input
                id="menu-search"
                type="search"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search injera, smoothie, grill, cake..."
                className="w-full rounded-full border border-fana-cream/15 bg-fana-cream/[0.04] py-3 pl-11 pr-10 text-sm text-fana-cream placeholder:text-fana-cream/40 backdrop-blur-md transition focus:border-fana-gold/70 focus:bg-fana-cream/[0.07] focus:outline-none"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleQueryChange("")}
                  aria-label="Clear menu search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-fana-cream/55 transition hover:text-fana-gold"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div
          ref={filterBarRef}
          className="mt-8 flex flex-wrap items-center justify-between gap-4 will-change-[transform,opacity]"
          role="tablist"
          aria-label="Menu categories"
        >
          <div className="flex flex-wrap items-center gap-2">
            {MENU_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              const count =
                cat.id === "all"
                  ? MENU_ITEMS.length
                  : MENU_ITEMS.filter((i) => i.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold",
                    isSelected
                      ? "border-fana-gold bg-fana-gold text-fana-dark font-semibold shadow-[0_0_24px_rgba(245,158,11,0.28)]"
                      : "border-fana-cream/12 bg-fana-cream/[0.03] text-fana-cream/70 hover:border-fana-gold/45 hover:text-fana-cream"
                  )}
                >
                  <span>{cat.label}</span>
                  <span
                    className={cn(
                      "font-mono text-[10px]",
                      isSelected ? "text-fana-dark/75" : "text-fana-cream/40"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {itemCount > 0 && (
            <div className="font-mono text-xs tracking-[0.2em] text-fana-cream/65">
              <span className="font-semibold text-fana-gold">
                {String(safeActiveIndex + 1).padStart(2, "0")}
              </span>
              <span className="mx-1.5 text-fana-cream/30">/</span>
              <span>{String(itemCount).padStart(2, "0")}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── 3D Floating Cutout Carousel Stage Container ──────────────────── */}
      {itemCount === 0 ? (
        <div className="relative z-10 mx-auto mt-16 max-w-md px-6 text-center">
          <p className="font-display text-2xl text-fana-cream">
            No plates match “{query}”
          </p>
          <p className="mt-2 text-sm text-fana-cream/60">
            Try another keyword or return to the full Fana menu.
          </p>
          <button
            type="button"
            onClick={() => {
              handleQueryChange("");
              handleCategorySelect("all");
            }}
            className="mt-5 rounded-full bg-fana-gold px-6 py-2.5 text-xs font-semibold text-fana-dark transition hover:bg-fana-gold/90"
          >
            Show All {MENU_ITEMS.length} Plates
          </button>
        </div>
      ) : (
        <div
          ref={stageContainerRef}
          className="relative z-10 mt-8 will-change-[transform,opacity] sm:mt-10"
        >
          {/* Interactive 3D Stage with frame-rate independent damped physics & 36px intent navigation */}
          <div
            ref={stageRef}
            onPointerEnter={handleStagePointerEnter}
            onPointerMove={handleStagePointerMove}
            onPointerLeave={handleStagePointerLeave}
            onPointerDown={handleTouchPointerDown}
            onPointerUp={handleTouchPointerEnd}
            onPointerCancel={handleTouchPointerEnd}
            onWheel={handleStageWheel}
            style={{ perspective: "1200px" }}
            className="relative mx-auto flex h-[360px] w-full touch-pan-y select-none items-center justify-center overflow-visible sm:h-[430px] lg:h-[490px]"
          >
            {/* Layer 3: Warm Spotlight Bloom behind Active Floating Product (isolated transform) */}
            <div
              ref={glowRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
            >
              {/* Outer warm amber bloom */}
              <div className="h-[290px] w-[330px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.28)_0%,rgba(139,90,43,0.18)_42%,transparent_72%)] blur-[40px] sm:h-[360px] sm:w-[430px] lg:h-[410px] lg:w-[500px]" />
              {/* Inner soft radiant halo */}
              <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fana-gold/25 blur-[44px] sm:h-56 sm:w-56" />
            </div>

            {/* Subtle Grounded Floating Shadow beneath the Active Dish */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-4 left-1/2 h-10 w-56 -translate-x-1/2 rounded-full bg-black/70 blur-xl sm:bottom-6 sm:w-72 lg:w-80"
            />

            {/* Soft Left/Right Edge Vignettes so far products dissolve cleanly without obscuring incoming dishes */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-fana-dark via-fana-dark/50 to-transparent sm:w-16 lg:w-20"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-fana-dark via-fana-dark/50 to-transparent sm:w-16 lg:w-20"
            />

            {/* Floating Cutout Plates */}
            {filteredItems.map((item, idx) => {
              const isActive = idx === safeActiveIndex;
              const isNearby = Math.abs(idx - safeActiveIndex) <= 1;
              const aspect = item.imageWidth / item.imageHeight;
              const isWidePlatter = aspect >= 1.35 && aspect < 1.6;
              const isWidescreen = aspect >= 1.6;

              // Responsive dimensions tailored to actual food shape
              const sizeClasses = isWidescreen
                ? "w-[310px] h-[190px] sm:w-[430px] sm:h-[260px] lg:w-[510px] lg:h-[305px]"
                : isWidePlatter
                  ? "w-[300px] h-[220px] sm:w-[410px] sm:h-[295px] lg:w-[490px] lg:h-[345px]"
                  : "w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] lg:w-[410px] lg:h-[410px]";

              const imgSizes = isWidescreen
                ? "(max-width: 640px) 310px, (max-width: 1024px) 430px, 510px"
                : isWidePlatter
                  ? "(max-width: 640px) 300px, (max-width: 1024px) 410px, 490px"
                  : "(max-width: 640px) 260px, (max-width: 1024px) 340px, 410px";

              return (
                /* Layer 1: Outer Product Wrapper (controlled ONLY by carousel apply3DLayout) */
                <div
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  data-menu-plate={item.id}
                  data-active={isActive ? "true" : "false"}
                  onClick={() => {
                    if (!isActive) handleManualStep(idx);
                    else startCustomizing(item);
                  }}
                  style={{ perspective: "1000px" }}
                  className={cn(
                    "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center will-change-transform cursor-pointer",
                    sizeClasses,
                    isActive ? "z-30" : "z-20"
                  )}
                  title={isActive ? `Click to customize ${item.name}` : `Select ${item.name}`}
                >
                  {/* Layer 2: Inner Image Wrapper (controlled ONLY by damped 3D cursor physics) */}
                  <div
                    ref={(el) => {
                      itemInnerRefs.current[idx] = el;
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="relative flex h-full w-full items-center justify-center p-2.5 sm:p-3 will-change-transform"
                  >
                    <Image
                      src={item.imagePath}
                      alt={item.name}
                      width={item.imageWidth}
                      height={item.imageHeight}
                      loading={isNearby ? "eager" : "lazy"}
                      priority={idx === 0 && activeCategory === "all"}
                      draggable={false}
                      sizes={imgSizes}
                      className={cn(
                        "pointer-events-none max-h-full max-w-full h-auto w-auto object-contain select-none transition-[filter] duration-300",
                        item.isTransparentCutout
                          ? isActive
                            ? "drop-shadow-[0_26px_38px_rgba(0,0,0,0.85)]"
                            : "drop-shadow-[0_14px_22px_rgba(0,0,0,0.65)]"
                          : "rounded-2xl drop-shadow-[0_22px_32px_rgba(0,0,0,0.8)] [mask-image:radial-gradient(ellipse_94%_92%_at_50%_50%,black_75%,transparent_100%)]"
                      )}
                    />
                  </div>
                </div>
              );
            })}

            {/* Floating Left / Right Controls */}
            {itemCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => handleManualStep(safeActiveIndex - 1)}
                  disabled={safeActiveIndex === 0}
                  aria-label="Previous menu item"
                  className={cn(
                    "absolute left-3 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition sm:left-6 lg:left-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold",
                    safeActiveIndex === 0
                      ? "cursor-not-allowed border-fana-cream/10 bg-fana-dark/40 text-fana-cream/25"
                      : "border-fana-cream/20 bg-fana-dark/65 text-fana-cream hover:border-fana-gold hover:text-fana-gold"
                  )}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleManualStep(safeActiveIndex + 1)}
                  disabled={safeActiveIndex === itemCount - 1}
                  aria-label="Next menu item"
                  className={cn(
                    "absolute right-3 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition sm:right-6 lg:right-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold",
                    safeActiveIndex === itemCount - 1
                      ? "cursor-not-allowed border-fana-cream/10 bg-fana-dark/40 text-fana-cream/25"
                      : "border-fana-cream/20 bg-fana-dark/65 text-fana-cream hover:border-fana-gold hover:text-fana-gold"
                  )}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* ─── Layer 4: Product Information (Synchronized Transitions) ──── */}
          {activeItem && (
            <div
              ref={infoRef}
              className="mx-auto mt-2 flex max-w-2xl flex-col items-center px-6 text-center will-change-[transform,opacity]"
            >
              {/* Single Clean Category Label */}
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-fana-gold">
                {CATEGORY_LABELS[activeItem.category]}
              </span>

              {/* Product Name */}
              <h3 className="mt-2 font-display text-2xl leading-tight tracking-tight text-fana-cream sm:text-3xl lg:text-[2.25rem]">
                {activeItem.name}
              </h3>

              {/* Concise Description */}
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-fana-cream/70 sm:text-base">
                {activeItem.subtitle}
              </p>

              {/* Clean Action Row */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3.5">
                {activeItem.availableModifiers.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-fana-cream/15 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-fana-cream/70">
                    <SlidersHorizontal
                      className="h-3 w-3 text-fana-gold/80"
                      aria-hidden="true"
                    />
                    Customizable
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => startCustomizing(activeItem)}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-fana-gold px-6 text-sm font-semibold text-fana-dark shadow-[0_10px_28px_rgba(245,158,11,0.28)] transition hover:bg-fana-gold/90 hover:shadow-[0_12px_34px_rgba(245,158,11,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold focus-visible:ring-offset-2 focus-visible:ring-offset-fana-dark"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add to Order</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── Compact Progress & Quick-Jump Rail ───────────────────────── */}
          {itemCount > 1 && (
            <div className="mx-auto mt-9 max-w-xl px-6">
              <div className="flex items-center justify-center gap-1.5 overflow-hidden py-1">
                {filteredItems.map((item, idx) => {
                  const isActive = idx === safeActiveIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleManualStep(idx)}
                      aria-label={`View ${item.name}`}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold",
                        isActive
                          ? "w-7 bg-fana-gold shadow-[0_0_10px_rgba(245,158,11,0.55)]"
                          : "w-1.5 bg-fana-cream/20 hover:bg-fana-cream/50"
                      )}
                    />
                  );
                })}
              </div>

              <p className="mt-2.5 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-fana-cream/40">
                {isDesktop
                  ? "Hover over food for 3D float · Move cursor ~36px left or right to navigate"
                  : "Swipe or tap arrows to explore"}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
