# Fana Cafe — 3D Floating Menu Redesign Status

> **Target Component:** [src/components/sections/MenuShowcaseSection.tsx](file:///c:/Users/jumal/Music/assets%20for%203d/fana-cafe/src/components/sections/MenuShowcaseSection.tsx)
> **Scope:** Menu section (`#menu`) + seamless top border removal on `#order` ([TableOrderCalloutSection.tsx](file:///c:/Users/jumal/Music/assets%20for%203d/fana-cafe/src/components/sections/TableOrderCalloutSection.tsx)) — Hero, Header, and Fana Experiences video cards untouched
> **Status:** Implemented, Linted (`0` errors), Built (`next build` exit `0`), and Verified across Desktop (`1440×900`), Tablet (`820×900`), and Mobile (`390×844`)

---

## 1. Asset Transparency & Edge Audit (All 27 Products)

Every menu image was audited at the pixel level (64×64 RGBA buffer alpha corner check + full 26-plate visual composite rendered directly over `#12100E` espresso dark):

| Asset Group | Count | Alpha Audit Result | Edge & Rendering Treatment |
| :--- | :---: | :--- | :--- |
| **`public/menu/*.webp`** (converted from `assets img/*.png`) | **26** | **26/26 true transparent cutouts** (`alpha = 0` at all 4 corners; `26.3% – 64.0%` transparent area per frame) | Rendered directly with `object-fit: contain` (zero cropping, zero opaque background boxes) and realistic floating drop-shadows over `#12100E` espresso dark. Zero white halos or edge fringing observed across all 26 plates. |
| **`/frames/frame_0368.webp`** (`Signature Ethiopian Macchiato`) | **1** | Non-alpha `1920×1080` dark studio photograph | Documented honestly as `isTransparentCutout: false`. Rendered with a soft radial feathered mask (`radial-gradient(ellipse 62% 68% at 50% 54%, black 55%, transparent 100%)`) so its dark wood background dissolves cleanly into `#12100E` with no visible rectangular edge. |

- **Source Preservation:** All 26 original PNG files in `assets img/` remain 100% untouched; existing optimized transparent WebP assets (`4.21 MB` total vs `51.71 MB` original PNGs, `-91.9%`) were preserved without lossy regeneration.
- **No Fabricated Data:** All 27 verified menu products, categories, subtitles, and `"In-cafe menu pricing"` labels in [src/data/menu.ts](file:///c:/Users/jumal/Music/assets%20for%203d/fana-cafe/src/data/menu.ts) were preserved without inventing prices or items.

---

## 2. 3D / 2.5D Horizontal Carousel Architecture

- **Perspective Stage:** Fixed-height (`320px` mobile / `390px` tablet / `450px` desktop, zero CLS) interactive stage with CSS `perspective: 1200px` and `touch-action: pan-y` so vertical page scrolling remains fluid on touchscreens.
- **Continuous GSAP Transform Engine:** A single continuous float index (`posProxyRef`) animated via `gsap.to(..., { duration: 0.65, ease: "power3.out" })` computes GPU-composited transforms for every visible plate (`|offset| <= 2.45`):
  - **Active Center Product (`|offset| ≈ 0`):** `scale: 1.06`, `opacity: 1.0`, `rotateY: 0deg`, `filter: none`, deep floating drop-shadow, grounded soft shadow ellipse underneath, and a layered warm amber/wood radial spotlight glow (`#F59E0B` / `#8B5A2B`) that gently pulses on activation.
  - **Immediate Previous & Upcoming Neighbors (`|offset| = 1`):** `scale: ~0.75`, `y: +16–22px`, subtle inward perspective turn (`rotateY: ±13deg`, keeping food natural and undistorted), `opacity: ~0.61`, `brightness(0.76) blur(1.1px)` — clickable to pull directly into focus.
  - **Far Edge Peeks (`|offset| = 2`):** `scale: ~0.46`, `opacity: ~0.22`, fading smoothly into left/right `#12100E` edge vignettes.
- **Supported Navigation Modes:**
  1. **Desktop Non-Trapping ScrollTrigger Sweep:** Gentle scroll-linked forward & backward preview sweep across opening plates (`start: "top 62%"`, `end: "bottom 38%"`) without trapping the visitor in a long pinned section; yields immediately to manual controls.
  2. **Pointer / Mouse Horizontal Drag** with momentum-aware snap.
  3. **Touch Horizontal Swipe** on mobile & tablet.
  4. **Trackpad Horizontal Wheel / Shift+Wheel** (`|deltaX| > |deltaY|`).
  5. **Previous / Next Arrows**, clicking neighboring plates, quick-jump indicator dots, and **Keyboard** (`ArrowLeft`, `ArrowRight`, `Home`, `End`).
- **Single-Item Mode:** When a category (e.g., `Coffee` — `01 / 01`) or search query (`"Injera"`) matches 1 item, Prev/Next buttons and indicator dots hide cleanly and the sole item centers in the spotlight with zero empty neighbor placeholders.

---

## 3. Atmospheric Espresso Background & Continuity

- Replaced the previous light beige grid with a deep espresso `#12100E` stage layered with:
  - Warm espresso-wood (`#8B5A2B`), amber gold (`#F59E0B`), and botanical green (`#1B4332`) low-opacity ambient radial lighting.
  - Fine inline SVG decorations at **`9%–10%` opacity** (concentric coffee-cup rings, rising steam curves behind the spotlight, and botanical coffee-leaf silhouettes tucked into outer corners) — strictly secondary to the floating food photography.
  - Soft `144px` top and bottom `#12100E` linear feathers and removal of `#order`'s hard `border-t`, ensuring `#spaces → #menu → #order` blend continuously with zero divider lines.

---

## 4. Responsive & Accessibility Behavior

- **Desktop (`1440×900`):** Large floating center plate (`410×370px` stage slot) flanked by 2–4 receding 3D neighbors, full category pill bar, search input, and open editorial product details (`Add to Order` opening the existing QR Table Ordering Drawer).
- **Tablet (`820×900`):** Tightened `340×310px` plate slot and responsive horizontal spacing with clean category pill wrapping and `0px` horizontal page overflow.
- **Mobile (`390×844`):** Prominent unclipped `260×240px` center plate with touch horizontal swiping (`touch-pan-y`), no pinned scroll hijack, and `0px` horizontal page overflow.
- **Reduced Motion (`prefers-reduced-motion: reduce`):** Disables 3D perspective tilt, glow pulsing, and ScrollTrigger motion, snapping cleanly between products without animation.
- **Image Loading Priority:** Active plate and immediate neighbors (`|idx - activeIndex| <= 1`) load eagerly (`loading="eager"`), while off-screen plates remain lazy (`loading="lazy"`).

---

## 5. Build & Verification Results

- **`npm run lint`:** Passed (`0` errors, `0` warnings).
- **`npm run build`:** Passed (Turbopack `3.2 s`, TypeScript strict `6.0 s`, static prerender `2.4 s`).
- **Live Browser QA (`http://localhost:3030`) — All 5 Suites Passed (`0` console errors):**
  - Seamless espresso transitions verified (`borderTopWidth === "0px"` on `#menu` & `#order`; dark `#12100E` canvas with zero opaque product boxes).
  - Verified all `27` products across all 7 categories (`All Plates: 27`, `Coffee: 1` single-item mode, `Smoothies: 3`, `Feast Boards: 3`, `Grills & Platters: 9`, `Wraps & Bites: 8`, `Patisserie: 3`) and live search (`"Injera"` → `01 / 01`).
  - Verified 3D transform hierarchy (`scale: 1.06, opacity: 1` active vs `scale: 0.75, rotateY: ±13deg, opacity: 0.607` neighbors) and warm spotlight glow.
  - Verified `Add to Order` launches the existing QR Table Ordering Drawer directly to the plate's modifier view and updates the navbar tray count cleanly.
  - Verified `0px` horizontal page overflow on Desktop (`1440×900`), Tablet (`820×900`), and Mobile (`390×844`).

---

## 6. Remaining Limitations
- **`Signature Ethiopian Macchiato` (`/frames/frame_0368.webp`):** Unlike the 26 studio RGBA cutouts, this hero frame does not have an alpha channel and is blended smoothly via a soft radial CSS mask until a dedicated transparent PNG/WebP macchiato cutout is supplied.
- **Pricing:** Displays verified `"In-cafe menu pricing"` placeholder copy until official ETB prices are provided for Phase 3 POS integration.
