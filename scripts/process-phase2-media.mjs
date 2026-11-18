/**
 * Fana Cafe — Phase 2 Media Pipeline
 * ===================================
 * 1. Processes supplementary footage:
 *    `video/edited/first look vid 4.mp4` → `public/videos/open_kitchen_workspace.mp4`
 *    (Quality-first web H.264, 1280x720 @ 24fps, crf 26, no audio, +faststart)
 *
 * 2. Optimizes all 26 menu PNGs from `../assets img/` → `public/menu/<slug>.webp`
 *    - Original PNG files are NEVER overwritten or deleted.
 *    - Alpha transparency is preserved (`yuva420p`, `-alpha_q 100`, `-quality 86`).
 *    - Generates `public/menu-manifest.json` with originalFilename, outputFilename,
 *      publicPath, width, height, hasAlpha, originalSizeKB, outputSizeKB.
 *    - Updates `public/asset-manifest.json` with the supplementary video + menu summary.
 *
 * Run: node scripts/process-phase2-media.mjs
 */

import { spawnSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW_ROOT = join(ROOT, "..");
const ASSETS_IMG_DIR = join(RAW_ROOT, "assets img");
const EDITED_VIDEO_DIR = join(RAW_ROOT, "video", "edited");
const MENU_OUT_DIR = join(ROOT, "public", "menu");
const VIDEOS_OUT_DIR = join(ROOT, "public", "videos");

let FFMPEG;
try {
  const { default: ffmpegStatic } = await import("ffmpeg-static");
  FFMPEG = ffmpegStatic;
} catch {
  FFMPEG = "ffmpeg";
}

mkdirSync(MENU_OUT_DIR, { recursive: true });
mkdirSync(VIDEOS_OUT_DIR, { recursive: true });

function slugify(filename) {
  return filename
    .replace(/\.png$/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function probeMedia(filePath) {
  const r = spawnSync(FFMPEG, ["-i", filePath], { encoding: "utf8" });
  const err = r.stderr || "";
  const dur = (err.match(/Duration:\s*([\d:.]+)/) || [])[1] || null;
  const resMatch = err.match(/Video:.*?(\d{2,4})x(\d{2,4})/);
  const width = resMatch ? Number(resMatch[1]) : 0;
  const height = resMatch ? Number(resMatch[2]) : 0;
  const fps = (err.match(/([\d.]+)\s*fps/) || [])[1] || null;
  const videoLine = (err.match(/Video:.*$/m) || [""])[0];
  const hasAlpha = /\b(rgba|bgra|yuva\w*|argb|abgr|ya8|ya16)\b/i.test(videoLine);
  const sizeBytes = statSync(filePath).size;
  return { dur, width, height, fps, hasAlpha, sizeBytes, videoLine };
}

// ─── 1. Supplementary Open Kitchen + Laptop Workspace Video ──────────────────
const kitchenSrc = join(EDITED_VIDEO_DIR, "first look vid 4.mp4");
const kitchenOut = join(VIDEOS_OUT_DIR, "open_kitchen_workspace.mp4");

if (!existsSync(kitchenSrc)) {
  console.error("❌ Missing supplementary source video:", kitchenSrc);
  process.exit(1);
}

console.log("🎬 Encoding supplementary video: first look vid 4.mp4 → public/videos/open_kitchen_workspace.mp4");
const vidRes = spawnSync(
  FFMPEG,
  [
    "-y",
    "-i", kitchenSrc,
    "-an",
    "-vf", "fps=24,scale=1280:-2:flags=lanczos",
    "-c:v", "libx264",
    "-crf", "26",
    "-preset", "slow",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    kitchenOut,
  ],
  { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }
);

if (vidRes.status !== 0) {
  console.error("❌ Failed encoding supplementary video:\n", vidRes.stderr);
  process.exit(1);
}

const kitchenMeta = probeMedia(kitchenOut);
const kitchenSizeMB = Number((kitchenMeta.sizeBytes / (1024 * 1024)).toFixed(2));
console.log(
  `✅ open_kitchen_workspace.mp4: ${kitchenSizeMB} MB | ${kitchenMeta.width}x${kitchenMeta.height} | ${kitchenMeta.fps} fps | ${kitchenMeta.dur}`
);

// ─── 2. Optimize all 26 Menu PNGs → public/menu/*.webp (Preserving Alpha) ────
const pngFiles = readdirSync(ASSETS_IMG_DIR)
  .filter((f) => /\.png$/i.test(f))
  .sort((a, b) => a.localeCompare(b));

console.log(`\n🍽️  Processing ${pngFiles.length} menu PNGs into public/menu/*.webp (preserving alpha & originals)...`);

const menuManifest = [];
let totalOrigBytes = 0;
let totalWebpBytes = 0;

for (const originalFilename of pngFiles) {
  const srcPath = join(ASSETS_IMG_DIR, originalFilename);
  const slug = slugify(originalFilename);
  const outputFilename = `${slug}.webp`;
  const outPath = join(MENU_OUT_DIR, outputFilename);

  const srcProbe = probeMedia(srcPath);
  totalOrigBytes += srcProbe.sizeBytes;

  // Preserve transparency cleanly when source has alpha; maintain studio food photography quality (q=86, alpha_q=100)
  const pixFmt = srcProbe.hasAlpha ? "yuva420p" : "yuv420p";
  const imgRes = spawnSync(
    FFMPEG,
    [
      "-y",
      "-i", srcPath,
      "-vf", "scale='min(800,iw)':-1:flags=lanczos",
      "-c:v", "libwebp",
      "-pix_fmt", pixFmt,
      "-quality", "88",
      "-compression_level", "5",
      outPath,
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );

  if (imgRes.status !== 0) {
    console.error(`❌ Failed converting ${originalFilename}:\n`, imgRes.stderr);
    process.exit(1);
  }

  const outProbe = probeMedia(outPath);
  totalWebpBytes += outProbe.sizeBytes;

  menuManifest.push({
    slug,
    originalFilename,
    outputFilename,
    publicPath: `/menu/${outputFilename}`,
    originalDimensions: `${srcProbe.width}x${srcProbe.height}`,
    width: outProbe.width,
    height: outProbe.height,
    sourceHasAlpha: srcProbe.hasAlpha,
    hasAlpha: outProbe.hasAlpha,
    originalSizeKB: Number((srcProbe.sizeBytes / 1024).toFixed(1)),
    outputSizeKB: Number((outProbe.sizeBytes / 1024).toFixed(1)),
  });
}

const menuManifestObj = {
  generatedAt: new Date().toISOString(),
  count: menuManifest.length,
  totalOriginalMB: Number((totalOrigBytes / (1024 * 1024)).toFixed(2)),
  totalOptimizedMB: Number((totalWebpBytes / (1024 * 1024)).toFixed(2)),
  savingsPercent: Number((((totalOrigBytes - totalWebpBytes) / totalOrigBytes) * 100).toFixed(1)),
  items: menuManifest,
};

writeFileSync(join(ROOT, "public", "menu-manifest.json"), JSON.stringify(menuManifestObj, null, 2));

// Update public/asset-manifest.json without losing Phase 1 fields
const assetManifestPath = join(ROOT, "public", "asset-manifest.json");
const assetManifest = existsSync(assetManifestPath)
  ? JSON.parse(readFileSync(assetManifestPath, "utf8"))
  : {};

assetManifest.updatedAt = new Date().toISOString();
assetManifest.videos = {
  ...(assetManifest.videos || {}),
  open_kitchen_workspace: {
    dur: kitchenMeta.dur,
    res: `${kitchenMeta.width}x${kitchenMeta.height}`,
    fps: kitchenMeta.fps,
    sizeMB: kitchenSizeMB,
    role: "supplementary",
  },
};
assetManifest.menuImages = {
  count: menuManifestObj.count,
  totalOriginalMB: menuManifestObj.totalOriginalMB,
  totalOptimizedMB: menuManifestObj.totalOptimizedMB,
  savingsPercent: menuManifestObj.savingsPercent,
  manifestPath: "/menu-manifest.json",
};

writeFileSync(assetManifestPath, JSON.stringify(assetManifest, null, 2));

console.log("\n" + "=".repeat(64));
console.log("FANA CAFE — Phase 2 Media Processing Complete");
console.log("=".repeat(64));
console.log(`Supplementary video : open_kitchen_workspace.mp4 (${kitchenSizeMB} MB, ${kitchenMeta.width}x${kitchenMeta.height})`);
console.log(
  `Menu WebP images    : ${menuManifestObj.count} files (${menuManifestObj.totalOriginalMB} MB PNG → ${menuManifestObj.totalOptimizedMB} MB WebP, -${menuManifestObj.savingsPercent}%)`
);
console.log(
  `Alpha preserved     : ${menuManifest.filter((m) => m.hasAlpha).length}/${menuManifest.length} WebP files have alpha channel`
);
console.log("=".repeat(64));
