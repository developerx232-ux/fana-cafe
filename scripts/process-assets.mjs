/**
 * Fana Cafe — Asset Processing Pipeline
 * =======================================
 * Uses ffmpeg-static (self-contained FFmpeg binary) so no system install is needed.
 *
 * Run:  node scripts/process-assets.mjs
 *
 * Outputs:
 *   public/frames/frame_%04d.webp         → 30fps desktop WebP sequence (1920w)
 *   public/frames-mobile/frame_%04d.webp  → 30fps mobile  WebP sequence (720w)
 *   public/videos/juice_bar.mp4           → Juice & Ice Cream counter vibe clip
 *   public/videos/workspace_hub.mp4       → Wooden table / laptop workspace clip
 *   public/videos/tradition_mural.mp4     → Ceiling + Jebena/Mesob wall mural merge
 *   public/videos/scroll_hero.mp4         → Concatenated 3D Macchiato scroll video
 */

import { execFileSync, spawnSync } from "child_process";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ─── Paths ───────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");
const ASSETS    = join("c:\\Users\\jumal\\Music\\assets for 3d");
const VIDEO_DIR = join(ASSETS, "video");
const EDITED    = join(ASSETS, "video", "edited");

// Try ffmpeg-static first, then fall back to system PATH
let FFMPEG;
try {
  const { default: ffmpegStatic } = await import("ffmpeg-static");
  FFMPEG = ffmpegStatic;
  console.log("✅ Using ffmpeg-static:", FFMPEG);
} catch {
  FFMPEG = "ffmpeg";
  console.log("⚠️  ffmpeg-static not found — trying system ffmpeg");
}

// ─── Directories ─────────────────────────────────────────────────────────────
const DIRS = [
  join(ROOT, "public", "frames"),
  join(ROOT, "public", "frames-mobile"),
  join(ROOT, "public", "videos"),
  join(ROOT, "scripts", "concat-lists"),
];
DIRS.forEach((d) => mkdirSync(d, { recursive: true }));

// ─── Helper: run ffmpeg ───────────────────────────────────────────────────────
function ff(args, label) {
  console.log(`\n🎬 ${label}`);
  console.log("   →", FFMPEG, args.slice(0, 6).join(" "), "...");
  const result = spawnSync(FFMPEG, args, { stdio: "inherit", maxBuffer: 512 * 1024 * 1024 });
  if (result.status !== 0) {
    console.error(`❌ FAILED: ${label} (exit ${result.status})`);
    process.exit(1);
  }
  console.log(`✅ Done: ${label}`);
}

