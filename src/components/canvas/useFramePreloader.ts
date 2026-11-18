"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getFrameUrl, TOTAL_SCROLL_FRAMES } from "@/lib/utils";
import { useMediaQuery } from "@/lib/useMediaQuery";

export interface FramePreloaderState {
  isMobile: boolean;
  prefersReducedMotion: boolean;
  firstFrameReady: boolean;
  loadedCount: number;
  totalFrames: number;
  getBestLoadedFrame: (targetIndex: number) => HTMLImageElement | null;
}

const PRIORITY_INITIAL_COUNT = 24;
const KEYFRAME_STRIDE = 16;
const BATCH_SIZE = 12;

/**
 * Progressive frame preloader for the 368-frame 3D coffee scroll sequence.
 * - Selects desktop (1920w) or mobile (720w) sequence based on viewport width (<768px).
 * - Never downloads all 368 frames simultaneously on first load:
 *   1) Priority wave: first 24 frames + evenly spaced keyframe anchors (every 16th frame)
 *   2) Background wave: remaining frames streamed in small batches via requestIdleCallback
 * - Honors `prefers-reduced-motion: reduce` by skipping bulk frame downloads entirely.
 */
export function useFramePreloader(): FramePreloaderState {
  const isMobile = useMediaQuery("(max-width: 767px)", false);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", false);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const framesRef = useRef<(HTMLImageElement | null)[]>(
    new Array(TOTAL_SCROLL_FRAMES).fill(null)
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (prefersReducedMotion) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        framesRef.current[TOTAL_SCROLL_FRAMES - 1] = img;
        setFirstFrameReady(true);
        setLoadedCount(1);
      };
      img.src = getFrameUrl(TOTAL_SCROLL_FRAMES - 1, isMobile);
      return;
    }

    let cancelled = false;
    framesRef.current = new Array(TOTAL_SCROLL_FRAMES).fill(null);
    let loaded = 0;

    const queued = new Set<number>();
    const priorityIndices: number[] = [];
    const backgroundIndices: number[] = [];

    for (let i = 0; i < PRIORITY_INITIAL_COUNT; i++) {
      priorityIndices.push(i);
      queued.add(i);
    }
    for (let i = 0; i < TOTAL_SCROLL_FRAMES; i += KEYFRAME_STRIDE) {
      if (!queued.has(i)) {
        priorityIndices.push(i);
        queued.add(i);
      }
    }
    if (!queued.has(TOTAL_SCROLL_FRAMES - 1)) {
      priorityIndices.push(TOTAL_SCROLL_FRAMES - 1);
      queued.add(TOTAL_SCROLL_FRAMES - 1);
    }
    for (let i = 0; i < TOTAL_SCROLL_FRAMES; i++) {
      if (!queued.has(i)) {
        backgroundIndices.push(i);
        queued.add(i);
      }
    }

    const loadSingle = (index: number): Promise<void> =>
      new Promise((resolve) => {
        if (cancelled) return resolve();
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (cancelled) return resolve();
          framesRef.current[index] = img;
          loaded += 1;
          if (index === 0) setFirstFrameReady(true);
          if (loaded % 8 === 0 || loaded === TOTAL_SCROLL_FRAMES || index === 0) {
            setLoadedCount(loaded);
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = getFrameUrl(index, isMobile);
      });

    const loadBatch = async (indices: number[]) => {
      for (let i = 0; i < indices.length; i += BATCH_SIZE) {
        if (cancelled) return;
        const slice = indices.slice(i, i + BATCH_SIZE);
        await Promise.all(slice.map(loadSingle));
        await new Promise<void>((res) => {
          if ("requestIdleCallback" in window) {
            window.requestIdleCallback(() => res(), { timeout: 120 });
          } else {
            setTimeout(res, 16);
          }
        });
      }
    };

    (async () => {
      await loadBatch(priorityIndices);
      if (!cancelled) {
        await loadBatch(backgroundIndices);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isMobile, prefersReducedMotion]);

  const getBestLoadedFrame = useCallback((targetIndex: number): HTMLImageElement | null => {
    const frames = framesRef.current;
    const clamped = Math.min(Math.max(targetIndex, 0), TOTAL_SCROLL_FRAMES - 1);
    if (frames[clamped]) return frames[clamped];

    for (let offset = 1; offset < TOTAL_SCROLL_FRAMES; offset++) {
      if (clamped - offset >= 0 && frames[clamped - offset]) {
        return frames[clamped - offset];
      }
      if (clamped + offset < TOTAL_SCROLL_FRAMES && frames[clamped + offset]) {
        return frames[clamped + offset];
      }
    }
    return null;
  }, []);

  return {
    isMobile,
    prefersReducedMotion,
    firstFrameReady,
    loadedCount,
    totalFrames: TOTAL_SCROLL_FRAMES,
    getBestLoadedFrame,
  };
}
