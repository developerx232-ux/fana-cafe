"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Compass } from "lucide-react";
import { gsap, ScrollTrigger, registerGSAP } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/lenis";
import { cn, progressToFrame, TOTAL_SCROLL_FRAMES } from "@/lib/utils";
import CoffeeScrollCanvas from "./CoffeeScrollCanvas";
import { useFramePreloader } from "./useFramePreloader";

interface StoryBeat {
  id: string;
  headline: string;
  supporting: string;
  /** Progress window [enterStart, holdStart, holdEnd, exitEnd] mapped to 0..1 */
  window: [number, number, number, number];
  /** Initial directional X offset (px) for restrained cinematic entrance */
  enterXDesktop: number;
  /** Responsive wrapper positioning classes (Mobile analyzed separately from Desktop) */
  positionClass: string;
  /** Responsive text alignment & max-width classes */
  contentClass: string;
  /** Show refined Explore Menu + Discover Fana buttons on this beat */
  showCtas?: boolean;
  /** Flex alignment for CTA button row */
  ctaAlignClass?: string;
}

/**
 * 6 Scroll-Synchronized Story Beats
 * Every position & alignment is derived from visual composition analysis of the
 * actual 368 desktop (16:10 cover) and 368 mobile (9:19.5 cover) WebP frames.
 */
const STORY_BEATS: StoryBeat[] = [
  {
    id: "opening",
    headline: "A little pause in the heart of Addis.",
    supporting: "Step into warmth, conversation, and a slower rhythm.",
    window: [0.0, 0.0, 0.095, 0.145],
    enterXDesktop: 0,
    // Mobile: dark lower-left void | Desktop: wide dark left two-thirds (bean at far right)
    positionClass:
      "items-end justify-start pb-16 sm:pb-20 md:items-center md:justify-start md:pb-0 md:pt-8",
    contentClass: "max-w-[20.5rem] text-left sm:max-w-md md:max-w-[34rem] md:text-left",
    showCtas: true,
    ctaAlignClass: "justify-start",
  },
  {
    id: "origin",
    headline: "Every great moment begins with a cup.",
    supporting: "Rich, unhurried, and poured fresh.",
    window: [0.155, 0.2, 0.26, 0.305],
    enterXDesktop: 22,
    // Mobile: dark lower band below macro bean diagonal | Desktop: dark lower-right while giant bean sweeps upper-center
    positionClass:
      "items-end justify-start pb-16 sm:pb-20 md:items-end md:justify-end md:pb-20",
    contentClass: "max-w-[20.5rem] text-left sm:max-w-md md:max-w-[30rem] md:text-right",
  },
  {
    id: "aroma",
    headline: "Take a breath. Stay a while.",
    supporting: "Soft light, rising aroma, and unhurried time.",
    window: [0.315, 0.365, 0.44, 0.49],
    enterXDesktop: -22,
    // Mobile: dark upper-left clear of emerging glass rim | Desktop: open upper-left sky above curling steam
    positionClass:
      "items-start justify-start pt-24 sm:pt-28 md:items-start md:justify-start md:pt-28",
    contentClass: "max-w-[20rem] text-left sm:max-w-md md:max-w-[30rem] md:text-left",
  },
  {
    id: "pour",
    headline: "Coffee, fresh juice, and something sweet.",
    supporting: "Crafted for mornings, cravings, and good company.",
    window: [0.505, 0.55, 0.64, 0.69],
    enterXDesktop: 22,
    // Mobile: dark upper-right above full-width glass & crema splash | Desktop: dark right flank beside centered splash column
    positionClass:
      "items-start justify-end pt-24 sm:pt-28 md:items-center md:justify-end md:pt-0 md:pb-16",
    contentClass: "max-w-[19.5rem] text-right sm:max-w-sm md:max-w-[25rem] md:text-right",
  },
  {
    id: "experience",
    headline: "A place to meet, work, and unwind.",
    supporting: "Warm oak tables, fresh air, and space to focus.",
    window: [0.705, 0.745, 0.815, 0.855],
    enterXDesktop: -22,
    // Mobile: calm dark upper-left above settling glass | Desktop: open mid-left flank (glass handle extends right)
    positionClass:
      "items-start justify-start pt-24 sm:pt-28 md:items-center md:justify-start md:pt-0 md:pb-14",
    contentClass: "max-w-[20rem] text-left sm:max-w-sm md:max-w-[26rem] md:text-left",
  },
  {
    id: "finished",
    headline: "Your Fana moment starts here.",
    supporting: "Explore what is fresh at the counter or step inside our spaces.",
    window: [0.87, 0.915, 1.0, 1.0],
    enterXDesktop: 20,
    // Mobile: centered in dark upper half directly above untouched steaming hero cup | Desktop: serene upper-right flank above glass handle
    positionClass:
      "items-start justify-center pt-24 sm:pt-28 md:items-start md:justify-end md:pt-28",
    contentClass:
      "max-w-[21rem] text-center sm:max-w-md md:max-w-[28rem] md:text-right",
    showCtas: true,
    ctaAlignClass: "justify-center md:justify-end",
  },
];