// ─── Helper: get video duration via ffprobe ───────────────────────────────────
function getDuration(file) {
  let ffprobePath = "ffprobe";
  if (FFMPEG.includes("ffmpeg-static")) {
    ffprobePath = FFMPEG.replace("ffmpeg.exe", "ffprobe.exe").replace(/ffmpeg$/, "ffprobe");
  }
  try {
    const r = spawnSync(ffprobePath, [
      "-v", "quiet",
      "-print_format", "json",
      "-show_format",
      file
    ]);
    if (r.status === 0) {
      const data = JSON.parse(r.stdout.toString());
      return parseFloat(data.format.duration);
    }
  } catch {}
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSET MAP  (resolve which file serves which role)
// ─────────────────────────────────────────────────────────────────────────────
//
// Raw on-site captures (video/):
//   dooog.mp4             → 20s  9MB   → 3D macchiato scroll sequence (AI clip)
//   VID20261114113338.mp4 → 13s  17MB  → Juice & Ice Cream counter (FANA JUICE sign)
//   VID20261114113408.mp4 → 11s  14MB  → Juice counter – alternate angle
//   VID20261114113548.mp4 → 21s  27MB  → Workspace / communal wooden table (longest)
//   VID20261114113641.mp4 → 10s  14MB  → Ceiling wood slats & warm light
//   VID20261114113731.mp4 → 14s  18MB  → Jebena/Mesob wall mural
//   VID20261114113912.mp4 →  5s   7MB  → Additional cafe ambiance
//
// Edited / color-graded (video/edited/):
//   buna sikeda.mp4       → 12s  28MB  → "Buna Sikeda" branded hero (potential scroll hero)
//   first look vid.mp4    →  5s  18MB  → Edited vibe cut 1
//   first look vid 2.mp4  →  6s  23MB  → Edited vibe cut 2
//   first look vid 3.mp4  →  7s  26MB  → Edited vibe cut 3
//   first look vid 4.mp4  →  9s  33MB  → Edited vibe cut 4 (longest)
//   first look vid 5.mp4  →  6s  22MB  → Edited vibe cut 5
//   first look vid 6.mp4  →  5s  18MB  → Edited vibe cut 6

// NOTE: Resolution metadata via Shell API showed bitrate labels instead of pixel
// dimensions — this is a known Shell API quirk on some Windows builds.
// All VID20261114*.mp4 were shot on a modern smartphone so are likely 1080p or 4K.
// dooog.mp4 is the AI-generated 3D macchiato sequence.

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2a — 3D SCROLL SEQUENCE FRAMES (from dooog.mp4)
// ─────────────────────────────────────────────────────────────────────────────

const scrollSrc = join(VIDEO_DIR, "dooog.mp4");

// Desktop frames: 1920w, 30fps, WebP quality 75
ff([
  "-i", scrollSrc,
  "-vf", "scale=1920:-2,fps=30",
  "-compression_level", "4",         // WebP encoder level (0=fast,6=slow)
  "-q:v", "75",
  join(ROOT, "public", "frames", "frame_%04d.webp"),
], "3D Scroll → Desktop frames (1920w @30fps webp q75)");

// Mobile frames: 720w, 30fps, WebP quality 70
ff([
  "-i", scrollSrc,
  "-vf", "scale=720:-2,fps=30",
  "-compression_level", "4",
  "-q:v", "70",
  join(ROOT, "public", "frames-mobile", "frame_%04d.webp"),
], "3D Scroll → Mobile frames (720w @30fps webp q70)");

// Count frames extracted
const desktopCount = readdirSync(join(ROOT, "public", "frames")).filter(f => f.endsWith(".webp")).length;
const mobileCount  = readdirSync(join(ROOT, "public", "frames-mobile")).filter(f => f.endsWith(".webp")).length;
console.log(`\n📊 Frames extracted: ${desktopCount} desktop | ${mobileCount} mobile`);

// Also produce a concatenated scroll_hero.mp4 for <video> fallback
ff([
  "-i", scrollSrc,
  "-an",
  "-vf", "scale=1920:-2,fps=24",
  "-c:v", "libx264",
  "-crf", "26",
  "-preset", "slow",
  "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  "-y",
  join(ROOT, "public", "videos", "scroll_hero.mp4"),
], "3D Scroll → scroll_hero.mp4 (H.264 fallback)");

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2b — JUICE BAR VIBE VIDEO
// ─────────────────────────────────────────────────────────────────────────────
// Use VID20261114113338.mp4 (13s, Juice & Ice Cream counter — FANA JUICE sign)
// Best 10 seconds, crf 28 → target <1.5MB

ff([
  "-i", join(VIDEO_DIR, "VID20261114113338.mp4"),
  "-t", "10",                    // first 10 seconds
  "-an",                         // strip audio
  "-vf", "scale=1280:-2,fps=24",
  "-c:v", "libx264",
  "-crf", "28",
  "-preset", "slow",
  "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  "-y",
  join(ROOT, "public", "videos", "juice_bar.mp4"),
], "Juice counter → juice_bar.mp4 (H.264 crf28 no-audio)");

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2c — WORKSPACE HUB VIBE VIDEO
// ─────────────────────────────────────────────────────────────────────────────
// VID20261114113548.mp4 (21s) → best 8-second window of wooden table/laptop workspace

ff([
  "-i", join(VIDEO_DIR, "VID20261114113548.mp4"),
  "-ss", "5",                    // skip first 5s (allow camera to settle)
  "-t", "8",                     // 8-second continuous shot
  "-an",
  "-vf", "scale=1280:-2,fps=24",
  "-c:v", "libx264",
  "-crf", "28",
  "-preset", "slow",
  "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  "-y",
  join(ROOT, "public", "videos", "workspace_hub.mp4"),
], "Workspace table → workspace_hub.mp4 (8s trim, H.264 crf28)");

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2d — TRADITION MURAL (ceiling xfade + Jebena wall mural)
// ─────────────────────────────────────────────────────────────────────────────
// Ceiling:  VID20261114113641.mp4 (10s)
// Mural:    VID20261114113731.mp4 (14s)
// Cross-fade: take last 2s of ceiling, blend into first 2s of mural
// Output: 10 + 14 - 2 = 22s total → then trim to 12s best section

const ceilingInput = join(VIDEO_DIR, "VID20261114113641.mp4");
const muralInput   = join(VIDEO_DIR, "VID20261114113731.mp4");
const tempMerge    = join(ROOT, "public", "videos", "_tradition_merge_tmp.mp4");
const finalMural   = join(ROOT, "public", "videos", "tradition_mural.mp4");

// Normalize both clips first (scale + fps), then xfade
ff([
  "-i", ceilingInput,
  "-i", muralInput,
  "-filter_complex",
    // Scale both to 1280:-2 @24fps, then xfade with 1.5s dissolve
    "[0:v]scale=1280:-2,fps=24,setpts=PTS-STARTPTS[v0];" +
    "[1:v]scale=1280:-2,fps=24,setpts=PTS-STARTPTS[v1];" +
    "[v0][v1]xfade=transition=dissolve:duration=1.5:offset=8[vout]",
  "-map", "[vout]",
  "-an",
  "-c:v", "libx264",
  "-crf", "26",
  "-preset", "slow",
  "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  "-y",
  tempMerge,
], "Ceiling + Mural → cross-fade merge (temp)");

// Final trim: take best 12s from the merged clip
ff([
  "-i", tempMerge,
  "-t", "12",
  "-c:v", "libx264",
  "-crf", "28",
  "-preset", "slow",
  "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  "-y",
  finalMural,
], "tradition_mural.mp4 → final 12s trim + recompress crf28");

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY REPORT
// ─────────────────────────────────────────────────────────────────────────────

import { statSync } from "fs";

function sizeMB(path) {
  try { return (statSync(path).size / 1024 / 1024).toFixed(2) + " MB"; }
  catch { return "not found"; }
}

console.log("\n" + "=".repeat(60));
console.log("FANA CAFE — Asset Processing Complete");
console.log("=".repeat(60));
console.log(`Desktop frames : ${desktopCount} × public/frames/frame_XXXX.webp`);
console.log(`Mobile  frames : ${mobileCount} × public/frames-mobile/frame_XXXX.webp`);
console.log(`scroll_hero.mp4: ${sizeMB(join(ROOT, "public", "videos", "scroll_hero.mp4"))}`);
console.log(`juice_bar.mp4  : ${sizeMB(join(ROOT, "public", "videos", "juice_bar.mp4"))}`);
console.log(`workspace_hub.mp4 : ${sizeMB(join(ROOT, "public", "videos", "workspace_hub.mp4"))}`);
console.log(`tradition_mural.mp4 : ${sizeMB(join(ROOT, "public", "videos", "tradition_mural.mp4"))}`);
console.log("=".repeat(60));

// Warn if any video exceeds 1.5 MB
const videos = ["juice_bar.mp4", "workspace_hub.mp4", "tradition_mural.mp4"];
videos.forEach(v => {
  const p = join(ROOT, "public", "videos", v);
  try {
    const mb = statSync(p).size / 1024 / 1024;
    if (mb > 1.5) console.warn(`⚠️  ${v} is ${mb.toFixed(2)} MB (target <1.5 MB) — lower crf or trim further`);
  } catch {}
});
