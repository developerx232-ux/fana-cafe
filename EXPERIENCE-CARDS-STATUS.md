# Fana Cafe — Horizontal Experience Video Cards Report

> **Section:** `Fana Experiences` (`#spaces`) — [src/components/sections/FanaExperiencesSection.tsx](file:///c:/Users/jumal/Music/assets%20for%203d/fana-cafe/src/components/sections/FanaExperiencesSection.tsx)
> **Page Position:** Immediately after the 3D Coffee Story (`#story`) and before the Interactive Visual Menu (`#menu`)
> **Status:** Implemented, Linted (`0` errors), Built (`next build` exit `0`), and Verified across Desktop (`1440×900`) & Mobile (`390×844`)

---

## 1. Verified Media Asset Mapping (`public/videos/`)

Original files in `video/edited/` were left untouched. Two new web-optimized H.264 MP4 outputs and four high-resolution WebP poster images were generated via [scripts/process-experience-videos.mjs](file:///c:/Users/jumal/Music/assets%20for%203d/fana-cafe/scripts/process-experience-videos.mjs) and registered in [public/asset-manifest.json](file:///c:/Users/jumal/Music/assets%20for%203d/fana-cafe/public/asset-manifest.json).

| Card | Title & Supporting Copy | Video Asset | Source Master | Specs & Size | Poster Image | Tuned `1:1` Framing |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | **Fresh Juice & Ice Cream**<br>*"Fresh moments, bright flavors."* | `/videos/juice_bar.mp4` | `video/edited/first look vid 6.mp4` | `1280×720`, `24fps`, `5.21 s`, `0.80 MB` | `/videos/posters/juice_bar.webp` (`84.5 KB`) | `object-[32%_center]` (frames `FANA JUICE` sign, ice cream stand & fresh fruit counter) |
| **02** | **Work, Meet & Connect**<br>*"A welcoming space to work, meet, and connect."* | `/videos/workspace_hub.mp4` | `video/edited/first look vid 3.mp4` | `960×540`, `24fps`, `7.58 s`, `0.97 MB` | `/videos/posters/workspace_hub.webp` (`104.2 KB`) | `object-[48%_center]` (frames oak communal table, bronze horse sculpture & QR stand) |
| **03** | **From Our Open Kitchen**<br>*"A closer look at the Fana experience."* | `/videos/open_kitchen.mp4` | `video/edited/first look vid 4.mp4` | `1280×720`, `24fps`, `9.92 s`, `2.06 MB` | `/videos/posters/open_kitchen.webp` (`101.7 KB`) | `object-[52%_center]` (frames both open kitchen chef & counterside laptop guest) |
| **04** | **The Fana Dining Experience**<br>*"Make room for good moments."* | `/videos/dining_experience.mp4` | `video/edited/first look vid 5.mp4` | `1280×720`, `24fps`, `6.63 s`, `2.01 MB` | `/videos/posters/dining_experience.webp` (`127.5 KB`) | `object-[58%_center]` (frames warm chandeliers, floral fruit arch, oak chairs & `FANA Cafe` sign) |

---

## 2. Page Order & Navigation Integration

- **Exact `<main>` Section Order Verified:**
  1. `#story` — 368-frame 3D Coffee Storytelling Hero
  2. `#spaces` — **Fana Experiences** (`Find Your Fana Moment.`) — 4-card horizontal square video showcase
  3. `#menu` — Interactive Visual Menu (`27` verified items)
  4. `#order` — Instant QR Table Ordering Callout (`Tables 01–20`)
- **Zero Duplication:** Replaced the previous separate spaces/kitchen grid blocks cleanly — no duplicate gallery or separate `#kitchen` section exists.
- **Direct Navigation Wiring (`src/lib/experienceNav.ts`):**
  - Header & Footer `SPACES` → smoothly lands at `#spaces` (`Card 01`).
  - Header & Footer `OPEN KITCHEN` → dispatches `fana:jump-experience` (`cardIndex: 2`) to glide directly to **Card 03 (`From Our Open Kitchen`)** inside `#spaces` on both desktop pinned scroll and mobile horizontal snap carousel.

---

## 3. Animation, Depth & Video Performance Architecture

- **Desktop Pinned Horizontal Scroll (`>= 1024px` + Full Motion):**
  - `340vh` scroll container with a `100dvh` sticky stage (`overflow-hidden`, zero horizontal page overflow).
  - Driven by GSAP `ScrollTrigger` (`scrub: true`, locked with Lenis smooth inertia scroll) updating track `translateX` and per-card GPU transforms continuously at 60fps:
    - **Active Card (`dist = 0`):** `scale: 1.00`, `opacity: 1.00`, `y: 0px`, `filter: none`, warm gold border & elevated depth shadow.
    - **Immediate Neighbors (`dist = 1`):** `scale: 0.855`, `opacity: 0.56`, `y: +16px`, `filter: brightness(0.72) blur(1.15px)` — partially visible on both sides while keeping footage recognizable.
  - Background ambient espresso radial glow shifts warmly per active experience card.
  - Full forward & backward scroll reversibility, plus clickable neighboring cards, `01 / 04` counter, Previous/Next buttons, clickable chapter tabs, bottom progress hairline, and `ArrowLeft`/`ArrowRight` keyboard support.
- **Mobile, Tablet & Reduced Motion (`< 1024px` OR `prefers-reduced-motion: reduce`):**
  - Switches cleanly to a native touch-friendly `snap-x snap-mandatory` horizontal carousel with square `aspect-square` cards (`78vw`, max `390px`), `11vw` edge gutters so adjacent cards peek naturally, and active-card scale/opacity emphasis — zero awkward scroll hijacking.
- **Lazy Video Loading & Poster Fallback:**
  - Zero `<video src>` attributes attached at initial hero load (`rootMargin: "320px 0px"` section observer).
  - Only the active card and its immediate neighbor (`Math.abs(idx - activeIndex) <= 1`) attach video `src`, and only the active card plays when `#spaces` is in view (pausing inactive/off-screen videos automatically).
  - Every card renders its high-res WebP poster beneath the `<video>` layer with fixed `aspect-square` (zero CLS and instant fallback if autoplay is restricted or reduced motion is enabled), plus an accessible Play/Pause toggle on the active card.

---

## 4. Verification & Test Results

- **`npm run lint`:** Exit `0` (`0` errors, `0` warnings).
- **`npm run build`:** Exit `0` (Turbopack compile `6.0 s`, TypeScript strict `12.7 s`, static prerender `5.9 s`).
- **Live Browser QA (`http://localhost:3030`) — All 5 Suites Passed (`0` console errors):**
  1. **Page Order & Lazy Deferral (`1440×900`, `scrollY = 0`):** Confirmed exact 4-section order (`#story → #spaces → #menu → #order`), zero duplicate sections, and `src = null` on all 4 experience `<video>` elements at hero load.
  2. **Desktop Pinned Scroll Forward & Reverse (`1440×900`):**
     - Verified strict `1:1` square ratio (`468×468` active, `400.14×400.14` neighbors, `0.0px` diff).
     - Confirmed Card 02 centered (`x: 482px`, `scale: 1.0`, `opacity: 1.0`, `filter: none`) with Card 01 left-peeking (`x: 3.9px`, `scale: 0.855`, `opacity: 0.56`) and Card 03 right-peeking (`x: 1027.9px`, `scale: 0.855`, `opacity: 0.56`).
     - Verified all 4 MP4 videos streamed cleanly (`HTTP 206`, `readyState = 4`, `error = null`) and all 4 WebP posters loaded (`HTTP 200`).
     - Verified reverse scrolling (`04 → 02 → 01`) cleanly restored earlier states and scrolling past Card 04 transitioned smoothly into `#menu` with zero horizontal page overflow (`1432px <= 1440px`).
  3. **`OPEN KITCHEN` Header Jump:** Clicking `OPEN KITCHEN` from `scrollY = 0` smoothly glided to `scrollY = 6120px` (`03 / 04`, *"From Our Open Kitchen"*).
  4. **Mobile Touch Carousel (`390×844`):** Confirmed non-pinned touch layout (`height: 794px`), zero horizontal page overflow (`382.4px <= 390px`), strict `1:1` square cards (`304.5×304.5`), and Next arrow advancing `01 / 04 → 02 / 04`.
