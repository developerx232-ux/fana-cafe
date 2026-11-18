# Fana Cafe — System Architecture

> **Scroll-Driven 3D Storytelling Website + QR Table Ordering Platform**
> Location: 22 Mazoria, Addis Ababa | Stack: Next.js 15 · GSAP · Lenis · Tailwind CSS

---

## 1. Project Folder Structure

```
fana-cafe/
├── app/
│   ├── layout.tsx                   # Root layout: Lenis provider, font variables, metadata
│   ├── page.tsx                     # Assembles all scroll sections in order
│   ├── globals.css                  # Tailwind base + custom CSS variables
│   └── api/
│       └── order/
│           route.ts                 # POST /api/order — receive & persist table orders
│
├── components/
│   ├── canvas/                      # Three.js / scroll-driven frame canvas
│   │   ├── FrameCanvas.tsx          # <canvas> element that maps scrollY → frame index
│   │   ├── useFrameSequence.ts      # Hook: preload frames, return currentFrame(progress)
│   │   └── ScrollDriver.tsx         # GSAP ScrollTrigger pin wrapper + progress emitter
│   │
│   ├── sections/                    # Full-viewport scroll sections (Sections 01–04)
│   │   ├── HeroSection.tsx          # S01: 3D Macchiato scroll intro + tagline reveal
│   │   ├── VibeSection.tsx          # S02: Vibe grid — 3 autoplay muted mp4 clips
│   │   ├── MenuSection.tsx          # S03: Scroll-animated menu cards (food PNG assets)
│   │   └── OrderSection.tsx         # S04: CTA + QR table ordering entry point
│   │
│   ├── order-drawer/                # Instant QR Table Ordering Drawer (slide-in panel)
│   │   ├── OrderDrawer.tsx          # Root drawer component (open/close state)
│   │   ├── TableSelector.tsx        # Table number picker (1–20, highlighted grid)
│   │   ├── ItemBuilder.tsx          # Menu item + custom modifier selectors
│   │   ├── PaymentSelector.tsx      # Telebirr / CBE Birr / Card / Cash radio group
│   │   ├── OrderSummary.tsx         # Running total, item list, quantity controls
│   │   └── ConfirmButton.tsx        # Submit CTA → POST /api/order
│   │
│   ├── ui/                          # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   └── Sheet.tsx                # Headless slide-in sheet (wraps OrderDrawer)
│   │
│   └── layout/
│       ├── Navbar.tsx               # Sticky top nav with logo + "Order Now" CTA
│       └── Footer.tsx
│
├── lib/
│   ├── lenis.ts                     # Lenis smooth scroll singleton + RAF loop
│   ├── gsap.ts                      # GSAP + ScrollTrigger registration helper
│   └── utils.ts                     # clsx + tailwind-merge (cn utility)
│
├── data/
│   └── menu.ts                      # Static typed menu catalogue (categories + items)
│
├── public/
│   ├── frames/                      # Desktop WebP frame sequence (1920w, 30fps)
│   │   └── frame_0001.webp … frame_NNNN.webp
│   ├── frames-mobile/               # Mobile WebP frame sequence (720w, 30fps)
│   │   └── frame_0001.webp … frame_NNNN.webp
│   ├── videos/
│   │   ├── scroll_hero.mp4          # 3D Macchiato sequence — H.264 fallback
│   │   ├── juice_bar.mp4            # Juice & Ice Cream counter vibe
│   │   ├── workspace_hub.mp4        # Communal wooden table / laptop hub
│   │   └── tradition_mural.mp4      # Ceiling → Jebena/Mesob wall mural xfade
│   └── logo.png                     # 01_logo.png (Fana Cafe brand mark)
│
├── scripts/
│   └── process-assets.mjs           # FFmpeg pipeline (run once during setup)
│
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── ARCHITECTURE.md                  # ← this file
```

---

## 2. Frame Sequence & Scroll Section Mapping

### Source Video
| File | Duration | Role |
|------|----------|------|
| `dooog.mp4` | 20 s | AI-generated 3D Macchiato scroll sequence |

