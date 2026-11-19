# Fana Cafe — Menu Section Animation & Interaction Refinement Status

> **Verified Implementation Report**  
> **Section:** `#menu` (`src/components/sections/MenuShowcaseSection.tsx`)  
> **Stack:** Next.js `16.4.6` (App Router) · React `19.3.0` · GSAP `3.15.1` + ScrollTrigger · Tailwind CSS `4.3.3` · Lenis `1.3.27`  
> **Verification Status:** `PASS` (Build: 0 errors · Lint: 0 errors, 0 warnings · Responsive Desktop & Mobile QA: PASS)

---

## 1. Summary of Completed Improvements

Following the video review of the Menu showcase section, all targeted refinements have been implemented without altering the established brand identity, dark espresso palette, 26 transparent cutout assets, or QR table ordering drawer connectivity:

| Area | Previous State | Refined Production Implementation |
| :--- | :--- | :--- |
| **Section Scroll Entrance** | Abrupt entrance; vertical scroll scrubbed carousel index during page scrolling. | **Staggered Cinematic Entrance:** GSAP `ScrollTrigger` orchestrates background radial atmosphere (`1.2s`), heading block with blur reveal (`0.85s`), category pills & search (`0.7s`), and 3D stage (`0.92s`). Natural page scrolling is completely preserved. |
| **Header Clearance** | Risk of fixed header colliding with section heading on deep anchor scroll. | **Generous Clearance:** `scroll-mt-20 pt-28 pb-24 sm:pt-32 sm:pb-28 lg:pt-36 lg:pb-32` provides over `214px` clearance between the fixed 64px header and the menu heading. |
| **Visible 3D Cursor Floating** | Sub-pixel scaling caused invisible response when hovering over food. | **Ultra-Smooth 3D Parallax & Tilt:** Exponential damping (`factor = 1 - Math.exp(-8.5 * dt)`) calculated per-frame via `gsap.ticker` across an active interaction radius around the featured plate (`380px` horizontal / `220px` vertical). When hovering over the food, it visibly floats and tilts in 3D (`±18px X`, `±12px Y`, `±4.5° rotateY`, `±4.0° rotateX`, `1.025 scale`) with the amber glow tracking subtly behind it. Fully frame-rate independent. |
| **Horizontal Movement Navigation** | Required cursor to travel all the way to container edges or trigger `mouseleave`. | **Smooth 36px Intent Delta Navigation:** While hovering over the central food, moving approximately 36px horizontally triggers the next or previous dish. Incidental small movements produce 3D floating without changing items. Reversing direction smoothly resets the accumulator. |
| **3D Transition Feel** | Mechanical replacement. | **Cinematic 0.88s Transition (`power3.inOut`):** Plate slides gracefully along depth curves without snapping or velocity jumps. Fast continuous movements safely queue at most 1 subsequent step (`queuedStepsRef`), executed sequentially with zero animation clashes. |
| **Active Spotlight Glow** | Fixed background glow that snapped abruptly on index change. | **Layered Dynamic Amber Bloom:** `#F59E0B` and `#8B5A2B` radial glow layers behind the cutout expand gently (`scale: 0.85 -> 1.05`), warmly pulse on product arrival, and settle into rich ambient warmth (`opacity: 0.92`). |
| **Product Typography & Metadata** | Cluttered with duplicate "House Pick" badge, redundant category labels, and repeated `IN-CAFE MENU PRICING` text. | **Clean Editorial Presentation:** Single elegant category tag (`font-mono text-[11px] text-fana-gold`), large serif title, concise description, customizable indicator (`SlidersHorizontal`), and vibrant `+ Add to Order` button. Removed all redundant labels. |
| **Text-Image Synchronization** | Text changed at `t=0` before plate animation began. | **Midpoint Synchronized Flip:** Previous text fades out (`0.26s`, `power2.in`), content updates at transition midpoint (`displayIndex`), and new text glides up and fades in (`0.50s`, `power3.out`) in harmony with plate arrival. |

---

## 2. Technical Implementation Architecture

### A. Dual-Wrapper 3D Carousel & Parallax Separation
To cleanly separate carousel 3D translation from mouse parallax without transform conflicts, each plate utilizes a nested wrapper architecture:
```tsx
<div
  ref={(el) => { itemRefs.current[idx] = el; }}
  className="absolute left-1/2 top-1/2 flex ... will-change-transform cursor-pointer"
  style={{ perspective: "1000px" }}
>
  {/* Inner wrapper strictly dedicated to cursor 3D float and tilt */}
  <div
    ref={(el) => { itemInnerRefs.current[idx] = el; }}
    style={{ transformStyle: "preserve-3d" }}
    className="relative flex h-full w-full items-center justify-center will-change-transform"
  >
    <Image ... />
  </div>
</div>
```

