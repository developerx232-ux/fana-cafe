"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, ScrollTrigger, registerGSAP } from "@/lib/gsap";
import { cn, progressToFrame, TOTAL_SCROLL_FRAMES } from "@/lib/utils";
import CoffeeScrollCanvas from "./CoffeeScrollCanvas";
import { useFramePreloader } from "./useFramePreloader";

interface StoryBeat {
  id: string;
  sceneNumber?: string;
  sceneLabel?: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineAccent?: string;
  supporting?: string;
  /** Progress window [enterStart, holdStart, holdEnd, exitEnd] mapped to 0..1 */
  window: [number, number, number, number];
  headlineEnterFrom: "center" | "left" | "right";
  supportingEnterFrom: "center" | "left" | "right";
  /** Responsive wrapper positioning classes */
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
 * Clean, centered golden typography for opening & final scenes,
 * and choreographed kinetic typography with left/right entrances for intermediate beats.
 */
const STORY_BEATS: StoryBeat[] = [
  {
    id: "opening",
    headlineLine1: "A little pause",
    headlineLine2: "in the heart of Addis.",
    window: [0.0, 0.0, 0.08, 0.135],
    headlineEnterFrom: "center",
    supportingEnterFrom: "center",
    // Pure, centered golden opening hero headline
    positionClass: "items-center justify-center text-center",
    contentClass:
      "max-w-[24rem] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl text-center mx-auto",
  },
  {
    id: "origin",
    sceneNumber: "02",
    sceneLabel: "SINGLE ORIGIN",
    headlineLine1: "Every great moment",
    headlineLine2: "begins with a cup.",
    headlineAccent: "with a cup.",
    supporting: "Rich, unhurried, and poured fresh from highlands harvest.",
    window: [0.145, 0.19, 0.26, 0.305],
    headlineEnterFrom: "left",
    supportingEnterFrom: "right",
    positionClass:
      "items-end justify-start pb-16 sm:pb-20 md:items-end md:justify-end md:pb-20",
    contentClass: "max-w-[21.5rem] text-left sm:max-w-md md:max-w-[32rem] md:text-right",
  },
  {
    id: "aroma",
    sceneNumber: "03",
    sceneLabel: "THE SANCTUARY",
    headlineLine1: "Take a breath.",
    headlineLine2: "Stay a while.",
    headlineAccent: "Stay a while.",
    supporting: "Soft amber light, rising aroma, and unhurried time.",
    window: [0.315, 0.36, 0.435, 0.48],
    headlineEnterFrom: "right",
    supportingEnterFrom: "left",
    positionClass:
      "items-start justify-start pt-24 sm:pt-28 md:items-start md:justify-start md:pt-28",
    contentClass: "max-w-[21rem] text-left sm:max-w-md md:max-w-[32rem] md:text-left",
  },
  {
    id: "pour",
    sceneNumber: "04",
    sceneLabel: "THE CRAFT",
    headlineLine1: "Coffee, fresh juice,",
    headlineLine2: "and something sweet.",
    headlineAccent: "and something sweet.",
    supporting: "Crafted for mornings, cravings, and good company.",
    window: [0.495, 0.54, 0.635, 0.68],
    headlineEnterFrom: "left",
    supportingEnterFrom: "right",
    positionClass:
      "items-start justify-end pt-24 sm:pt-28 md:items-center md:justify-end md:pt-0 md:pb-16",
    contentClass: "max-w-[21rem] text-right sm:max-w-sm md:max-w-[28rem] md:text-right",
  },
  {
    id: "experience",
    sceneNumber: "05",
    sceneLabel: "COMMUNAL SPACE",
    headlineLine1: "A place to meet,",
    headlineLine2: "work, and unwind.",
    headlineAccent: "work, and unwind.",
    supporting: "Warm oak tables, fresh air, and space to focus.",
    window: [0.695, 0.74, 0.815, 0.855],
    headlineEnterFrom: "right",
    supportingEnterFrom: "left",
    positionClass:
      "items-start justify-start pt-24 sm:pt-28 md:items-center md:justify-start md:pt-0 md:pb-14",
    contentClass: "max-w-[21rem] text-left sm:max-w-sm md:max-w-[28rem] md:text-left",
  },
  {
    id: "finished",
    headlineLine1: "Your Fana moment",
    headlineLine2: "starts here.",
    headlineAccent: "starts here.",
    window: [0.87, 0.915, 1.0, 1.0],
    headlineEnterFrom: "center",
    supportingEnterFrom: "center",
    // Pure, centered golden final invitation headline
    positionClass: "items-center justify-center text-center",
    contentClass:
      "max-w-[24rem] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl text-center mx-auto",
  },
];

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

        const headlineEl = el.querySelector(".kinetic-headline");
        const supportingEl = el.querySelector(".kinetic-supporting");
        const badgeEl = el.querySelector(".editorial-badge");
        const ctaEl = el.querySelector(".kinetic-cta");
        const goldenLineEl = el.querySelector(".golden-line");

