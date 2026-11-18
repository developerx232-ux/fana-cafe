# Fana Cafe — System Architecture (Phase 2 Verified)

> **Scroll-Driven 3D Storytelling Website & Interactive QR Table Ordering Prototype**
> Location: 22 Mazoria, Addis Ababa | Stack: Next.js `16.4.6` (App Router, Turbopack) · React `19.3.0` · TypeScript `5` · Tailwind CSS `4.3.3` · GSAP `3.15.1` + ScrollTrigger · Lenis `1.3.27`

---

## 1. Implemented Folder Structure

```text
fana-cafe/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Root layout: LenisProvider, OrderDrawerProvider, global OrderDrawer
│   │   ├── page.tsx                       # Composes Navbar, 3D Scroll Story, Spaces, Open Kitchen, Menu, Table CTA & Footer
│   │   └── globals.css                    # Tailwind v4 (@import + @config + @theme Fana tokens) & reduced-motion rules
│   │
│   ├── components/
│   │   ├── canvas/                        # Scroll-driven 368-frame 3D coffee engine
│   │   │   ├── useFramePreloader.ts       # Progressive priority/idle batch loader (1920w desktop / 720w mobile) + reduced-motion bypass
│   │   │   ├── CoffeeScrollCanvas.tsx     # DPR-aware cover-fit sticky <canvas> + zero-CLS base poster + reduced-motion fallback
│   │   │   └── ScrollStoryExperience.tsx  # 400vh GSAP ScrollTrigger 4-chapter narrative (Sections 01–04) + gsap.context() cleanup
│   │   │
│   │   ├── sections/                      # On-site cafe experiences & interactive menu sections
│   │   │   ├── FanaExperiencesSection.tsx # #spaces: 4-card 1:1 horizontal video showcase (GSAP pinned desktop / touch snap mobile)
│   │   │   ├── MenuShowcaseSection.tsx    # #menu: 3D floating transparent-cutout horizontal menu carousel (27 items, glow, search, filters)
│   │   │   └── TableOrderCalloutSection.tsx # #order: Quick-select Tables 01–20 CTA jumping directly into QR Order Drawer
│   │   │
│   │   ├── order-drawer/                  # Instant QR Table Ordering Drawer (Frontend Prototype Flow)
│   │   │   ├── OrderDrawerProvider.tsx    # React Context state, ?table=1..20 QR URL hydration, Lenis/body scroll lock, Escape handler
│   │   │   ├── OrderDrawer.tsx            # Slide-over sheet with clear prototype disclosure, quick-add favorites & validation gate
│   │   │   ├── TableSelector.tsx          # 5×4 interactive Tables 01–20 radio grid
│   │   │   ├── ItemModifierModal.tsx      # Per-plate customization (Size / Sweetness / Milk / Spice + 80-char kitchen notes)
│   │   │   ├── CartItemsList.tsx          # Tray items, modifier chips, qty -/+ steppers & remove controls
│   │   │   ├── PaymentMethodSelector.tsx  # Telebirr / CBE Birr / Card / Cash simulated selection cards
│   │   │   └── OrderConfirmationView.tsx  # Demo receipt (DEMO-TXX-XXXX) with explicit no-live-order disclosure & reset action
│   │   │
│   │   └── layout/
│   │       ├── LenisProvider.tsx          # Initializes/destroys Lenis smooth scroll synced with GSAP ticker
│   │       ├── Navbar.tsx                 # Fixed dark-espresso glass header with Fana logo, smooth section links, table & cart badges
│   │       └── Footer.tsx                 # Verified-data-only brand footer (22 Mazoria, Addis Ababa)
│   │
│   ├── data/
│   │   └── menu.ts                        # Verified 27-item visual catalogue (26 PNG→WebP cutouts + Signature Macchiato, zero invented prices)
│   │
│   └── lib/
│       ├── experienceNav.ts               # Shared client event helper for jumping directly to any Experience Card (e.g., Open Kitchen → Card 03)
│       ├── gsap.ts                        # Client-safe GSAP + ScrollTrigger registration
│       ├── lenis.ts                       # Lenis singleton synced with ScrollTrigger.update, reduced-motion bypass, stop/start helpers
│       ├── useMediaQuery.ts               # SSR-safe React 19 useSyncExternalStore hook for breakpoints & prefers-reduced-motion
│       └── utils.ts                       # cn(), progressToFrame(), getFrameUrl(), createDemoOrderRef()
│
├── public/
│   ├── frames/                            # 368 desktop WebP frames (1920×1080, 30fps, q75, 11.55 MB total)
│   ├── frames-mobile/                     # 368 mobile WebP frames (720×405, 30fps, q70, 3.64 MB total)
│   ├── videos/
│   │   ├── juice_bar.mp4                  # 0.80 MB | 1280×720 | 24fps | 5.21s  | Card 01: Fresh Juice & Ice Cream
│   │   ├── workspace_hub.mp4              # 0.97 MB | 960×540  | 24fps | 7.58s  | Card 02: Work, Meet & Connect
│   │   ├── open_kitchen.mp4               # 2.06 MB | 1280×720 | 24fps | 9.92s  | Card 03: From Our Open Kitchen
│   │   ├── dining_experience.mp4          # 2.01 MB | 1280×720 | 24fps | 6.63s  | Card 04: The Fana Dining Experience
│   │   └── posters/                       # 4 high-res WebP posters (juice_bar, workspace_hub, open_kitchen, dining_experience)
│   ├── menu/                              # 26 transparent RGBA WebP plates (51.71 MB PNG → 4.21 MB WebP, -91.9%, 26/26 alpha intact)
│   ├── logo.png                           # Fana Queen / Fana Cafe circular brand mark (512×512)
│   ├── asset-manifest.json                # Verified counts, resolutions & sizes for frames, videos & menu summary
│   └── menu-manifest.json                 # Complete 26-item mapping (original PNG → WebP slug, dimensions, alpha, size savings)
│
├── scripts/
│   ├── process-assets.mjs                 # Phase 1 FFmpeg pipeline (368 WebP frames + 3 primary vibe MP4s)
│   ├── process-phase2-media.mjs           # Phase 2 FFmpeg pipeline (supplementary kitchen MP4 + 26 transparent menu WebPs)
│   └── FFMPEG_SETUP.md                    # FFmpeg pipeline reference
│
├── tailwind.config.ts                     # Fana brand tokens (fana-cream, fana-dark, fana-gold, fana-green, fana-wood)
├── next.config.ts                         # @tailwindcss/turbopack CSS loader + immutable static media cache headers
├── ARCHITECTURE.md                        # System architecture (this file)
└── PHASE2-STATUS.md                       # Phase 2 completion report, decisions, limitations & test results
```