### Extraction Parameters
- **Frame rate:** 30 fps × 20 s = **600 total frames**
- **Desktop:** `public/frames/frame_0001.webp` → `frame_0600.webp` (1920 × auto, q75)
- **Mobile:** `public/frames-mobile/frame_0001.webp` → `frame_0600.webp` (720 × auto, q70)

### Frame-to-Section Mapping

| Scroll Section | Frame Range | Frames | Duration Equiv. | Description |
|----------------|-------------|--------|-----------------|-------------|
| **S01 — Hero Intro** | `0001` – `0120` | 120 | 0–4 s | Macchiato materializes from dark espresso void, tagline fades in |
| **S02 — Pour & Swirl** | `0121` – `0300` | 180 | 4–10 s | Liquid pour, steam wisps, foam rosetta forms |
| **S03 — Close-up Beauty** | `0301` – `0480` | 180 | 10–16 s | Hero product shot; menu cards enter from sides |
| **S04 — Brand CTA** | `0481` – `0600` | 120 | 16–20 s | Cup retreats, logo + "Order Now" drawer trigger appears |

### ScrollTrigger Pin Logic
```
Total pinned scroll height = 100vh × 4 sections = 400vh

progress 0.00 → 0.20 : Section 01 (frames 1–120)
progress 0.20 → 0.50 : Section 02 (frames 121–300)
progress 0.50 → 0.80 : Section 03 (frames 301–480)
progress 0.80 → 1.00 : Section 04 (frames 481–600)
```

**Frame index formula** (inside `useFrameSequence.ts`):
```ts
const frameIndex = Math.min(
  Math.round(scrollProgress * (totalFrames - 1)),
  totalFrames - 1
);
```

---

## 3. QR Table Ordering Drawer — Component Hierarchy & State Flow

### State Architecture

```
app/page.tsx
└── OrderDrawer (global state via Zustand or React Context)
    ├── open: boolean
    ├── tableNumber: number | null       (1–20)
    ├── items: OrderItem[]               [{ menuItemId, qty, modifiers }]
    ├── paymentMethod: PaymentMethod     'telebirr' | 'cbe_birr' | 'card' | 'cash'
    └── status: 'idle' | 'pending' | 'confirmed' | 'error'
```

### Component Hierarchy

```
<OrderDrawer open={open} onClose={...}>
  │
  ├── <Sheet>  ← slide-in from right, 448px wide on desktop, full-screen mobile
  │   │
  │   ├─ Header: "Your Order — Table {tableNumber}"
  │   │
  │   ├─ <TableSelector>
  │   │   └── Grid 5×4 (tables 1–20), tap to select
  │   │       State: tableNumber ∈ [1, 20]
  │   │
  │   ├─ <ItemBuilder>
  │   │   ├── Category tabs (Coffee · Juice · Food · Dessert)
  │   │   ├── <MenuCard> × N  (image, name, price, + button)
  │   │   └── <ModifierSheet> (per item)
  │   │       ├── Size:  Small / Regular / Large
  │   │       ├── Sugar: None / Less / Regular / Extra
  │   │       ├── Milk:  Oat / Almond / Regular / None
  │   │       └── Notes: free-text textarea (max 80 chars)
  │   │
  │   ├─ <OrderSummary>
  │   │   ├── Line items list (name · qty controls · price)
  │   │   └── Subtotal + "Service included"
  │   │
  │   ├─ <PaymentSelector>
  │   │   ├── 🟡 Telebirr        (most popular — highlighted by default)
  │   │   ├── 🔵 CBE Birr
  │   │   ├── 💳 Card
  │   │   └── 💵 Cash
  │   │
  │   └─ <ConfirmButton>
  │       ├── Disabled if: tableNumber == null || items.length == 0
  │       ├── onClick → POST /api/order { tableNumber, items, paymentMethod }
  │       └── Success → show confirmation toast + reset state
  │
  └── Overlay backdrop (click to close)
```

### Data Flow Diagram

