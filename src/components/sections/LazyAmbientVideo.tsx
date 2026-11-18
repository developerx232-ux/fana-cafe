"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/useMediaQuery";

interface LazyAmbientVideoProps {
  src: string;
  label: string;
  aspectClassName?: string;
  className?: string;
}

/**
 * Viewport-aware ambient video component.
 * - Defers attaching `src` until the container enters within 250px of the viewport.
 * - Automatically plays when visible and pauses when scrolled out of view.
 * - Respects `prefers-reduced-motion: reduce` (loads only when user presses Play).
 * - Preserves fixed aspect ratio to prevent Cumulative Layout Shift (CLS).
 */
export default function LazyAmbientVideo({
  src,
  label,
  aspectClassName = "aspect-video",
  className,
}: LazyAmbientVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  // Load observer (triggers once when approaching viewport)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          loadObserver.disconnect();
        }
      },
      { rootMargin: "250px 0px" }
    );

    const playObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    loadObserver.observe(el);
    playObserver.observe(el);

    return () => {
      loadObserver.disconnect();
      playObserver.disconnect();
    };
  }, []);

  // Synchronize HTMLMediaElement playback with visibility & motion preference
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    if (isInView && !userPaused && !reducedMotion) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay blocked by browser policy; user can click Play button
        });
      }
    } else if (!video.paused) {
      video.pause();
    }
  }, [isInView, shouldLoad, userPaused, reducedMotion]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setUserPaused(false);
      setShouldLoad(true);
      video.play().catch(() => {});
    } else {
      setUserPaused(true);
      video.pause();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl bg-[#1A1613]",
        aspectClassName,
        className
      )}
    >
      <video
        ref={videoRef}
        src={shouldLoad ? src : undefined}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />

      {/* Subtle warm dark gradient bottom edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-fana-dark/70 via-transparent to-fana-dark/15"
      />

      {/* Manual playback control for accessibility & reduced-motion users */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? `Pause ${label}` : `Play ${label}`}
        className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-fana-cream/25 bg-fana-dark/70 text-fana-cream backdrop-blur-md transition hover:border-fana-gold hover:text-fana-gold"
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Play className="h-3.5 w-3.5 translate-x-[1px]" />
        )}
      </button>
    </div>
  );
}
