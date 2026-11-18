"use client";

import { useEffect, useRef } from "react";
import { TOTAL_SCROLL_FRAMES } from "@/lib/utils";

interface CoffeeScrollCanvasProps {
  currentFrame: number;
  getBestLoadedFrame: (index: number) => HTMLImageElement | null;
  firstFrameReady: boolean;
  prefersReducedMotion: boolean;
  isMobile: boolean;
}

/**
 * Full-bleed sticky <canvas> for rendering the 368-frame 3D coffee scroll sequence.
 * - Uses object-cover style drawing with devicePixelRatio scaling (capped at 2 for mobile smoothness).
 * - Renders a zero-CLS static poster image underneath until frame 1 paints.
 * - Falls back cleanly to a high-res hero frame when `prefers-reduced-motion` is enabled.
 */
export default function CoffeeScrollCanvas({
  currentFrame,
  getBestLoadedFrame,
  firstFrameReady,
  prefersReducedMotion,
  isMobile,
}: CoffeeScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentFrameRef = useRef<number>(currentFrame);

  useEffect(() => {
    currentFrameRef.current = currentFrame;
  }, [currentFrame]);

  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const img = getBestLoadedFrame(frameIndex);
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    // Object-fit: cover math
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = targetW / targetH;

    let drawW = targetW;
    let drawH = targetH;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawH = targetW / imgRatio;
      offsetY = (targetH - drawH) / 2;
    } else {
      drawW = targetH * imgRatio;
      offsetX = (targetW - drawW) / 2;
    }

    ctx.fillStyle = "#12100E";
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  };

  // Repaint whenever currentFrame or readiness changes
  useEffect(() => {
    if (prefersReducedMotion) return;
    drawFrame(currentFrame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFrame, firstFrameReady, prefersReducedMotion]);

  // Repaint on window resize
  useEffect(() => {
    if (prefersReducedMotion) return;
    let rafId = 0;
    const onResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => drawFrame(currentFrameRef.current));
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion]);

  const fallbackSrc = prefersReducedMotion
    ? isMobile
      ? `/frames-mobile/frame_${String(TOTAL_SCROLL_FRAMES).padStart(4, "0")}.webp`
      : `/frames/frame_${String(TOTAL_SCROLL_FRAMES).padStart(4, "0")}.webp`
    : isMobile
      ? "/frames-mobile/frame_0001.webp"
      : "/frames/frame_0001.webp";

  return (
    <div className="relative h-full w-full overflow-hidden bg-fana-dark">
      {/* Zero-CLS base poster image (also acts as reduced-motion & no-JS fallback) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fallbackSrc}
        alt="Fana Cafe 3D Ethiopian coffee ritual"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />

      {!prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full block"
        />
      )}

      {/* Atmospheric vignette & subtle warm espresso depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-fana-dark/70 via-transparent to-fana-dark/85"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(18,16,14,0.72)_100%)]"
      />
    </div>
  );
}
