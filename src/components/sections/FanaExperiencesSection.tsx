"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { gsap, ScrollTrigger, registerGSAP } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/lenis";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";
import {
  EXPERIENCE_JUMP_EVENT,
  type ExperienceJumpDetail,
} from "@/lib/experienceNav";

interface ExperienceCardData {
  id: string;
  number: string;
  category: string;
  title: string;
  description: string;
  videoSrc: string;
  posterSrc: string;
  objectPositionClass: string;
  ambientGlowClass: string;
}

const EXPERIENCE_CARDS: ExperienceCardData[] = [
  {
    id: "juice-bar",
    number: "01",
    category: "Juice & Ice Cream",
    title: "Fresh Juice & Ice Cream",
    description: "Fresh moments, bright flavors.",
    videoSrc: "/videos/juice_bar.mp4",
    posterSrc: "/videos/posters/juice_bar.webp",
    objectPositionClass: "object-[32%_center]",
    ambientGlowClass: "from-fana-gold/18 via-fana-wood/10 to-transparent",
  },
  {
    id: "workspace-hub",
    number: "02",
    category: "Communal Space",
    title: "Work, Meet & Connect",
    description: "A welcoming space to work, meet, and connect.",
    videoSrc: "/videos/workspace_hub.mp4",
    posterSrc: "/videos/posters/workspace_hub.webp",
    objectPositionClass: "object-[48%_center]",
    ambientGlowClass: "from-fana-green/28 via-fana-wood/14 to-transparent",
  },
  {
    id: "open-kitchen",
    number: "03",
    category: "Open Kitchen",
    title: "From Our Open Kitchen",
    description: "A closer look at the Fana experience.",
    videoSrc: "/videos/open_kitchen.mp4",
    posterSrc: "/videos/posters/open_kitchen.webp",
    objectPositionClass: "object-[52%_center]",
    ambientGlowClass: "from-fana-gold/20 via-fana-wood/16 to-transparent",
  },
  {
    id: "dining-experience",
    number: "04",
    category: "Dining Room",
    title: "The Fana Dining Experience",
    description: "Make room for good moments.",
    videoSrc: "/videos/dining_experience.mp4",
    posterSrc: "/videos/posters/dining_experience.webp",
    objectPositionClass: "object-[58%_center]",
    ambientGlowClass: "from-fana-wood/24 via-fana-green/16 to-transparent",
  },
];

interface ExperienceVideoCardProps {
  card: ExperienceCardData;
  isActive: boolean;
  shouldLoad: boolean;
  shouldPlay: boolean;
  reducedMotion: boolean;
  onSelect: () => void;
}

