/**
 * Fana Cafe — Automated FFmpeg Asset Processing Pipeline
 * ======================================================
 * Uses bundled `ffmpeg-static` so no system FFmpeg installation is required.
 *
 * Run from `fana-cafe/`:
 *   node scripts/process-assets.mjs
 *
 * Verified Asset Mapping:
 *   - 3D Scroll Sequence:  video/edited/buna sikeda.mp4 (12.28s, 2560x1440 @ 30fps, clean/watermark-free)
 *   - Juice Bar Counter:   video/edited/first look vid 6.mp4 (5.20s, 2560x1440 @ 60fps — "FANA JUICE" sign & fruit counter)
 *   - Workspace Hub:       video/edited/first look vid 3.mp4 (7.62s, 2560x1440 @ 60fps — communal oak table, QR stand, horse sculpture, neon sign)
 *   - Ceiling Wood Slats:  video/edited/first look vid 2.mp4 (6.80s, 2560x1440 @ 60fps — wood slats, bougainvillea & warm yellow pillar)
 *   - Ethiopian Wall Mural: video/edited/first look vid.mp4  (5.27s, 2560x1440 @ 60fps — glowing Jebena, Mesob, sunset & Ice Cream banner)
 *
 * Outputs:
 *   public/frames/frame_%04d.webp         → 30fps desktop WebP sequence (1920w, q75)
 *   public/frames-mobile/frame_%04d.webp  → 30fps mobile WebP sequence (720w, q70)
 *   public/videos/juice_bar.mp4           → 24fps H.264, no audio, <1.5 MB
 *   public/videos/workspace_hub.mp4       → 24fps H.264, no audio, <1.5 MB
 *   public/videos/tradition_mural.mp4     → 24fps H.264 cross-fade (ceiling → mural), no audio, <1.5 MB
 */

import { spawnSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW_ROOT = join(ROOT, "..");
const EDITED_DIR = join(RAW_ROOT, "video", "edited");

// Resolve FFmpeg binary (ffmpeg-static first, fallback to PATH)
let FFMPEG;
try {
  const { default: ffmpegStatic } = await import("ffmpeg-static");
  FFMPEG = ffmpegStatic;
  console.log("✅ Using ffmpeg-static:", FFMPEG);
} catch {
  FFMPEG = "ffmpeg";
  console.log("⚠️  ffmpeg-static not found — falling back to system ffmpeg");
}

const FRAMES_DESKTOP = join(ROOT, "public", "frames");
const FRAMES_MOBILE = join(ROOT, "public", "frames-mobile");
const VIDEOS_OUT = join(ROOT, "public", "videos");

// Clean and recreate output directories so reruns are idempotent
for (const dir of [FRAMES_DESKTOP, FRAMES_MOBILE, VIDEOS_OUT]) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
  mkdirSync(dir, { recursive: true });
}

function runFFmpeg(args, label) {
  console.log(`\n🎬 ${label}`);
  const result = spawnSync(FFMPEG, args, {
    encoding: "utf8",
    maxBuffer: 512 * 1024 * 1024,
  });
  if (result.status !== 0) {
    console.error(`❌ FAILED: ${label} (exit ${result.status})`);
    console.error(result.stderr);
    process.exit(1);
  }
  console.log(`✅ Done: ${label}`);
}

function probeVideo(filePath) {
  const r = spawnSync(FFMPEG, ["-i", filePath], { encoding: "utf8" });
  const err = r.stderr || "";
  const dur = (err.match(/Duration:\s*([\d:.]+)/) || [])[1] || "unknown";
  const res = (err.match(/,\s*(\d{3,4}x\d{3,4})/) || [])[1] || "unknown";
  const fps = (err.match(/([\d.]+)\s*fps/) || [])[1] || "unknown";
  const sizeMB = (statSync(filePath).size / (1024 * 1024)).toFixed(2);
  return { dur, res, fps, sizeMB: Number(sizeMB) };
}

/**
 * Encode a vibe video under 1.5 MB:
 * Starts at crf 28 (1280w) and steps down scale/crf only if needed to strictly satisfy < 1.5 MB.
 */
function encodeUnderLimit(buildArgs, outPath, label, limitMB = 1.48) {
  const attempts = [
    { scale: "1280:-2", crf: "28" },
    { scale: "960:-2", crf: "28" },
    { scale: "854:-2", crf: "29" },
    { scale: "720:-2", crf: "30" },
  ];

  for (const { scale, crf } of attempts) {
    runFFmpeg(buildArgs(scale, crf, outPath), `${label} (scale=${scale}, crf=${crf})`);
    const mb = statSync(outPath).size / (1024 * 1024);
    console.log(`   📦 Size: ${mb.toFixed(2)} MB (target < 1.50 MB)`);
    if (mb <= limitMB) return mb;
    console.log(`   🔁 Exceeded ${limitMB} MB — retrying with tighter web compression...`);
  }
  return statSync(outPath).size / (1024 * 1024);
}

// ─── Verify source files exist ───────────────────────────────────────────────
const SOURCES = {
  scroll3d: join(EDITED_DIR, "buna sikeda.mp4"),
  juiceBar: join(EDITED_DIR, "first look vid 6.mp4"),
  workspace: join(EDITED_DIR, "first look vid 3.mp4"),
  ceiling: join(EDITED_DIR, "first look vid 2.mp4"),
  mural: join(EDITED_DIR, "first look vid.mp4"),
};

for (const [key, filePath] of Object.entries(SOURCES)) {
  if (!existsSync(filePath)) {
    console.error(`❌ Missing source asset [${key}]: ${filePath}`);
    process.exit(1);
  }
}

