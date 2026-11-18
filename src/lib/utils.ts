import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const TOTAL_SCROLL_FRAMES = 368;

/**
 * Map a normalized scroll progress value (0–1) to a 0-based frame index [0..total-1].
 */
export function progressToFrame(progress: number, total: number = TOTAL_SCROLL_FRAMES): number {
  return Math.min(Math.max(Math.round(progress * (total - 1)), 0), total - 1);
}

/**
 * Build public URL for a 0-based frame index.
 */
export function getFrameUrl(index: number, isMobile: boolean): string {
  const clamped = Math.min(Math.max(index, 0), TOTAL_SCROLL_FRAMES - 1);
  const padded = String(clamped + 1).padStart(4, "0");
  return isMobile
    ? `/frames-mobile/frame_${padded}.webp`
    : `/frames/frame_${padded}.webp`;
}

/**
 * Generate a clearly marked client-side prototype reference ID (no backend order created).
 */
export function createDemoOrderRef(tableNumber: number): string {
  const tablePad = String(tableNumber).padStart(2, "0");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `DEMO-T${tablePad}-${suffix}`;
}