```
User scans QR on table
        │
        ▼
  page.tsx loads with ?table=N
        │
        ▼
  OrderDrawer opens (pre-filled tableNumber=N)
        │
        ├── User taps menu items → ItemBuilder.addItem(item, modifiers)
        │                              ↓
        │                          Zustand store updates items[]
        │
        ├── User selects payment method → PaymentSelector.select(method)
        │                                      ↓
        │                                  store.paymentMethod = method
        │
        └── User taps "Confirm Order"
                │
                ▼
            POST /api/order
            {
              tableNumber: 7,
              items: [
                { id: "macchiato", qty: 2, modifiers: { size: "regular", sugar: "less" } },
                { id: "injera_feast", qty: 1, modifiers: { notes: "extra berbere" } }
              ],
              paymentMethod: "telebirr",
              timestamp: "2026-11-18T13:14:04+03:00"
            }
                │
                ▼
            API responds { orderId: "FAN-20261118-007", status: "received" }
                │
                ▼
            Toast: "✅ Order #007 placed! Your server will confirm shortly."
            Drawer closes, state resets.
```

### `data/menu.ts` Type Definitions

```ts
export type Category = "coffee" | "juice" | "food" | "dessert";

export interface Modifier {
  size?:  "small" | "regular" | "large";
  sugar?: "none" | "less" | "regular" | "extra";
  milk?:  "none" | "regular" | "oat" | "almond";
  notes?: string;
}

export interface MenuItem {
  id:          string;
  category:    Category;
  name:        string;
  nameAm?:     string;      // Amharic name (optional)
  priceETB:    number;
  imageAsset?: string;      // path relative to public/
  modifiers:   (keyof Modifier)[];
  popular?:    boolean;
}

export interface OrderItem {
  menuItem:  MenuItem;
  qty:       number;
  modifiers: Modifier;
}
```

---

## 4. Vibe Videos — On-Site Asset Assignment

| Output File | Source | Duration | Scene |
|-------------|--------|----------|-------|
| `juice_bar.mp4` | `VID20261114113338.mp4` (13 s) | 10 s trim | FANA JUICE yellow sign, pineapples, avocados, ice cream counter |
| `workspace_hub.mp4` | `VID20261114113548.mp4` (21 s) | 8 s trim (ss=5) | Long communal wooden table, QR stand, neon sign, laptop users |
| `tradition_mural.mp4` | `VID20261114113641.mp4` + `VID20261114113731.mp4` | 12 s xfade | Ceiling wood slats → dissolve → Jebena/Mesob/Sun mural |

**Alternate sources available (edited/):**
- `buna sikeda.mp4` (12 s, 28 MB) — polished branded edit, candidate for HeroSection background
- `first look vid 2–6.mp4` — color-graded vibe cuts, can populate the VibeSection grid

---

## 5. Technology Stack

| Layer | Library | Purpose |
|-------|---------|---------|
| Framework | Next.js 15 (App Router) | File-based routing, RSC, Image optimization |
| Styling | Tailwind CSS 4 | Utility-first; Fana color tokens |
| Scroll engine | Lenis | Smooth inertia scroll, normalized scroll progress |
| Animation | GSAP + ScrollTrigger | Frame canvas drive, section reveal, parallax |
| Icons | lucide-react | UI icons (cart, QR, arrow) |
| Utilities | clsx + tailwind-merge | Conditional class composition |
| State | Zustand (Phase 2) | Order drawer global state |
| API | Next.js Route Handlers | POST /api/order |

---

## 6. Performance Budget

| Asset | Target | Strategy |
|-------|--------|----------|
| Frame sequence (desktop) | ≤ 25 KB/frame | WebP q75, 1920w |
| Frame sequence (mobile) | ≤ 10 KB/frame | WebP q70, 720w |
| Vibe videos | < 1.5 MB each | H.264 crf28, 24fps, no audio |
| First paint | < 1.5 s | Frame 1 as `<img>` priority, rest lazy |
| LCP | < 2.5 s | Hero canvas above fold |

---

*Phase 2 will implement the UI components built on this architecture.*