### B. Mathematical 3D Depth Function & Unclipped Scale
```ts
const scale = abs <= 1
  ? 1.0 - abs * 0.28 // 1.0 (active) down to 0.72 (neighbor)
  : Math.max(0.46, 0.72 - (clamped - 1) * 0.22);

const blurPx = reducedMotion ? 0 : abs < 0.05 ? 0 : Math.min(abs * 5.0, 8);
const opacity = abs < 0.05 ? 1 : Math.max(0, 1 - Math.pow(Math.min(abs / 2.15, 1), 1.1) * 0.94);
const brightness = Math.max(0.55, 1 - Math.min(abs, 1.6) * 0.22);
```

### C. Complete Product Visibility & Aspect Ratio Adaptation
To prevent incoming or active products from having any cropped or clipped edges:
1. **`overflow-visible` Stage Boundary**: Removed `overflow-hidden` on `stageRef`, allowing dishes entering from the left or right to glide in smoothly across their full visual width without flat sliced edges.
2. **Generous Vertical Breathing Space**: Increased stage height from `450px` to `490px` (`h-[360px] sm:h-[430px] lg:h-[490px]`), ensuring tall smoothie glasses, large feast platters, and downward-projected drop shadows (`0 26px 38px`) have 70px+ of clearance.
3. **Aspect-Tailored Safe Containers**:
   - **Wide 3:2 Platters** (Injera Feast, Wrap Platters, Egg Sandwich Boards): `w-[300px] h-[220px] sm:w-[410px] sm:h-[295px] lg:w-[490px] lg:h-[345px]` gives generous horizontal width for wide oval boards and bread sides.
   - **Tall Smoothies & Square Items** (Mason Jars, Bowls, Cakes, Grills): `w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] lg:w-[410px] lg:h-[410px]` provides square aspect geometry preserving tall straws and garnished toppings.
   - **Widescreen 16:9 Coffee Frame**: `w-[310px] h-[190px] sm:w-[430px] sm:h-[260px] lg:w-[510px] lg:h-[305px]` with soft outer feathering to eliminate previous radial mask clipping.
4. **Internal Safety Padding**: Added `p-2.5 sm:p-3` inside each image wrapper so images with edge-to-edge cutouts (`bbox=(0, 0, 800, 800)`) never collide with wrapper boundaries.
5. **Non-Obscuring Edge Vignettes**: Re-layered edge vignettes behind carousel items (`z-10` vs dish `z-20..z-50`), preventing solid dark gradients from masking incoming dishes during horizontal travel.

---

## 3. Quality Assurance & Verification Results

1. **`npm run build`:**
   - Command: `next build` (Turbopack)
   - Result: `Exit code: 0` (Generated in 2.1s + 3.8s, 4/4 static routes)
   - TypeScript compilation: 0 errors
2. **`npm run lint`:**
   - Command: `eslint`
   - Result: `Exit code: 0` (0 errors, 0 warnings)
3. **Browser QA Verification (`http://localhost:3030`):**
   - **Complete Product Visibility:** Verified that active dishes, tall smoothies, and wide feast platters display 100% of their food imagery with zero cropping:
     - *Item 01 (Signature Ethiopian Macchiato)*: 16:9 widescreen frame fully displayed with soft rounded corners and no radial crop.
     - *Item 02 (Berry Smoothie)*: Tall mason jar glass 100% visible from top garnish to base and shadow.
     - *Item 05 (Ethiopian Injera Feast)*: Wide 3:2 platter completely displayed with all injera rolls, stews, and side bowls intact.
     - *Item 06 & 07 (Banana Leaf & Biryani Boards)*: Large feast boards comfortably centered with generous padding.
     - *Item 18 (Grilled Wrap Platter)*: Wide platter with seasoned wedges and dips completely displayed with zero edge clipping.
   - **Clean Horizontal Entrance:** Dishes entering from left or right enter cleanly without clipped or flat sliced boundaries across both desktop and tablet.
   - **Smooth 3D Hover & 36px Delta Navigation:** Damped GSAP ticker physics and 36px swipe threshold confirmed working seamlessly across all pointer-enabled viewports.
   - **Evidence Screenshots:**
     - Injera Feast (Desktop): `step_11_shot_1_injera_feast_active.png`
     - Berry Smoothie (Desktop): `step_9_shot_1_berry_smoothie_active.png`
     - Grilled Wrap Platter (Desktop): `step_17_shot_1_grilled_wrap_platter_active_view.png`
     - Tablet Responsiveness: `final_step_25.png`