// ─── STEP 1: 3D Scroll Sequence → 30fps WebP (Desktop & Mobile) ──────────────
runFFmpeg(
  [
    "-y",
    "-i", SOURCES.scroll3d,
    "-vf", "fps=30,scale=1920:-1:flags=lanczos",
    "-c:v", "libwebp",
    "-quality", "75",
    "-compression_level", "4",
    join(FRAMES_DESKTOP, "frame_%04d.webp"),
  ],
  "3D Scroll Sequence → Desktop WebP (1920w @ 30fps, q75)"
);

runFFmpeg(
  [
    "-y",
    "-i", SOURCES.scroll3d,
    "-vf", "fps=30,scale=720:-1:flags=lanczos",
    "-c:v", "libwebp",
    "-quality", "70",
    "-compression_level", "4",
    join(FRAMES_MOBILE, "frame_%04d.webp"),
  ],
  "3D Scroll Sequence → Mobile WebP (720w @ 30fps, q70)"
);

const desktopFrames = readdirSync(FRAMES_DESKTOP).filter((f) => f.endsWith(".webp"));
const mobileFrames = readdirSync(FRAMES_MOBILE).filter((f) => f.endsWith(".webp"));
const desktopTotalMB =
  desktopFrames.reduce((acc, f) => acc + statSync(join(FRAMES_DESKTOP, f)).size, 0) / (1024 * 1024);
const mobileTotalMB =
  mobileFrames.reduce((acc, f) => acc + statSync(join(FRAMES_MOBILE, f)).size, 0) / (1024 * 1024);

// ─── STEP 2: On-Site Vibe Videos (24fps, no audio, H.264, <1.5 MB) ───────────

// 2a. juice_bar.mp4
const juiceOut = join(VIDEOS_OUT, "juice_bar.mp4");
encodeUnderLimit(
  (scale, crf, out) => [
    "-y",
    "-i", SOURCES.juiceBar,
    "-an",
    "-vf", `fps=24,scale=${scale}:flags=lanczos`,
    "-c:v", "libx264",
    "-crf", crf,
    "-preset", "slow",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    out,
  ],
  juiceOut,
  "Juice & Ice Cream Counter → public/videos/juice_bar.mp4"
);

// 2b. workspace_hub.mp4 (7.62s continuous pan of oak table, QR stand, horse sculpture & neon sign)
const workspaceOut = join(VIDEOS_OUT, "workspace_hub.mp4");
encodeUnderLimit(
  (scale, crf, out) => [
    "-y",
    "-i", SOURCES.workspace,
    "-t", "8",
    "-an",
    "-vf", `fps=24,scale=${scale}:flags=lanczos`,
    "-c:v", "libx264",
    "-crf", crf,
    "-preset", "slow",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    out,
  ],
  workspaceOut,
  "Communal Oak Table & Workspace Hub → public/videos/workspace_hub.mp4"
);

// 2c. tradition_mural.mp4 (Cross-fade Ceiling wood slats → Jebena/Mesob wall mural)
// Ceiling is 6.80s, Mural is 5.27s. Cross-fade 1.0s starting at offset 5.5s → ~10.77s total
const traditionOut = join(VIDEOS_OUT, "tradition_mural.mp4");
encodeUnderLimit(
  (scale, crf, out) => [
    "-y",
    "-i", SOURCES.ceiling,
    "-i", SOURCES.mural,
    "-filter_complex",
    `[0:v]fps=24,scale=${scale}:flags=lanczos,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v0];` +
      `[1:v]fps=24,scale=${scale}:flags=lanczos,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v1];` +
      `[v0][v1]xfade=transition=fade:duration=1.0:offset=5.5[vout]`,
    "-map", "[vout]",
    "-an",
    "-c:v", "libx264",
    "-crf", crf,
    "-preset", "slow",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    out,
  ],
  traditionOut,
  "Ceiling Wood Slats × Jebena Wall Mural (xfade) → public/videos/tradition_mural.mp4"
);

// ─── Manifest & Final Report ─────────────────────────────────────────────────
const manifest = {
  generatedAt: new Date().toISOString(),
  frames: {
    desktopCount: desktopFrames.length,
    mobileCount: mobileFrames.length,
    fps: 30,
    desktopTotalMB: Number(desktopTotalMB.toFixed(2)),
    mobileTotalMB: Number(mobileTotalMB.toFixed(2)),
    desktopAvgKB: Number(((desktopTotalMB * 1024) / desktopFrames.length).toFixed(1)),
    mobileAvgKB: Number(((mobileTotalMB * 1024) / mobileFrames.length).toFixed(1)),
  },
  videos: {
    juice_bar: probeVideo(juiceOut),
    workspace_hub: probeVideo(workspaceOut),
    tradition_mural: probeVideo(traditionOut),
  },
};

writeFileSync(join(ROOT, "public", "asset-manifest.json"), JSON.stringify(manifest, null, 2));

console.log("\n" + "=".repeat(64));
console.log("FANA CAFE — Asset Processing Verified Summary");
console.log("=".repeat(64));
console.log(
  `Desktop frames : ${manifest.frames.desktopCount} files (${manifest.frames.desktopTotalMB} MB total, avg ${manifest.frames.desktopAvgKB} KB/frame)`
);
console.log(
  `Mobile frames  : ${manifest.frames.mobileCount} files (${manifest.frames.mobileTotalMB} MB total, avg ${manifest.frames.mobileAvgKB} KB/frame)`
);
for (const [name, info] of Object.entries(manifest.videos)) {
  const status = info.sizeMB < 1.5 ? "✅" : "⚠️";
  console.log(`${status} ${name}.mp4 : ${info.sizeMB} MB | ${info.res} | ${info.fps} fps | ${info.dur}`);
}
console.log("=".repeat(64));