function ExperienceVideoCard({
  card,
  isActive,
  shouldLoad,
  shouldPlay,
  reducedMotion,
  onSelect,
}: ExperienceVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    if (shouldPlay && !userPaused && !reducedMotion) {
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          // Autoplay blocked; crisp WebP poster remains visible
        });
      }
    } else if (!video.paused) {
      video.pause();
    }
  }, [shouldPlay, shouldLoad, userPaused, reducedMotion]);

  const handleTogglePlay = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setUserPaused(false);
      video.play().catch(() => {});
    } else {
      setUserPaused(true);
      video.pause();
    }
  };

  return (
    <article
      onClick={!isActive ? onSelect : undefined}
      role={!isActive ? "button" : undefined}
      tabIndex={!isActive ? 0 : undefined}
      onKeyDown={
        !isActive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      aria-label={`${card.title} — ${card.description}`}
      className={cn(
        "group relative aspect-square w-full overflow-hidden rounded-[1.75rem] border bg-[#191511] transition-[border-color,box-shadow] duration-500",
        isActive
          ? "border-fana-gold/55 shadow-[0_32px_90px_-24px_rgba(0,0,0,0.9),0_0_40px_-14px_rgba(245,158,11,0.28)]"
          : "cursor-pointer border-fana-cream/12 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.8)] hover:border-fana-cream/30"
      )}
    >
      {/* Zero-CLS High-Res WebP Poster Layer (always visible underneath + fallback) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.posterSrc}
        alt={card.title}
        loading="lazy"
        decoding="async"
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          card.objectPositionClass
        )}
      />

      {/* Lazy-Loaded H.264 Video Layer */}
      <video
        ref={videoRef}
        src={shouldLoad ? card.videoSrc : undefined}
        poster={card.posterSrc}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        onLoadedData={() => setVideoReady(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          card.objectPositionClass,
          videoReady ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Soft cinematic lower vignette for crisp editorial typography without hiding the scene */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#12100E]/92 via-[#12100E]/22 to-transparent"
      />

      {/* Top row: subtle index badge + accessible playback control */}
      <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between sm:left-5 sm:right-5 sm:top-5">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur-md transition-colors duration-300",
            isActive
              ? "border-fana-gold/45 bg-fana-dark/65 text-fana-gold"
              : "border-fana-cream/15 bg-fana-dark/55 text-fana-cream/70"
          )}
        >
          <span>{card.number}</span>
          <span className="h-1 w-1 rounded-full bg-current opacity-60" />
          <span>{card.category}</span>
        </span>

        {isActive && (
          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? `Pause ${card.title} video` : `Play ${card.title} video`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-fana-cream/25 bg-fana-dark/65 text-fana-cream backdrop-blur-md transition hover:border-fana-gold hover:text-fana-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold"
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 translate-x-[1px]" />
            )}
          </button>
        )}
      </div>

      {/* Bottom Editorial Title & Concise Caption */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-5 sm:p-7">
        <h3 className="font-display text-2xl leading-[1.12] tracking-tight text-fana-cream drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)] sm:text-[1.75rem]">
          {card.title}
        </h3>
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-fana-cream/80 sm:text-sm">
          {card.description}
        </p>
      </div>
    </article>
  );
}