        const [enterStart, holdStart, holdEnd, exitEnd] = beat.window;
        const distX = isMobile ? 28 : 56;

        if (idx === 0) {
          // Centered Opening Beat starts fully visible at scrollY = 0
          gsap.set(el, { autoAlpha: 1 });
          if (headlineEl) gsap.set(headlineEl, { y: 0, opacity: 1, filter: "blur(0px)" });

          // Scroll-driven exit: smoothly and progressively disappears with upward drift & gentle blur
          const exitDur = exitEnd - holdEnd;
          if (headlineEl) {
            tl.to(
              headlineEl,
              {
                y: -38,
                opacity: 0,
                filter: "blur(12px)",
                duration: exitDur * 0.85,
                ease: "power2.in",
              },
              holdEnd
            );
          }
          tl.to(
            el,
            { autoAlpha: 0, duration: exitDur * 0.2, ease: "none" },
            holdEnd + exitDur * 0.8
          );
        } else if (idx === STORY_BEATS.length - 1) {
          // Final scene: pure centered golden invitation headline enters and holds
          gsap.set(el, { autoAlpha: 1 });
          if (headlineEl) gsap.set(headlineEl, { y: 32, opacity: 0, filter: "blur(10px)" });

          const enterDur = holdStart - enterStart;
          if (headlineEl) {
            tl.to(
              headlineEl,
              { y: 0, opacity: 1, filter: "blur(0px)", duration: enterDur * 0.85, ease: "power2.out" },
              enterStart
            );
          }
        } else {
          // Mid-story scenes: headline enters from left/right, supporting enters from opposite right/left!
          gsap.set(el, { autoAlpha: 1 });
          const hSign = beat.headlineEnterFrom === "left" ? -1 : 1;
          const sSign = beat.supportingEnterFrom === "left" ? -1 : 1;

          if (headlineEl) gsap.set(headlineEl, { x: hSign * distX, opacity: 0, filter: "blur(10px)" });
          if (supportingEl) gsap.set(supportingEl, { x: sSign * distX, opacity: 0, filter: "blur(8px)" });
          if (badgeEl) gsap.set(badgeEl, { opacity: 0, y: 12 });
          if (goldenLineEl) gsap.set(goldenLineEl, { scaleX: 0, transformOrigin: "left center" });

          const enterDur = holdStart - enterStart;
          if (headlineEl) {
            tl.to(
              headlineEl,
              { x: 0, opacity: 1, filter: "blur(0px)", duration: enterDur * 0.82, ease: "power2.out" },
              enterStart
            );
          }
          if (supportingEl) {
            tl.to(
              supportingEl,
              { x: 0, opacity: 0.85, filter: "blur(0px)", duration: enterDur * 0.82, ease: "power2.out" },
              enterStart + enterDur * 0.08
            );
          }
          if (badgeEl) {
            tl.to(badgeEl, { opacity: 1, y: 0, duration: enterDur * 0.6, ease: "power2.out" }, enterStart);
          }
          if (goldenLineEl) {
            tl.to(goldenLineEl, { scaleX: 1, duration: enterDur * 0.65, ease: "power2.out" }, enterStart);
          }

          // Progressive exit
          const exitDur = exitEnd - holdEnd;
          if (headlineEl) {
            tl.to(
              headlineEl,
              {
                x: hSign * (distX * 0.45),
                y: -18,
                opacity: 0,
                filter: "blur(8px)",
                duration: exitDur * 0.75,
                ease: "power2.in",
              },
              holdEnd
            );
          }
          if (supportingEl) {
            tl.to(
              supportingEl,
              {
                x: sSign * (distX * 0.45),
                y: -18,
                opacity: 0,
                filter: "blur(8px)",
                duration: exitDur * 0.75,
                ease: "power2.in",
              },
              holdEnd + exitDur * 0.06
            );
          }
          if (badgeEl) {
            tl.to(badgeEl, { opacity: 0, y: -10, duration: exitDur * 0.5, ease: "power2.in" }, holdEnd + exitDur * 0.12);
          }
          if (goldenLineEl) {
            tl.to(goldenLineEl, { scaleX: 0, duration: exitDur * 0.5, ease: "power2.in" }, holdEnd + exitDur * 0.12);
          }
          tl.to(
            el,
            { autoAlpha: 0, duration: exitDur * 0.2, ease: "none" },
            holdEnd + exitDur * 0.8
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
          <div className="mx-auto max-w-4xl space-y-4 pt-4 text-center">
            <h1 className="font-display font-serif text-4xl leading-[1.08] text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-fana-gold to-amber-300 drop-shadow-[0_4px_24px_rgba(245,158,11,0.35)] sm:text-5xl md:text-6xl">
              <span className="block">{STORY_BEATS[0].headlineLine1}</span>
              <span className="block">{STORY_BEATS[0].headlineLine2}</span>
            </h1>
          </div>

          <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            {STORY_BEATS.slice(1, -1).map((beat) => (
              <div
                key={beat.id}
                className="rounded-2xl border border-fana-cream/12 bg-fana-dark/65 p-5 backdrop-blur-md"
              >
                <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-fana-gold">
                  <span>{beat.sceneNumber}</span>
                  <span className="text-fana-cream/30">/</span>
                  <span className="text-fana-cream/50">06</span>
                  <span>•</span>
                  <span>{beat.sceneLabel}</span>
                </div>
                <h2 className="font-display font-serif text-lg text-fana-cream">
                  {beat.headlineLine1} {beat.headlineLine2}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-fana-cream/70">
                  {beat.supporting}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-auto max-w-4xl space-y-4 pt-4 text-center">
            <h2 className="font-display font-serif text-3xl leading-[1.08] text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-fana-gold to-amber-300 drop-shadow-[0_4px_24px_rgba(245,158,11,0.35)] sm:text-4xl md:text-5xl">
              <span className="block">{STORY_BEATS[STORY_BEATS.length - 1].headlineLine1}</span>
              <span className="block font-serif italic">{STORY_BEATS[STORY_BEATS.length - 1].headlineLine2}</span>
            </h2>
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
                {idx === 0 ? (
                  <div className="mx-auto flex max-w-4xl flex-col items-center justify-center text-center">
                    {/* Centered Golden Hero Headline */}
                    <HeadingTag className="kinetic-headline font-display font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-fana-gold to-amber-300 drop-shadow-[0_4px_34px_rgba(245,158,11,0.4)] text-[2.75rem] leading-[1.08] sm:text-[3.85rem] md:text-[5rem] lg:text-[5.75rem] xl:text-[6.25rem] md:leading-[1.03]">
                      <span className="block">{beat.headlineLine1}</span>
                      <span className="block">{beat.headlineLine2}</span>
                    </HeadingTag>
                  </div>
                ) : idx === STORY_BEATS.length - 1 ? (
                  <div className="mx-auto flex max-w-4xl flex-col items-center justify-center text-center">
                    {/* Centered Golden Final Invitation Headline */}
                    <HeadingTag className="kinetic-headline font-display font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-fana-gold to-amber-300 drop-shadow-[0_4px_34px_rgba(245,158,11,0.4)] text-[2.75rem] leading-[1.08] sm:text-[3.85rem] md:text-[5rem] lg:text-[5.75rem] xl:text-[6.25rem] md:leading-[1.03]">
                      <span className="block">{beat.headlineLine1}</span>
                      <span className="block font-serif italic">{beat.headlineLine2}</span>
                    </HeadingTag>
                  </div>
                ) : (
                  <div className={cn("space-y-3.5 sm:space-y-4", beat.contentClass)}>
                    {/* Editorial Scene Label & Golden Hairline */}
                    <div
                      className={cn(
                        "editorial-badge flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-fana-gold font-medium",
                        beat.contentClass.includes("text-right")
                          ? "justify-end"
                          : beat.contentClass.includes("text-center")
                          ? "justify-center"
                          : "justify-start"
                      )}
                    >
                      <span className="font-bold text-fana-gold">{beat.sceneNumber}</span>
                      <span className="text-fana-cream/30">/</span>
                      <span className="text-fana-cream/50">06</span>
                      <span className="inline-block h-1 w-1 rounded-full bg-fana-gold/70" />
                      <span className="tracking-[0.22em] text-fana-cream/75">{beat.sceneLabel}</span>
                      <span className="golden-line inline-block h-[1px] w-8 sm:w-12 origin-left bg-gradient-to-r from-fana-gold/80 to-transparent" />
                    </div>

                    {/* Storytelling Headline */}
                    <HeadingTag
                      className={cn(
                        "kinetic-headline font-display font-serif tracking-tight text-fana-cream drop-shadow-[0_4px_30px_rgba(10,8,6,0.95)]",
                        "text-[2.1rem] leading-[1.08] sm:text-[2.7rem] md:text-[3.35rem] lg:text-[4rem] xl:text-[4.35rem] md:leading-[1.05]"
                      )}
                    >
                      <span className="block">{beat.headlineLine1}</span>
                      <span className="block">
                        {beat.headlineAccent ? (
                          <>
                            {beat.headlineLine2.replace(beat.headlineAccent, "")}
                            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-fana-gold to-amber-300 drop-shadow-[0_2px_16px_rgba(245,158,11,0.32)]">
                              {beat.headlineAccent}
                            </span>
                          </>
                        ) : (
                          beat.headlineLine2
                        )}
                      </span>
                    </HeadingTag>

                    {/* Supporting Description */}
                    <p className="kinetic-supporting text-sm leading-relaxed text-fana-cream/80 drop-shadow-[0_2px_16px_rgba(10,8,6,0.95)] sm:text-base md:text-lg lg:text-[1.15rem]">
                      {beat.supporting}
                    </p>
                  </div>
                )}
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
