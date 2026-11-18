import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely, resolving conflicts correctly.
 * Usage: cn("px-4", condition && "py-2", "text-fana-gold")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Map a scroll progress value (0–1) to a frame index.
 * @param progress  Normalized scroll progress 0.0 → 1.0
 * @param total     Total number of frames
 */
export function progressToFrame(progress: number, total: number): number {
  return Math.min(Math.max(Math.round(progress * (total - 1)), 0), total - 1);
}

/**
 * Zero-pad a frame number to 4 digits for public/frames/frame_XXXX.webp
 */
export function frameFilename(index: number): string {
  return `frame_${String(index + 1).padStart(4, "0")}.webp`;
}

/**
 * Format Ethiopian Birr amount.
 */
export function formatETB(amount: number): string {
  return `${amount.toLocaleString("en-ET")} ETB`;
}
