# FFmpeg Setup for Fana Cafe Asset Pipeline

The asset processing script (`scripts/process-assets.mjs`) requires FFmpeg. It uses `ffmpeg-static`, which downloads a pre-built FFmpeg binary automatically via npm.

## Automatic (Recommended)

After `npm install`, `ffmpeg-static` is included. The script uses it automatically:

```bash
node scripts/process-assets.mjs
```

## Manual Fallback (if ffmpeg-static fails)

Download FFmpeg for Windows from https://www.gyan.dev/ffmpeg/builds/ (use the "release essentials" build).

1. Extract to `C:\ffmpeg\`
2. Add `C:\ffmpeg\bin` to your system PATH
3. Verify: `ffmpeg -version`

Then re-run:
```bash
node scripts/process-assets.mjs
```

## Expected Output

| Path | Description |
|------|-------------|
| `public/frames/frame_0001–0600.webp` | 600 desktop frames @ 1920w, q75 |
| `public/frames-mobile/frame_0001–0600.webp` | 600 mobile frames @ 720w, q70 |
| `public/videos/scroll_hero.mp4` | H.264 scroll sequence fallback |
| `public/videos/juice_bar.mp4` | Juice counter, 10s, <1.5MB |
| `public/videos/workspace_hub.mp4` | Table workspace, 8s, <1.5MB |
| `public/videos/tradition_mural.mp4` | Ceiling xfade mural, 12s, <1.5MB |
