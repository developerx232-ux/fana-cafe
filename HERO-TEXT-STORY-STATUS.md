# Fana Cafe — Hero Scroll-Driven Text Storytelling Report

> **Target Component:** `src/components/canvas/ScrollStoryExperience.tsx`
> **Media Preserved:** `368` desktop WebP frames (`public/frames/`) + `368` mobile WebP frames (`public/frames-mobile/`)
> **Status:** Implemented, Built (`next build` exit `0`), Linted (`eslint` exit `0`), and Verified across Desktop (`1440×900`) & Mobile (`390×844`)

---

## 1. Visual Frame Analysis (Desktop `16:10` & Mobile `9:19.5` Cover Crops)

Before placing or animating any hero copy, 24 representative frames spanning the full 368-frame sequence (`0001, 0016, 0032, …, 0368`) were compiled into contact sheets matching the exact viewport cover crops rendered by `CoffeeScrollCanvas.tsx`:
- **Desktop (`16:10` cover crop of `1920×1080`):** Preserves left/right flanking space around the centered coffee bean swarm, crema splash, and finished glass.
- **Mobile (`9:19.5` portrait cover crop of `720×405`):** Crops tightly to the central horizontal band — causing the coffee glass and splash (Frames `0188–0368`) to span the full width of the lower half (`y: 50%–100%`), while opening a deep, quiet dark upper zone (`y: 11%–46%`) directly above the glass.

### Key Composition Findings
1. **Frames `0001–0052` (Opening):** A large illuminated bean enters along the far right edge (`x: 68%–98%`); the entire left two-thirds (`x: 0%–65%`) on desktop and lower-left band on mobile are deep espresso black with delicate floating dust.
2. **Frames `0056–0110` (Macro Bean Sweep):** A hero macro coffee bean sweeps diagonally across the upper-center (`x: 34%–74%, y: 0%–62%`). On desktop, the **lower-right** opens into pure dark negative space; on mobile, the bean fills upper-center/upper-right, leaving the **lower band** open and dark.
3. **Frames `0116–0180` (Aroma & Rising Steam):** Beans and warm curling steam occupy the center and lower-right while the glass rim begins entering at bottom-center (`0160–0180`). Both desktop and mobile open clean dark negative space in the **upper-left** quadrant.
4. **Frames `0188–0254` (Splash & Pour):** The double-walled glass anchors dead-center-bottom (`x: 32%–68%, y: 45%–98%`) with a vertical column of falling beans and golden crema splash above it. On desktop, the **mid-right flank** is completely clear dark space; on mobile, the **upper-right** sits cleanly above the splash zone.
5. **Frames `0260–0314` (Settling Cup):** The splash calms into a central droplet and rising steam ribbon. Because the glass handle extends rightward (`x: 62%–71%`), the **mid-left flank** on desktop (and **upper-left** on mobile) offers the widest dark breathing room.
6. **Frames `0320–0368` (Finished Coffee):** The steaming hero cup rests serenely at bottom-center on dark wood. On desktop, the **upper-right** above the glass handle is serene negative space; on mobile, the **upper-center** frames the headline and CTAs cleanly above the untouched steaming glass in the lower half.

---

## 2. Visual Placement Map (Desktop vs. Mobile)

| Beat & Stage | Frame Range | Scroll Window | Main Visual Subject | Desktop Placement & Alignment | Mobile Placement & Alignment | Composition Reason |
| :--- | :---: | :---: | :--- | :--- | :--- | :--- |
| **1 · Opening** | `0001–0052` | `0.000 – 0.145` | Macro bean at far right; dark floating grounds across left | **Middle-Left** · `text-left` (+ Opening CTAs) | **Lower-Left** · `text-left` (+ Opening CTAs) | Wide pitch-black negative space on left (desktop) and lower void (mobile) |
| **2 · Coffee Origin** | `0056–0110` | `0.155 – 0.305` | Giant macro coffee bean gliding across upper-center | **Lower-Right** · `text-right` | **Lower-Left** · `text-left` | Desktop lower-right stays dark away from upper-center bean; mobile lower band clears diagonal bean |
| **3 · Aroma & Steam** | `0116–0180` | `0.315 – 0.490` | Swarming beans & curling steam plumes; glass rim enters bottom | **Upper-Left** · `text-left` | **Upper-Left** · `text-left` | Upper-left sky stays dark & open while steam fills center/lower-right and rim rises at bottom |
| **4 · Pour & Splash** | `0188–0254` | `0.505 – 0.690` | Double-walled glass centered with falling beans & crema splash | **Middle-Right** · `text-right` | **Upper-Right** · `text-right` | Desktop right flank clears center splash column; mobile upper-right sits cleanly above full-width glass |
| **5 · Cafe Experience** | `0260–0314` | `0.705 – 0.855` | Settling espresso surface, glass handle extending rightward | **Middle-Left** · `text-left` | **Upper-Left** · `text-left` | Left flank gives maximum distance from right-facing handle (desktop); dark upper steam zone (mobile) |
| **6 · Finished Coffee** | `0320–0368` | `0.870 – 1.000` | Calm steaming hero glass resting on dark timber | **Upper-Right** · `text-right` (+ Closing CTAs) | **Upper-Center** · `text-center` (+ Closing CTAs) | Desktop upper-right floats above handle; mobile upper-center frames the full steaming cup untouched below |

