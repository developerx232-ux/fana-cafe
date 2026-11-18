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
import { gsap, ScrollTrigger, registerGSAP } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";
import { useOrderDrawer } from "@/components/order-drawer/OrderDrawerProvider";

const CATEGORY_LABELS: Record<Exclude<MenuCategoryId, "all">, string> = {
  coffee: "Signature Coffee",
  smoothies: "Fana Juice & Smoothies",
  heritage: "Feast Boards",
  platters: "Grills & Platters",
  wraps: "Wraps & Bites",
  patisserie: "Bakery & Patisserie",
};

// Positive modulo helper for circular wrapping calculations
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export default function MenuShowcaseSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const infoRef = useRef<HTMLDivElement | null>(null);

  // Continuous float index proxy animated smoothly by GSAP
  const posProxyRef = useRef<{ value: number }>({ value: 0 });
  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startValue: number;
    moved: boolean;
  }>({ active: false, startX: 0, startValue: 0, moved: false });
  const wheelAccumRef = useRef(0);
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualOverrideRef = useRef(false);

  // Horizontal pointer movement / velocity physics state
  const pointerPhysicsRef = useRef<{
    lastX: number | null;
    velocity: number;
    targetVelocity: number;
    rafId: number | null;
    active: boolean;
  }>({
    lastX: null,
    velocity: 0,
    targetVelocity: 0,
    rafId: null,
    active: false,
  });

  const [activeCategory, setActiveCategory] = useState<MenuCategoryId>("all");
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

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

  // Virtual track items so wrapping is completely invisible outside the viewport cone (abs > 2.6)
  const { displayItems, trackCount, originalCount } = useMemo(() => {
    const n = filteredItems.length;
    if (n <= 1) {
      return {
        displayItems: filteredItems.map((item, originalIdx) => ({
          item,
          virtualKey: `${item.id}-0`,
          originalIdx,
        })),
        trackCount: n,
        originalCount: n,
      };
    }
    // Ensure at least 8 virtual slots so antipodal point (trackCount / 2 >= 4) is well beyond visible range (2.6)
    const repeats = Math.max(1, Math.ceil(8 / n));
    const items: { item: MenuItem; virtualKey: string; originalIdx: number }[] = [];
    for (let r = 0; r < repeats; r++) {
      filteredItems.forEach((item, originalIdx) => {
        items.push({
          item,
          virtualKey: `${item.id}-${r}`,
          originalIdx,
        });
      });
    }
    return {
      displayItems: items,
      trackCount: items.length,
      originalCount: n,
    };
  }, [filteredItems]);

  const safeActiveIndex = originalCount > 0 ? mod(activeIndex, originalCount) : 0;
  const activeItem: MenuItem | null =
    originalCount > 0 ? filteredItems[safeActiveIndex] : null;

  // Apply 2.5D / 3D perspective transforms to every item based on continuous float position
  // Uses smooth continuous cosine curves so scale, brightness, and opacity transition seamlessly
  // with ZERO derivative at the center (no sudden popping, jumping, or snapping).
  // Infinite circular wrapping: each item calculates its shortest signed distance along the circle.
  const apply3DLayout = useCallback(
    (floatPos: number) => {
      const stageWidth = stageRef.current?.clientWidth || (isDesktop ? 1280 : isTablet ? 768 : 390);
      const spacing = isDesktop
        ? Math.min(stageWidth * 0.31, 410)
        : isTablet
          ? Math.min(stageWidth * 0.42, 310)
          : Math.min(stageWidth * 0.68, 255);

      itemRefs.current.forEach((el, idx) => {
        if (!el) return;

        // Calculate continuous circular offset on a circle of length trackCount
        let offset = idx - floatPos;
        if (trackCount > 1) {
          offset = mod(idx - floatPos + trackCount * 0.5, trackCount) - trackCount * 0.5;
        }
        const abs = Math.abs(offset);

        // Hide far items cleanly for performance and uncluttered composition
        if (abs > 2.6) {
          gsap.set(el, {
            opacity: 0,
            pointerEvents: "none",
            visibility: "hidden",
          });
          return;
        }

        const x = offset * spacing;

        // Continuous cosine curve for scale: crests smoothly at 1.08 at abs=0 (slope=0, no peak jump)
        // and gracefully tapers down to 0.58 at abs=2.2
        const tScale = Math.min(abs / 2.2, 1);
        const scale = 0.58 + 0.50 * 0.5 * (1 + Math.cos(tScale * Math.PI));

        // Smooth elevation curve (slight downward arc as plates move away from center)
        const y = (1 - 0.5 * (1 + Math.cos(tScale * Math.PI))) * (isDesktop ? 20 : 14);

        // Continuous 3D rotation
        const rotateY = reducedMotion ? 0 : Math.max(-20, Math.min(20, -offset * 12));

        // Continuous cosine opacity: 1.0 at center, fades smoothly to 0 at edges with zero pop
        const tOp = Math.min(abs / 2.4, 1);
        const opacity = Math.max(0, 0.5 * (1 + Math.cos(tOp * Math.PI)));

        // Continuous brightness: 1.000 at center, gently dips to 0.68 for side items
        // Keeping brightness filter strictly continuous prevents GPU layer re-rasterization jumps
        const tBr = Math.min(abs / 2.0, 1);
        const brightness = 0.68 + 0.32 * 0.5 * (1 + Math.cos(tBr * Math.PI));

        gsap.set(el, {
          visibility: "visible",
          pointerEvents: abs < 1.2 ? "auto" : "none",
          x,
          y,
          scale,
          rotateY,
          opacity,
          zIndex: Math.round(50 - abs * 10),
          filter: `brightness(${brightness.toFixed(3)})`,
          force3D: true,
        });
      });
    },
    [isDesktop, isTablet, reducedMotion, trackCount]
  );

  // Smooth GSAP glide to target float position (unbounded infinite track)
  const snapToPosition = useCallback(
    (targetPos: number, immediate = false) => {
      if (originalCount === 0) return;
      const nearestOrig = mod(Math.round(targetPos), originalCount);
      setActiveIndex(nearestOrig);

      gsap.killTweensOf(posProxyRef.current);

      if (immediate || reducedMotion) {
        posProxyRef.current.value = targetPos;
        apply3DLayout(targetPos);
        return;
      }

      gsap.to(posProxyRef.current, {
        value: targetPos,
        duration: 0.52,
        ease: "power2.out",
        onUpdate: () => {
          apply3DLayout(posProxyRef.current.value);
        },
      });
    },
    [originalCount, reducedMotion, apply3DLayout]
  );

  // Re-layout whenever filtered list or viewport size changes
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, displayItems.length);
    posProxyRef.current.value = safeActiveIndex;
    apply3DLayout(safeActiveIndex);

    const onResize = () => apply3DLayout(posProxyRef.current.value);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [displayItems.length, safeActiveIndex, apply3DLayout]);

  // Subtle editorial info crossfade when active plate changes (no sudden position jumps)
  useEffect(() => {
    if (reducedMotion || !activeItem) return;

    if (infoRef.current) {
      gsap.fromTo(
        infoRef.current,
        { opacity: 0.35 },
        { opacity: 1, duration: 0.28, ease: "power1.out" }
      );
    }
  }, [activeItem, reducedMotion]);

  // Desktop: non-trapping ScrollTrigger gentle forward/backward preview sweep across opening plates
  useEffect(() => {
    if (
      !isDesktop ||
      reducedMotion ||
      !sectionRef.current ||
      originalCount <= 1 ||
      activeCategory !== "all" ||
      query.trim().length > 0
    ) {
      return;
    }

    registerGSAP();

    const maxPreviewStep = Math.min(3, originalCount - 1);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 62%",
        end: "bottom 38%",
        scrub: true,
        onUpdate: (self) => {
          if (manualOverrideRef.current || dragStateRef.current.active) return;
          const nextFloat = self.progress * maxPreviewStep;
          posProxyRef.current.value = nextFloat;
          apply3DLayout(nextFloat);
          const nearest = mod(Math.round(nextFloat), originalCount);
          setActiveIndex((prev) => (prev === nearest ? prev : nearest));
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isDesktop, reducedMotion, originalCount, activeCategory, query, apply3DLayout]);

  // Reset active position cleanly when changing category or search query
  const handleCategorySelect = (catId: MenuCategoryId) => {
    manualOverrideRef.current = true;
    setActiveCategory(catId);
    setActiveIndex(0);
    posProxyRef.current.value = 0;
  };

  const handleQueryChange = (value: string) => {
    manualOverrideRef.current = true;
    setQuery(value);
    setActiveIndex(0);
    posProxyRef.current.value = 0;
  };

  // Step forward or backward by delta (infinite looping in either direction)
  const handleStepBy = useCallback(
    (step: number) => {
      manualOverrideRef.current = true;
      const current = posProxyRef.current.value;
      const target = Math.round(current) + step;
      snapToPosition(target);
    },
    [snapToPosition]
  );

  // Click directly on a plate to center it via shortest path
  const handlePlateClick = useCallback(
    (virtualIdx: number) => {
      if (dragStateRef.current.moved) return;
      manualOverrideRef.current = true;
      const floatPos = posProxyRef.current.value;
      const offset =
        trackCount > 1
          ? mod(virtualIdx - floatPos + trackCount * 0.5, trackCount) - trackCount * 0.5
          : 0;
      if (Math.abs(offset) > 0.05) {
        snapToPosition(floatPos + offset);
      }
    },
    [trackCount, snapToPosition]
  );

  // Click on a pagination dot to jump via shortest circular path
  const handleDotClick = useCallback(
    (targetOrigIdx: number) => {
      manualOverrideRef.current = true;
      const floatPos = posProxyRef.current.value;
      const currentActive = mod(Math.round(floatPos), originalCount);
      const delta =
        mod(targetOrigIdx - currentActive + originalCount * 0.5, originalCount) -
        originalCount * 0.5;
      snapToPosition(Math.round(floatPos) + delta);
    },
    [originalCount, snapToPosition]
  );

  // Pointer / Touch Horizontal Drag with unbounded infinite track
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (originalCount <= 1) return;
    // Do not hijack button clicks
    if ((e.target as HTMLElement).closest("button")) return;

    manualOverrideRef.current = true;
    gsap.killTweensOf(posProxyRef.current);
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startValue: posProxyRef.current.value,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    const dx = e.clientX - dragStateRef.current.startX;
    if (Math.abs(dx) > 6) dragStateRef.current.moved = true;

    const dragUnit = isDesktop ? 320 : 210;
    const nextPos = dragStateRef.current.startValue - dx / dragUnit;

    posProxyRef.current.value = nextPos;
    apply3DLayout(nextPos);

    const nearest = mod(Math.round(nextPos), originalCount);
    setActiveIndex((prev) => (prev === nearest ? prev : nearest));
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    const dx = e.clientX - dragStateRef.current.startX;
    dragStateRef.current.active = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    // Light flick advances one plate cleanly; otherwise snap to nearest
    let target = Math.round(posProxyRef.current.value);
    if (Math.abs(dx) > 45 && target === Math.round(dragStateRef.current.startValue)) {
      target += dx < 0 ? 1 : -1;
    }
    snapToPosition(target);
  };

  // Trackpad horizontal swipe / Shift+Wheel glides products infinitely without blocking normal vertical scroll
  const handleStageWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (originalCount <= 1) return;
    const isHorizontalGesture =
      Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
    if (!isHorizontalGesture) return;

    e.preventDefault();
    manualOverrideRef.current = true;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    wheelAccumRef.current += delta;

    if (Math.abs(wheelAccumRef.current) >= 55) {
      const dir = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;
      handleStepBy(dir);
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
      handleStepBy(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handleStepBy(-1);
    }
  };

  // ── Horizontal Pointer-Movement-Controlled Speed & Inertia ──
  // Responds directly to cursor movement velocity with infinite seamless wrap:
  // - Cursor moving left moves the carousel left
  // - Cursor moving right moves the carousel right
  // - Faster movement = higher velocity, slower movement = lower velocity
  // - When cursor stops moving, motion smoothly decelerates and comes to rest
  // - Resting cursor does NOT continuously scroll
  // - Infinite seamless looping in both directions without edge clamping or popping
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || originalCount <= 1 || reducedMotion) return;

    const physics = pointerPhysicsRef.current;

    const tick = () => {
      // If user is dragging or touching, suspend cursor hover velocity
      if (dragStateRef.current.active) {
        physics.velocity = 0;
        physics.targetVelocity = 0;
        physics.rafId = requestAnimationFrame(tick);
        return;
      }

      // Smoothly blend towards target velocity
      // Target velocity rapidly decays when mouse stops moving
      physics.targetVelocity *= 0.82;
      physics.velocity = physics.velocity * 0.84 + physics.targetVelocity * 0.16;

      if (Math.abs(physics.velocity) > 0.0001) {
        const nextPos = posProxyRef.current.value + physics.velocity;

        posProxyRef.current.value = nextPos;
        apply3DLayout(nextPos);

        const nearest = mod(Math.round(nextPos), originalCount);
        setActiveIndex((prev) => (prev === nearest ? prev : nearest));
      } else {
        physics.velocity = 0;
      }

      physics.rafId = requestAnimationFrame(tick);
    };

    const handleMove = (e: PointerEvent) => {
      if (dragStateRef.current.active) {
        physics.lastX = e.clientX;
        return;
      }

      if (physics.lastX === null) {
        physics.lastX = e.clientX;
        return;
      }

      const dx = e.clientX - physics.lastX;
      physics.lastX = e.clientX;

      // Sensitivity: map horizontal pixel displacement to carousel item offset
      // Moving cursor left (dx < 0) moves carousel left (pos increases)
      // Moving cursor right (dx > 0) moves carousel right (pos decreases)
      const stageWidth = stage.clientWidth || 1000;
      const sensitivity = 1.35 / stageWidth;

      physics.targetVelocity -= dx * sensitivity;
      // Cap maximum velocity to keep movement natural, elegant, and readable
      physics.targetVelocity = Math.max(-0.24, Math.min(0.24, physics.targetVelocity));

      if (!physics.active) {
        physics.active = true;
        manualOverrideRef.current = true;
        gsap.killTweensOf(posProxyRef.current);
      }
    };

    const handleLeave = () => {
      physics.lastX = null;
      physics.targetVelocity = 0;
    };

    // Fine pointer only (mouse / trackpad pointer movement)
    const mql = window.matchMedia("(pointer: fine)");
    if (!mql.matches) return;

    physics.rafId = requestAnimationFrame(tick);
    stage.addEventListener("pointermove", handleMove, { passive: true });
    stage.addEventListener("pointerleave", handleLeave, { passive: true });

    return () => {
      stage.removeEventListener("pointermove", handleMove);
      stage.removeEventListener("pointerleave", handleLeave);
      if (physics.rafId) {
        cancelAnimationFrame(physics.rafId);
        physics.rafId = null;
      }
      physics.active = false;
      physics.lastX = null;
      physics.velocity = 0;
      physics.targetVelocity = 0;
    };
  }, [originalCount, reducedMotion, apply3DLayout]);

  return (
    <section
      id="menu"
      ref={sectionRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      aria-label="The Fana Menu"
      className="relative overflow-hidden bg-fana-dark py-24 text-fana-cream focus:outline-none sm:py-32"
    >
      {/* ─── Seamless Top & Bottom Section Continuity Feathers ────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-36 bg-gradient-to-b from-fana-dark via-fana-dark/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-36 bg-gradient-to-t from-fana-dark via-fana-dark/70 to-transparent"
      />

      {/* ─── Layered Atmospheric Espresso & Subtle Café Line Art (5–15% Opacity) ─ */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Warm espresso-brown & botanical ambient pools */}
        <div className="absolute left-1/2 top-[50%] h-[42rem] w-[62rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,90,43,0.18)_0%,rgba(245,158,11,0.06)_38%,transparent_72%)] blur-[80px]" />
        <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-fana-green/15 blur-[120px]" />
        <div className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-fana-wood/15 blur-[120px]" />

        {/* Subtle concentric coffee-ring arcs behind spotlight (8% opacity) */}
        <svg
          viewBox="0 0 1200 720"
          fill="none"
          className="absolute left-1/2 top-[53%] w-[960px] max-w-[140vw] -translate-x-1/2 -translate-y-1/2 opacity-[0.09]"
        >
          <circle cx="600" cy="360" r="215" stroke="#E8DFD5" strokeWidth="1" strokeDasharray="3 8" />
          <circle cx="600" cy="360" r="290" stroke="#F59E0B" strokeWidth="0.8" opacity="0.65" />
          <circle cx="600" cy="360" r="375" stroke="#8B5A2B" strokeWidth="0.7" strokeDasharray="10 14" />
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

        {/* Subtle botanical leaf line accents in outer corners (10% opacity) */}
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
            stroke="#F59E0B"
            strokeWidth="0.9"
          />
          <path
            d="M122 156 C158 142, 198 158, 210 198 C166 206, 134 188, 122 156Z"
            stroke="#E8DFD5"
            strokeWidth="0.9"
          />
        </svg>
      </div>

      {/* ─── Main Content Container ──────────────────────────────────────── */}
      <div className="relative z-10 w-full px-5 sm:px-8 md:px-[clamp(1.75rem,6vw,6rem)]">
        {/* Editorial Heading + Search */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
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
          className="mt-8 flex flex-wrap items-center justify-between gap-4"
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

          {originalCount > 0 && (
            <div className="font-mono text-xs tracking-[0.2em] text-fana-cream/65">
              <span className="font-semibold text-fana-gold">
                {String(safeActiveIndex + 1).padStart(2, "0")}
              </span>
              <span className="mx-1.5 text-fana-cream/30">/</span>
              <span>{String(originalCount).padStart(2, "0")}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── 3D / 2.5D Floating Cutout Carousel Stage ─────────────────────── */}
      {originalCount === 0 ? (
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
        <div className="relative z-10 mt-8 sm:mt-10">
          {/* Interactive 3D Stage */}
          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onWheel={handleStageWheel}
            style={{ perspective: "1200px" }}
            className={cn(
              "relative mx-auto flex h-[320px] w-full touch-pan-y select-none items-center justify-center overflow-hidden sm:h-[390px] lg:h-[450px]",
              originalCount > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
            )}
          >
            {/* Warm Café Spotlight Glow behind Active Floating Product */}
            <div
              ref={glowRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              {/* Outer warm wood-amber bloom */}
              <div className="h-[300px] w-[340px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.24)_0%,rgba(139,90,43,0.16)_42%,transparent_72%)] blur-[36px] sm:h-[370px] sm:w-[440px] lg:h-[420px] lg:w-[520px]" />
              {/* Soft inner halo */}
              <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fana-gold/20 blur-[48px] sm:h-56 sm:w-56" />
            </div>

            {/* Subtle Grounded Floating Shadow beneath the Active Dish */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-6 left-1/2 h-10 w-56 -translate-x-1/2 rounded-full bg-black/70 blur-xl sm:bottom-8 sm:w-72 lg:w-80"
            />

            {/* Soft Left/Right Edge Vignettes so far products dissolve cleanly */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-30 w-12 bg-gradient-to-r from-fana-dark to-transparent sm:w-24 lg:w-36"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-30 w-12 bg-gradient-to-l from-fana-dark to-transparent sm:w-24 lg:w-36"
            />

            {/* Floating Cutout Plates (Virtual Loop Display) */}
            {displayItems.map((entry, idx) => {
              const { item, virtualKey, originalIdx } = entry;
              const isActive = originalIdx === safeActiveIndex;

              return (
                <div
                  key={virtualKey}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  data-menu-plate={item.id}
                  data-virtual-idx={idx}
                  data-active={isActive ? "true" : "false"}
                  onClick={() => handlePlateClick(idx)}
                  className={cn(
                    "absolute left-1/2 top-1/2 flex h-[240px] w-[260px] -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-[310px] sm:w-[340px] lg:h-[370px] lg:w-[410px] will-change-transform",
                    !isActive && "cursor-pointer"
                  )}
                >
                  <Image
                    src={item.imagePath}
                    alt={item.name}
                    width={item.imageWidth}
                    height={item.imageHeight}
                    {...(idx === 0 && activeCategory === "all"
                      ? { priority: true }
                      : { loading: "lazy" }
                    )}
                    draggable={false}
                    sizes="(max-width: 640px) 260px, (max-width: 1024px) 340px, 410px"
                    className={cn(
                      "pointer-events-none max-h-full max-w-full h-auto w-auto object-contain select-none",
                      item.isTransparentCutout
                        ? "drop-shadow-[0_22px_32px_rgba(0,0,0,0.8)]"
                        : "rounded-full [mask-image:radial-gradient(ellipse_62%_68%_at_50%_54%,black_55%,transparent_100%)] drop-shadow-[0_22px_32px_rgba(0,0,0,0.8)]"
                    )}
                  />
                </div>
              );
            })}

            {/* Floating Left / Right Controls (Continuous Infinite Loop) */}
            {originalCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => handleStepBy(-1)}
                  aria-label="Previous menu item"
                  className="absolute left-3 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-fana-cream/20 bg-fana-dark/65 text-fana-cream backdrop-blur-md transition sm:left-6 lg:left-10 hover:border-fana-gold hover:text-fana-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleStepBy(1)}
                  aria-label="Next menu item"
                  className="absolute right-3 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-fana-cream/20 bg-fana-dark/65 text-fana-cream backdrop-blur-md transition sm:right-6 lg:right-10 hover:border-fana-gold hover:text-fana-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* ─── Open Editorial Product Info (No Rectangular Box) ─────────── */}
          {activeItem && (
            <div
              ref={infoRef}
              className="mx-auto mt-2 flex max-w-2xl flex-col items-center px-6 text-center"
            >
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-fana-gold">
                  {CATEGORY_LABELS[activeItem.category]}
                </span>
                {activeItem.featured && (
                  <span className="rounded-full border border-fana-gold/30 bg-fana-gold/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-fana-gold">
                    House Pick
                  </span>
                )}
              </div>

              <h3 className="mt-2 font-display text-2xl leading-tight tracking-tight text-fana-cream sm:text-3xl lg:text-[2.25rem]">
                {activeItem.name}
              </h3>

              <p className="mt-2 max-w-lg text-sm leading-relaxed text-fana-cream/70 sm:text-base">
                {activeItem.subtitle}
              </p>

              {/* Verified Pricing & Action Row */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono uppercase tracking-[0.16em] text-fana-cream/65">
                    In-cafe menu pricing
                  </span>
                  {activeItem.availableModifiers.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-fana-cream/15 px-2.5 py-1 text-[11px] text-fana-cream/70">
                      <SlidersHorizontal className="h-3 w-3 text-fana-gold/80" aria-hidden="true" />
                      Customizable
                    </span>
                  )}
                </div>

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
          {originalCount > 1 && (
            <div className="mx-auto mt-9 max-w-xl px-6">
              <div className="flex items-center justify-center gap-1.5 overflow-hidden py-1">
                {filteredItems.map((item, idx) => {
                  const isActive = idx === safeActiveIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleDotClick(idx)}
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
                  ? "Move cursor left / right, drag, use arrows, or scroll to explore"
                  : "Swipe or tap arrows to explore"}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