---

## 2. 368-Frame 3D Scroll Sequence & Progressive Loading

- **Master Source:** `video/edited/buna sikeda.mp4` (`2560×1440`, `30 fps`, `12.28 s`, watermark-free)
- **Desktop Sequence (`public/frames/`):** `368` frames (`1920×1080`, q75, `11.55 MB` total, avg `32.1 KB/frame`)
- **Mobile Sequence (`public/frames-mobile/`):** `368` frames (`720×405`, q70, `3.64 MB` total, avg `10.1 KB/frame`)

### Scroll Section 01–04 Frame Mapping

| Scroll Section | Scroll Progress | Frame Range | Visual Beat |
| :--- | :---: | :---: | :--- |
| **01 · Origin & Roast** | `0.00 – 0.25` | `0001 – 0092` | Roasted Ethiopian coffee beans suspended in deep espresso light |
| **02 · Aromatic Swirl** | `0.25 – 0.50` | `0093 – 0184` | Floating beans drifting into warm rising steam plumes |
| **03 · The Pour** | `0.50 – 0.78` | `0185 – 0287` | Beans & golden crema splash into double-walled glass on oak wood |
| **04 · Ready to Serve** | `0.78 – 1.00` | `0288 – 0368` | Calm steaming hero glass + Order to Your Table CTA |

### Progressive Loading & Accessibility Architecture
1. **Viewport-Aware Selection:** `useMediaQuery("(max-width: 767px)")` selects `/frames-mobile/` on mobile and `/frames/` on desktop.
2. **Two-Wave Progressive Preloader (`useFramePreloader.ts`):**
   - **Wave 1 (Priority):** First `24` frames + every `16th` keyframe anchor + final hero frame (`frame_0368`).
   - **Wave 2 (Background Idle):** Remaining frames fetched in batches of `12` yielded via `requestIdleCallback`.
   - **Nearest-Frame Fallback:** If the guest scrubs rapidly before a frame finishes buffering, `getBestLoadedFrame()` renders the nearest loaded frame with zero blank flashes.
3. **Reduced-Motion Fallback:** When `prefers-reduced-motion: reduce` is enabled, Lenis inertia scroll and bulk frame downloads are bypassed completely, rendering a crisp static hero section backed by `frame_0368.webp` alongside all 4 story beats.
4. **Cleanup Safety:** `ScrollTrigger` instances live inside `gsap.context()` and revert on unmount; Lenis unregisters its `gsap.ticker` callback and destroys cleanly on unmount.

---

## 3. On-Site Video Delivery & Lazy Loading

Every video card uses `LazyAmbientVideo.tsx`:
- Renders a fixed `aspect-video` container immediately to guarantee zero layout shift (CLS).
- Defers assigning the `<video src>` attribute until an `IntersectionObserver` (`rootMargin: "250px 0px"`) detects the section approaching the viewport — verified `src === ""` for all 4 videos on initial hero load.
- Plays automatically when `>= 25%` visible and pauses when scrolled away (or stays paused with a manual Play/Pause toggle under `prefers-reduced-motion`).
- `workspace_hub.mp4` remains the primary workspace showcase inside `SpaceVibeSection`; `open_kitchen_workspace.mp4` (`2.06 MB`, `1280×720`) is housed separately in `KitchenCraftSection`.

---

## 4. Instant QR Table Ordering Drawer (Frontend Prototype Flow)

```text
OrderDrawerProvider (Context + ?table=1..20 URL hydration + Lenis scroll lock)
├── Navbar                     → Opens drawer; displays active Table pill & live tray count
├── MenuShowcaseSection        → "Add to Table" opens ItemModifierModal directly for that plate
├── TableOrderCalloutSection   → Clicking Table 01–20 sets tableNumber & opens drawer
└── OrderDrawer                → Accessible slide-over dialog (448px desktop / 100vw mobile)
    ├── ItemModifierModal      → Size / Sweetness / Milk / Spice + 80-char notes → addToCart()
    ├── TableSelector          → Tables 01–20 interactive radio grid
    ├── CartItemsList          → Line items, modifier chips, qty -/+ steppers, remove
    ├── PaymentMethodSelector  → Telebirr (default), CBE Birr, Card, Cash (demo selection)
    └── OrderConfirmationView  → DEMO-TXX-XXXX summary + clear prototype disclosure (no live POS/payment)
```

> **Boundary Note (Phase 2):** No backend order dispatch or live Telebirr/CBE Birr/Card payment integration is connected yet. Pricing displays truthfully as `"In-cafe menu pricing"` with zero fabricated ETB numbers or credentials. Live POS & payment integration are reserved for Phase 3+.