function HeroCtaGroup({ alignClass }: { alignClass?: string }) {
  return (
    <div className={cn("mt-6 flex flex-wrap items-center gap-3", alignClass)}>
      <button
        type="button"
        onClick={() => scrollToTarget("#menu")}
        className="group inline-flex h-11 items-center gap-2 rounded-full bg-fana-gold px-6 text-sm font-semibold text-fana-dark shadow-[0_10px_30px_rgba(245,158,11,0.3)] transition-all duration-200 hover:bg-fana-gold/90 hover:shadow-[0_12px_36px_rgba(245,158,11,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold focus-visible:ring-offset-2 focus-visible:ring-offset-fana-dark sm:h-12 sm:px-7"
      >
        <span>Explore Menu</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>

      <button
        type="button"
        onClick={() => scrollToTarget("#spaces")}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-fana-cream/30 bg-fana-dark/45 px-5 text-sm font-medium text-fana-cream backdrop-blur-md transition-all duration-200 hover:border-fana-gold/80 hover:bg-fana-dark/70 hover:text-fana-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fana-gold focus-visible:ring-offset-2 focus-visible:ring-offset-fana-dark sm:h-12 sm:px-6"
      >
        <Compass className="h-4 w-4 text-fana-gold/90" aria-hidden="true" />
        <span>Discover Fana</span>
      </button>
    </div>
  );
}