export default function FanaExperiencesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const ambientAtmosphereRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const isDesktop = useMediaQuery("(min-width: 1024px)", true);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", false);
  const usePinnedHorizontal = isDesktop && !reducedMotion;

  const [sectionNearViewport, setSectionNearViewport] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Lazy-load & playback visibility observers for the section
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionNearViewport(true);
          preloadObserver.disconnect();
        }
      },
      { rootMargin: "320px 0px" }
    );

    const visibleObserver = new IntersectionObserver(
      ([entry]) => {
        setSectionVisible(entry.isIntersecting);
      },
      { threshold: 0.12 }
    );

    preloadObserver.observe(el);
    visibleObserver.observe(el);

    return () => {
      preloadObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, []);

  // Desktop: GSAP ScrollTrigger pinned vertical-to-horizontal cinematic track
  useEffect(() => {
    if (!usePinnedHorizontal || !sectionRef.current || !trackRef.current) return;

    registerGSAP();

    const applyTrackTransforms = (progress: number) => {
      const track = trackRef.current;
      const firstCard = cardSlotRefs.current[0];
      if (!track || !firstCard) return;

      const cardWidth = firstCard.offsetWidth;
      const computedGap = Number.parseFloat(getComputedStyle(track).columnGap || "40") || 40;
      const stride = cardWidth + computedGap;

      const totalSteps = EXPERIENCE_CARDS.length - 1;
      const activeFloat = progress * totalSteps;

      // Keep activeFloat centered at viewport horizontal midpoint
      const translateX = -(cardWidth / 2 + activeFloat * stride);
      gsap.set(track, { x: translateX, force3D: true });

      // Continuous per-card depth, scale, elevation & soft dim/blur for neighboring cards
      cardSlotRefs.current.forEach((slot, idx) => {
        if (!slot) return;
        const dist = Math.abs(idx - activeFloat);
        const clamped = Math.min(dist, 1.35);
        const scale = 1 - Math.min(dist, 1.2) * 0.145;
        const opacity = 1 - Math.min(dist, 1.25) * 0.44;
        const yOffset = Math.min(dist, 1.2) * 16;
        const brightness = 1 - Math.min(dist, 1.2) * 0.28;
        const blurPx = Math.min(clamped, 1) * 1.15;

        gsap.set(slot, {
          scale,
          opacity,
          y: yOffset,
          zIndex: Math.round(20 - Math.min(dist, 3) * 5),
          filter:
            dist < 0.04
              ? "none"
              : `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`,
          force3D: true,
        });
      });

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress})`;
      }

      const nearest = Math.min(
        EXPERIENCE_CARDS.length - 1,
        Math.max(0, Math.round(activeFloat))
      );
      setActiveIndex((prev) => (prev === nearest ? prev : nearest));
    };

    const ctx = gsap.context(() => {
      applyTrackTransforms(0);

      // Gentle ambient warmth bloom as Fana Experiences rises out of the Hero dissolve
      if (ambientAtmosphereRef.current) {
        gsap.fromTo(
          ambientAtmosphereRef.current,
          { opacity: 0.35 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          }
        );
      }

      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          applyTrackTransforms(self.progress);
        },
        onRefresh: (self) => {
          applyTrackTransforms(self.progress);
        },
      });
    }, sectionRef);

    const onResize = () => {
      if (scrollTriggerRef.current) {
        applyTrackTransforms(scrollTriggerRef.current.progress);
      }
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      scrollTriggerRef.current = null;
      ctx.revert();
    };
  }, [usePinnedHorizontal]);

  // Mobile / Reduced-Motion: track active card in horizontal snap carousel
  const handleMobileScroll = useCallback(() => {
    const scroller = mobileCarouselRef.current;
    if (!scroller) return;
    const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Infinity;

    cardSlotRefs.current.forEach((slot, idx) => {
      if (!slot) return;
      const slotCenter = slot.offsetLeft + slot.offsetWidth / 2;
      const d = Math.abs(slotCenter - centerX);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = idx;
      }
    });

    setActiveIndex((prev) => (prev === bestIdx ? prev : bestIdx));
  }, []);

  // Jump cleanly to any specific card index (0..3) — works for arrows, pills, clicking neighbors & Navbar OPEN KITCHEN link
  const goToCard = useCallback(
    (targetIdx: number) => {
      const clamped = Math.min(EXPERIENCE_CARDS.length - 1, Math.max(0, targetIdx));

      if (usePinnedHorizontal && sectionRef.current) {
        const st = scrollTriggerRef.current;
        if (st) {
          const targetY =
            st.start + (st.end - st.start) * (clamped / (EXPERIENCE_CARDS.length - 1));
          scrollToTarget(targetY);
          return;
        }
        const rect = sectionRef.current.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const scrollable = Math.max(sectionRef.current.offsetHeight - window.innerHeight, 1);
        scrollToTarget(sectionTop + scrollable * (clamped / (EXPERIENCE_CARDS.length - 1)));
      } else {
        // Mobile or reduced-motion: scroll section into view & center the target card horizontally
        scrollToTarget("#spaces");
        const scroller = mobileCarouselRef.current;
        const slot = cardSlotRefs.current[clamped];
        if (scroller && slot) {
          const targetLeft =
            slot.offsetLeft - (scroller.clientWidth - slot.offsetWidth) / 2;
          scroller.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: reducedMotion ? "auto" : "smooth",
          });
          setActiveIndex(clamped);
        }
      }
    },
    [usePinnedHorizontal, reducedMotion]
  );

  // Listen for Navbar / Footer `OPEN KITCHEN` jump events
  useEffect(() => {
    const onJump = (e: Event) => {
      const detail = (e as CustomEvent<ExperienceJumpDetail>).detail;
      if (detail && typeof detail.cardIndex === "number") {
        goToCard(detail.cardIndex);
      }
    };
    window.addEventListener(EXPERIENCE_JUMP_EVENT, onJump);
    return () => window.removeEventListener(EXPERIENCE_JUMP_EVENT, onJump);
  }, [goToCard]);

  // Keyboard arrow navigation when section is focused
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goToCard(activeIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToCard(activeIndex - 1);
    }
  };

  const activeCard = EXPERIENCE_CARDS[activeIndex] ?? EXPERIENCE_CARDS[0];

  return (
    <section
      id="spaces"
      ref={sectionRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      aria-label="Fana Experiences"
      className={cn(
        "relative bg-fana-dark text-fana-cream focus:outline-none",
        usePinnedHorizontal ? "h-[340vh]" : "py-20 sm:py-24"
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          usePinnedHorizontal
            ? "sticky top-0 flex h-[100dvh] flex-col justify-between pb-8 pt-24"
            : "flex flex-col gap-10"
        )}
      >
        {/* Seamless top espresso continuity bridge (matches #story bottom #12100E dissolve) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-44 bg-gradient-to-b from-fana-dark via-fana-dark/65 to-transparent sm:h-52 md:h-60"
        />

        {/* Ambient Espresso Lighting that softly responds to scroll entry & active experience */}
        <div
          ref={ambientAtmosphereRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div
            className={cn(
              "absolute left-1/2 top-[54%] h-[38rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial blur-[135px] transition-all duration-700",
              activeCard.ambientGlowClass
            )}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_78%_52%_at_50%_26%,rgba(245,158,11,0.055),transparent_72%)]" />
        </div>

        {/* Editorial Section Heading + Counter + Controls */}
        <div className="relative z-10 w-full px-5 sm:px-8 md:px-[clamp(1.75rem,6vw,6rem)]">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-2xl space-y-2">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.26em] text-fana-gold">
                Fana Experiences · More to Experience
              </p>
              <h2 className="font-display text-3xl leading-[1.08] tracking-tight text-fana-cream sm:text-4xl lg:text-[2.85rem]">
                Find Your Fana Moment.
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-fana-cream/70 sm:text-base">
                From fresh flavors to comfortable spaces, discover what makes Fana more than just a coffee stop.
              </p>
            </div>

            {/* Active Counter + Prev / Next Controls */}
            <div className="flex items-center gap-4 self-start lg:self-end">
              <div className="font-mono text-xs tracking-[0.2em] text-fana-cream/75">
                <span className="text-fana-gold font-semibold">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="mx-1.5 text-fana-cream/35">/</span>
                <span>0{EXPERIENCE_CARDS.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToCard(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  aria-label="Previous experience card"
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold",
                    activeIndex === 0
                      ? "cursor-not-allowed border-fana-cream/10 text-fana-cream/25"
                      : "border-fana-cream/20 bg-fana-dark/60 text-fana-cream hover:border-fana-gold hover:text-fana-gold"
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goToCard(activeIndex + 1)}
                  disabled={activeIndex === EXPERIENCE_CARDS.length - 1}
                  aria-label="Next experience card"
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold",
                    activeIndex === EXPERIENCE_CARDS.length - 1
                      ? "cursor-not-allowed border-fana-cream/10 text-fana-cream/25"
                      : "border-fana-cream/20 bg-fana-dark/60 text-fana-cream hover:border-fana-gold hover:text-fana-gold"
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal 1:1 Square Video Cards Stage */}
        {usePinnedHorizontal ? (
          /* Desktop: Pinned Vertical-to-Horizontal Track */
          <div className="relative z-10 flex flex-1 items-center overflow-hidden">
            {/* Subtle edge fade vignettes so neighboring peeking cards melt into espresso dark */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-30 w-16 bg-gradient-to-r from-fana-dark to-transparent xl:w-28"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-30 w-16 bg-gradient-to-l from-fana-dark to-transparent xl:w-28"
            />

            <div
              ref={trackRef}
              className="absolute left-1/2 top-1/2 flex -translate-y-1/2 items-center gap-8 xl:gap-11 will-change-transform"
            >
              {EXPERIENCE_CARDS.map((card, idx) => {
                const isActive = idx === activeIndex;
                const isNearby = Math.abs(idx - activeIndex) <= 1;

                return (
                  <div
                    key={card.id}
                    ref={(el) => {
                      cardSlotRefs.current[idx] = el;
                    }}
                    data-experience-card={card.id}
                    className="w-[clamp(320px,min(52vh,40vw),500px)] shrink-0 will-change-transform"
                  >
                    <ExperienceVideoCard
                      card={card}
                      isActive={isActive}
                      shouldLoad={sectionNearViewport && isNearby}
                      shouldPlay={sectionVisible && isActive}
                      reducedMotion={reducedMotion}
                      onSelect={() => goToCard(idx)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Mobile / Tablet / Reduced-Motion: Touch-Friendly Horizontal Scroll-Snap Track */
          <div className="relative z-10 w-full">
            <div
              ref={mobileCarouselRef}
              onScroll={handleMobileScroll}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[11vw] pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6 sm:px-[18vw]"
            >
              {EXPERIENCE_CARDS.map((card, idx) => {
                const isActive = idx === activeIndex;
                const isNearby = Math.abs(idx - activeIndex) <= 1;

                return (
                  <div
                    key={card.id}
                    ref={(el) => {
                      cardSlotRefs.current[idx] = el;
                    }}
                    data-experience-card={card.id}
                    className={cn(
                      "w-[78vw] max-w-[390px] shrink-0 snap-center transition-all duration-300",
                      isActive
                        ? "scale-100 opacity-100"
                        : "scale-[0.92] opacity-60"
                    )}
                  >
                    <ExperienceVideoCard
                      card={card}
                      isActive={isActive}
                      shouldLoad={sectionNearViewport && isNearby}
                      shouldPlay={sectionVisible && isActive}
                      reducedMotion={reducedMotion}
                      onSelect={() => goToCard(idx)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Progress Rail & Quick Card Selectors */}
        <div className="relative z-10 w-full px-5 sm:px-8 md:px-[clamp(1.75rem,6vw,6rem)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Clickable Card Title Indicators */}
            <div
              className="flex flex-wrap items-center gap-x-5 gap-y-2"
              role="tablist"
              aria-label="Fana experience chapters"
            >
              {EXPERIENCE_CARDS.map((card, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={card.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => goToCard(idx)}
                    className={cn(
                      "inline-flex items-center gap-2 text-xs transition-colors focus-visible:outline-none focus-visible:text-fana-gold",
                      isActive
                        ? "font-semibold text-fana-cream"
                        : "text-fana-cream/45 hover:text-fana-cream/75"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        isActive ? "w-5 bg-fana-gold" : "w-1.5 bg-fana-cream/30"
                      )}
                    />
                    <span className="hidden sm:inline">{card.category}</span>
                    <span className="font-mono text-[10px] sm:hidden">{card.number}</span>
                  </button>
                );
              })}
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-fana-cream/45">
              {usePinnedHorizontal ? "Scroll to glide through" : "Swipe to explore"}
            </p>
          </div>

          {/* Subtle Horizontal Progress Hairline */}
          <div
            aria-hidden="true"
            className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-fana-cream/10"
          >
            <div
              ref={progressBarRef}
              className="h-full w-full origin-left bg-gradient-to-r from-fana-wood via-fana-gold to-fana-cream transition-transform duration-150"
              style={
                usePinnedHorizontal
                  ? { transform: "scaleX(0)" }
                  : {
                      transform: `scaleX(${(activeIndex + 1) / EXPERIENCE_CARDS.length})`,
                    }
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