---

## 3. Removed Technical & Redundant Elements

Cleaned up all demo/technical overlays inside `#story` while preserving useful navbar elements (`Fana Cafe · 22 Mazoria · Addis Ababa`, nav links, and header `Order` button):
- Removed `FRAME 001 / 368` counter and `% buffered` readout.
- Removed redundant top-left `01 / 04 · 22 MAZORIA · ADDIS ABABA` pill inside the hero.
- Removed `01 ORIGIN / 02 AROMA / 03 POUR / 04 SERVE` technical text labels (replaced with an unobtrusive minimal dot indicator on desktop and a subtle bottom hairline progress bar).
- Renamed the navbar/footer link from `"3D Story"` to `"Story"` for a refined editorial feel.

---

## 4. Final Storytelling Messages (Zero Unsupported Claims)

Every message is concise, authentic to Fana Cafe's real spaces/menu, and avoids fabricated roasting or sourcing claims:

1. **Opening:** *"A little pause in the heart of Addis."* — *"Step into warmth, conversation, and a slower rhythm."*
2. **Coffee Origin:** *"Every great moment begins with a cup."* — *"Rich, unhurried, and poured fresh."*
3. **Aroma & Steam:** *"Take a breath. Stay a while."* — *"Soft light, rising aroma, and unhurried time."*
4. **Pour & Liquid:** *"Coffee, fresh juice, and something sweet."* — *"Crafted for mornings, cravings, and good company."*
5. **Cafe Experience:** *"A place to meet, work, and unwind."* — *"Warm oak tables, fresh air, and space to focus."*
6. **Finished Coffee:** *"Your Fana moment starts here."* — *"Explore what is fresh at the counter or step inside our spaces."*

---

## 5. Scroll Synchronization & CTA Refinements

- **GSAP ScrollTrigger Master Timeline:** A normalized `0 → 1` GSAP timeline inside `gsap.context()` is scrubbed in exact lockstep with the 368 frames across a `520vh` sticky stage.
  - Directional, restrained transitions (`22px` horizontal drift on desktop, `24–28px` vertical rise/lift, `power2.out` / `power2.in`).
  - Guaranteed non-overlapping breathing gaps (`0.01–0.015` progress buffer) between each beat's exit and the next beat's entrance.
  - Full bidirectional parity: scrolling backward reverses every entrance, exit, and negative-space placement cleanly.
- **Refined Hero CTAs:**
  - Primary: **`Explore Menu`** (`bg-fana-gold`, `#menu` smooth-scroll target).
  - Secondary: **`Discover Fana`** (translucent dark glass border, `#spaces` smooth-scroll target).
  - Header retains the dedicated **`Order`** button for the QR Table Ordering Drawer.
  - Hero CTAs appear cleanly on **Beat 1 (Opening)**, fade out during Beats 2–5 so storytelling remains uninterrupted, and return on **Beat 6 (Finished Coffee)** with `pointer-events` strictly gated to the active beat.
- **Reduced Motion Fallback:** Under `prefers-reduced-motion: reduce`, displays a static hero backed by `frame_0368.webp` with the opening message, refined CTAs, and a clean editorial grid of the remaining beats.

---

## 6. Verification & Test Results

- **`npm run lint`:** Exit `0` (`0` errors, `0` warnings).
- **`npm run build`:** Exit `0` (Turbopack compile `5.4 s`, TypeScript strict `9.6 s`, static prerender `3.2 s`).
- **Live Browser QA (`http://localhost:3030`) — All 5 Suites Passed (`0` console errors):**
  1. **Desktop Initial State & Clutter Removal (`1440×900`):** Verified `FRAME`, `01 / 04`, and `22 MAZORIA` hero pill are absent; Beat 1 renders on the left (`x: 56px`) with `Explore Menu` & `Discover Fana` below; Beats 2–6 have `opacity: 0`.
  2. **Desktop Forward Scroll (Beats 1 → 6):** Verified each beat appears at `opacity: 1` strictly inside its mapped negative-space region (Left → Lower-Right → Upper-Left → Mid-Right → Mid-Left → Upper-Right) with all other 5 beats at `opacity: 0` (zero overlap).
  3. **Desktop Backward Scroll (Beat 6 → 4 → 2 → 1):** Verified clean reverse transitions back to exact original positions and opacities with zero flicker.
  4. **CTA Navigation:** Verified `Explore Menu` smooth-scrolls cleanly to `#menu` and `Discover Fana` smooth-scrolls cleanly to `#spaces` docked neatly below the sticky navbar.
  5. **Mobile Composition (`390×844`):** Verified zero horizontal overflow (`382.4px <= 390px`), Beat 1 sits in lower-left (`y: 607.5px`) clear of the navbar, and Beats 4 & 6 sit cleanly in the dark upper half (`y: 96px–314px`) directly above the steaming coffee glass (rim starts `~380px`) with zero overlaps.