export default function ScrollStoryExperience() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollHintRef = useRef<HTMLDivElement | null>(null);
  const progressTrackRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const bottomFeatherRef = useRef<HTMLDivElement | null>(null);

  const [currentFrame, setCurrentFrame] = useState(0);
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);

  const {
    isMobile,
    prefersReducedMotion,
    firstFrameReady,
    getBestLoadedFrame,
  } = useFramePreloader();

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    registerGSAP();

    const ctx = gsap.context(() => {
      // Master normalized timeline (0..1) scrubbed in lockstep with the 368 frames
      const tl = gsap.timeline({ paused: true });

      STORY_BEATS.forEach((beat, idx) => {
        const el = beatRefs.current[idx];
        if (!el) return;

        const [enterStart, holdStart, holdEnd, exitEnd] = beat.window;
        const enterX = isMobile ? 0 : beat.enterXDesktop;

        if (idx === 0) {
          // Opening beat starts fully visible at scrollY = 0
          gsap.set(el, { autoAlpha: 1, y: 0, x: 0 });
          tl.to(
            el,
            {
              autoAlpha: 0,
              y: -26,
              duration: exitEnd - holdEnd,
              ease: "power2.in",
            },
            holdEnd
          );
        } else if (idx === STORY_BEATS.length - 1) {
          // Final beat enters cleanly and holds visible through frame 368
          gsap.set(el, { autoAlpha: 0, y: 28, x: enterX });
          tl.to(
            el,
            {
              autoAlpha: 1,
              y: 0,
              x: 0,
              duration: holdStart - enterStart,
              ease: "power2.out",
            },
            enterStart
          );
        } else {
          // Mid-story beats: directional entrance → quiet hold → subtle upward exit
          gsap.set(el, { autoAlpha: 0, y: 28, x: enterX });
          tl.to(
            el,
            {
              autoAlpha: 1,
              y: 0,
              x: 0,
              duration: holdStart - enterStart,
              ease: "power2.out",
            },
            enterStart
          ).to(
            el,
            {
              autoAlpha: 0,
              y: -24,
              duration: exitEnd - holdEnd,
              ease: "power2.in",
            },
            holdEnd
          );
        }
      });

      // Gentle scroll hint fades out immediately once visitor starts scrolling
      if (scrollHintRef.current) {
        gsap.set(scrollHintRef.current, { autoAlpha: 1, y: 0 });
        tl.to(
          scrollHintRef.current,
          { autoAlpha: 0, y: 12, duration: 0.055, ease: "power1.out" },
          0.01
        );
      }

      // Fade out bottom progress hairline before unpinning so no hard stroke separates #story and #spaces
      if (progressTrackRef.current) {
        gsap.set(progressTrackRef.current, { autoAlpha: 1 });
        tl.to(
          progressTrackRef.current,
          { autoAlpha: 0, duration: 0.1, ease: "power2.out" },
          0.86
        );
      }

      // Deepen the ~220px bottom atmospheric feather in the closing beats so the coffee table blends into #12100E
      if (bottomFeatherRef.current) {
        gsap.set(bottomFeatherRef.current, { opacity: 0.32 });
        tl.to(
          bottomFeatherRef.current,
          { opacity: 1, duration: 0.16, ease: "power1.inOut" },
          0.83
        );
      }

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          tl.progress(p);
          setCurrentFrame(progressToFrame(p, TOTAL_SCROLL_FRAMES));

          if (progressBarRef.current) {
            progressBarRef.current.style.transform = `scaleX(${p})`;
          }

          // Track active beat strictly for interactive CTA pointer-events & dot indicator
          let nextIdx = -1;
          for (let i = 0; i < STORY_BEATS.length; i++) {
            const [s, , , e] = STORY_BEATS[i].window;
            if (p >= s && p <= e) {
              nextIdx = i;
              break;
            }
          }
          setActiveBeatIndex((prev) => (prev === nextIdx ? prev : nextIdx));
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [prefersReducedMotion, isMobile]);

  // Graceful non-scroll fallback when `prefers-reduced-motion: reduce` is enabled
  if (prefersReducedMotion) {
    return (
      <section
        id="story"
        aria-label="Fana Cafe Story"
        className="relative min-h-[88dvh] overflow-hidden bg-fana-dark pt-28 pb-20"
      >
        <div className="absolute inset-0">
          <CoffeeScrollCanvas
            currentFrame={TOTAL_SCROLL_FRAMES - 1}
            getBestLoadedFrame={getBestLoadedFrame}
            firstFrameReady={firstFrameReady}
            prefersReducedMotion={true}
            isMobile={isMobile}
          />
        </div>

        <div className="relative z-content mx-auto flex max-w-6xl flex-col gap-12 px-6 sm:px-10 md:px-16">
          <div className="max-w-2xl space-y-4 pt-4">
            <h1 className="font-display text-4xl leading-[1.08] text-fana-cream drop-shadow-[0_4px_24px_rgba(0,0,0,0.75)] sm:text-5xl md:text-6xl">
              {STORY_BEATS[0].headline}
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-fana-cream/85 sm:text-lg">
              {STORY_BEATS[0].supporting}
            </p>
            <HeroCtaGroup alignClass="justify-start" />
          </div>

          <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {STORY_BEATS.slice(1).map((beat) => (
              <div
                key={beat.id}
                className="rounded-2xl border border-fana-cream/12 bg-fana-dark/65 p-5 backdrop-blur-md"
              >
                <h2 className="font-display text-lg text-fana-cream">{beat.headline}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-fana-cream/70">
                  {beat.supporting}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Seamless bottom dissolve into Fana Experiences */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-content h-44 bg-gradient-to-t from-fana-dark via-fana-dark/75 to-transparent"
        />
      </section>
    );
  }

  return (
    <section
      id="story"
      ref={containerRef}
      aria-label="Fana Cafe Coffee Story"
      className="relative h-[520vh] bg-fana-dark"
    >
      {/* Sticky full-viewport cinematic stage (zero CLS) */}
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <CoffeeScrollCanvas
          currentFrame={currentFrame}
          getBestLoadedFrame={getBestLoadedFrame}
          firstFrameReady={firstFrameReady}
          prefersReducedMotion={false}
          isMobile={isMobile}
        />

        {/* Scroll-Driven Dynamic Story Beats */}
        <div className="pointer-events-none absolute inset-0 z-content">
          {STORY_BEATS.map((beat, idx) => {
            const isBeatActive = activeBeatIndex === idx;
            const HeadingTag = idx === 0 ? "h1" : "h2";

            return (
              <div
                key={beat.id}
                ref={(el) => {
                  beatRefs.current[idx] = el;
                }}
                data-story-beat={beat.id}
                aria-hidden={!isBeatActive}
                className={cn(
                  "absolute inset-0 mx-auto flex w-full max-w-7xl px-6 sm:px-10 md:px-14 lg:px-16 will-change-transform",
                  beat.positionClass
                )}
                style={{ opacity: idx === 0 ? 1 : 0 }}
              >
                <div className={cn("space-y-3 sm:space-y-4", beat.contentClass)}>
                  <HeadingTag
                    className={cn(
                      "font-display tracking-tight text-fana-cream drop-shadow-[0_4px_28px_rgba(10,8,6,0.9)]",
                      "text-[2rem] leading-[1.09] sm:text-[2.5rem] md:text-[3.25rem] lg:text-[3.85rem] xl:text-[4.25rem] md:leading-[1.05]"
                    )}
                  >
                    {beat.headline}
                  </HeadingTag>

                  <p className="text-sm leading-relaxed text-fana-cream/85 drop-shadow-[0_2px_16px_rgba(10,8,6,0.95)] sm:text-base md:text-lg lg:text-[1.1875rem]">
                    {beat.supporting}
                  </p>

                  {beat.showCtas && (
                    <div
                      className={cn(
                        isBeatActive ? "pointer-events-auto" : "pointer-events-none"
                      )}
                    >
                      <HeroCtaGroup alignClass={beat.ctaAlignClass} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Minimal Opening Scroll Cue (fades out immediately on first scroll) */}
          <div
            ref={scrollHintRef}
            aria-hidden="true"
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-fana-cream/65"
          >
            <span>Scroll</span>
            <ArrowDown className="h-3.5 w-3.5 animate-bounce text-fana-gold" />
          </div>

          {/* Ultra-minimal story beat indicator dots (desktop right edge, subtle & unobtrusive) */}
          <div
            aria-hidden="true"
            className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 flex-col items-center gap-2"
          >
            {STORY_BEATS.map((beat, idx) => (
              <span
                key={beat.id}
                className={cn(
                  "block rounded-full transition-all duration-300",
                  activeBeatIndex === idx
                    ? "h-5 w-1.5 bg-fana-gold shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    : "h-1.5 w-1.5 bg-fana-cream/25"
                )}
              />
            ))}
          </div>
        </div>

        {/* Layered ~220px bottom atmospheric feather dissolving the Hero seamlessly into #spaces */}
        <div
          ref={bottomFeatherRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-48 sm:h-56 md:h-64"
          style={{ opacity: 0.32 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-fana-dark via-fana-dark/80 via-35% to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_100%,#12100E_28%,transparent_78%)]" />
        </div>

        {/* Subtle hairline progress track along bottom edge (fades out cleanly before unpinning) */}
        <div
          ref={progressTrackRef}
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 z-content h-[1.5px] bg-fana-cream/8"
        >
          <div
            ref={progressBarRef}
            className="h-full w-full origin-left bg-gradient-to-r from-fana-wood/80 via-fana-gold/75 to-fana-cream/65"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </section>
  );
}
