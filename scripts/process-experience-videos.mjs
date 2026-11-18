/**
 * Fana Cafe — Experience Cards Media Pipeline
 * ============================================
 * 1. Encodes `video/edited/first look vid 4.mp4` → `public/videos/open_kitchen.mp4`
 * 2. Encodes `video/edited/first look vid 5.mp4` → `public/videos/dining_experience.mp4`
 *    (Originals untouched; quality-first H.264 1280x720 @ 24fps, crf 26, -an, +faststart)
 * 3. Extracts high-quality WebP poster frames for all 4 Experience Card videos:
 *    - public/videos/posters/juice_bar.webp
 *    - public/videos/posters/workspace_hub.webp
 *    - public/videos/posters/open_kitchen.webp
 *    - public/videos/posters/dining_experience.webp
 * 4. Updates `public/asset-manifest.json` with verified metadata.
 *
 * Run: node scripts/process-experience-videos.mjs
 */

import { spawnSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW_ROOT = join(ROOT, "..");
const EDITED_DIR = join(RAW_ROOT, "video", "edited");
const VIDEOS_DIR = join(ROOT, "public", "videos");
const POSTERS_DIR = join(VIDEOS_DIR, "posters");

let FFMPEG;
try {
  const { default: ffmpegStatic } = await import("ffmpeg-static");
  FFMPEG = ffmpegStatic;
} catch {
  FFMPEG = "ffmpeg";
}

mkdirSync(POSTERS_DIR, { recursive: true });

function runFF(args, label) {
  console.log(`🎬 ${label}`);
  const r = spawnSync(FFMPEG, args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error(`❌ FAILED: ${label}\n`, r.stderr);
    process.exit(1);
  }
  console.log(`✅ Done: ${label}`);
}

function probe(filePath) {
  const r = spawnSync(FFMPEG, ["-i", filePath], { encoding: "utf8" });
  const err = r.stderr || "";
  const dur = (err.match(/Duration:\s*([\d:.]+)/) || [])[1] || "unknown";
  const res = (err.match(/Video:.*?(\d{2,4}x\d{2,4})/) || [])[1] || "unknown";
  const fps = (err.match(/([\d.]+)\s*fps/) || [])[1] || "unknown";
  const sizeMB = Number((statSync(filePath).size / (1024 * 1024)).toFixed(2));
  return { dur, res, fps, sizeMB };
}

// 1. Encode open_kitchen.mp4 from video/edited/first look vid 4.mp4
const kitchenSrc = join(EDITED_DIR, "first look vid 4.mp4");
const kitchenOut = join(VIDEOS_DIR, "open_kitchen.mp4");
if (!existsSync(kitchenSrc)) {
  console.error("❌ Missing source:", kitchenSrc);
  process.exit(1);
}
runFF(
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
  "first look vid 4.mp4 → public/videos/open_kitchen.mp4"
);

// 2. Encode dining_experience.mp4 from video/edited/first look vid 5.mp4
const diningSrc = join(EDITED_DIR, "first look vid 5.mp4");
const diningOut = join(VIDEOS_DIR, "dining_experience.mp4");
if (!existsSync(diningSrc)) {
  console.error("❌ Missing source:", diningSrc);
  process.exit(1);
}
runFF(
  [
    "-y",
    "-i", diningSrc,
    "-an",
    "-vf", "fps=24,scale=1280:-2:flags=lanczos",
    "-c:v", "libx264",
    "-crf", "26",
    "-preset", "slow",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    diningOut,
  ],
  "first look vid 5.mp4 → public/videos/dining_experience.mp4"
);

// 3. Extract crisp WebP posters for all 4 experience cards
const posterSpecs = [
  { name: "juice_bar", src: join(VIDEOS_DIR, "juice_bar.mp4"), ss: "00:00:00.8" },
  { name: "workspace_hub", src: join(VIDEOS_DIR, "workspace_hub.mp4"), ss: "00:00:01.5" },
  { name: "open_kitchen", src: kitchenOut, ss: "00:00:02.0" },
  { name: "dining_experience", src: diningOut, ss: "00:00:01.5" },
];

for (const spec of posterSpecs) {
  const outPoster = join(POSTERS_DIR, `${spec.name}.webp`);
  runFF(
    [
      "-y",
      "-ss", spec.ss,
      "-i", spec.src,
      "-frames:v", "1",
      "-c:v", "libwebp",
      "-quality", "82",
      outPoster,
    ],
    `Poster frame → public/videos/posters/${spec.name}.webp`
  );
}

// 4. Update public/asset-manifest.json
const manifestPath = join(ROOT, "public", "asset-manifest.json");
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : {};

manifest.updatedAt = new Date().toISOString();
manifest.videos = {
  ...(manifest.videos || {}),
  open_kitchen: { ...probe(kitchenOut), role: "experience_card_03" },
  dining_experience: { ...probe(diningOut), role: "experience_card_04" },
};
manifest.experiencePosters = posterSpecs.map((s) => {
  const p = join(POSTERS_DIR, `${s.name}.webp`);
  return {
    id: s.name,
    path: `/videos/posters/${s.name}.webp`,
    sizeKB: Number((statSync(p).size / 1024).toFixed(1)),
  };
});

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log("\n" + "=".repeat(64));
console.log("Experience Cards Media Summary:");
console.log("  open_kitchen.mp4      :", JSON.stringify(manifest.videos.open_kitchen));
console.log("  dining_experience.mp4 :", JSON.stringify(manifest.videos.dining_experience));
console.log("  Posters               :", JSON.stringify(manifest.experiencePosters));
console.log("=".repeat(64));
