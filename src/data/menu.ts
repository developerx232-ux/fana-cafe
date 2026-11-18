/**
 * Fana Cafe — Verified Visual Menu Catalogue
 * ==========================================
 * Every food/drink entry maps 1-to-1 to a verified asset in `public/menu/*.webp`
 * (converted from `assets img/*.png`) or the verified 3D Coffee Hero frame.
 *
 * NOTE: No prices, business hours, or external payment credentials are fabricated.
 * Pricing displays as "In-cafe menu pricing" until live POS data is supplied.
 */

export type MenuCategoryId =
  | "all"
  | "coffee"
  | "smoothies"
  | "heritage"
  | "platters"
  | "wraps"
  | "patisserie";

export type PaymentMethodId = "telebirr" | "cbe_birr" | "card" | "cash";

export type ModifierKind = "size" | "sweetness" | "milk" | "spice";

export interface SelectedModifiers {
  size?: "Small" | "Regular" | "Large";
  sweetness?: "No Sugar" | "Light" | "Regular" | "Extra";
  milk?: "Regular" | "Oat" | "Almond" | "Black / None";
  spice?: "Mild" | "Medium" | "Spicy";
  notes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: Exclude<MenuCategoryId, "all">;
  imagePath: string;
  imageWidth: number;
  imageHeight: number;
  isTransparentCutout: boolean;
  availableModifiers: ModifierKind[];
  featured?: boolean;
  subtitle: string;
}

export interface CartOrderItem {
  lineId: string;
  menuItem: MenuItem;
  qty: number;
  modifiers: SelectedModifiers;
}

export const MENU_CATEGORIES: { id: MenuCategoryId; label: string }[] = [
  { id: "all", label: "All Plates" },
  { id: "coffee", label: "Coffee" },
  { id: "smoothies", label: "Smoothies" },
  { id: "heritage", label: "Feast Boards" },
  { id: "platters", label: "Grills & Platters" },
  { id: "wraps", label: "Wraps & Bites" },
  { id: "patisserie", label: "Patisserie" },
];

export const MENU_ITEMS: MenuItem[] = [
  // ─── Signature Coffee (from verified 3D Coffee / Macchiato Hero) ───────────
  {
    id: "fana-signature-macchiato",
    name: "Signature Ethiopian Macchiato",
    category: "coffee",
    imagePath: "/frames/frame_0368.webp",
    imageWidth: 1920,
    imageHeight: 1080,
    isTransparentCutout: false,
    availableModifiers: ["size", "sweetness", "milk"],
    featured: true,
    subtitle: "Freshly pulled roast — customize size, sweetness & milk at your table",
  },

  // ─── Smoothies & Juices (3 verified PNG→WebP assets) ───────────────────────
  {
    id: "berry-smoothie-mason-jar-mug",
    name: "Berry Smoothie",
    category: "smoothies",
    imagePath: "/menu/berry-smoothie-mason-jar-mug.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["size", "sweetness"],
    featured: true,
    subtitle: "Served chilled in a mason jar from the Fana Juice counter",
  },
  {
    id: "guava-smoothie-mason-jar-garnish",
    name: "Guava Smoothie",
    category: "smoothies",
    imagePath: "/menu/guava-smoothie-mason-jar-garnish.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["size", "sweetness"],
    featured: true,
    subtitle: "Fresh tropical guava blend with fruit garnish",
  },
  {
    id: "papaya-smoothies-with-fresh-fruit-and-mint",
    name: "Papaya Smoothie with Mint",
    category: "smoothies",
    imagePath: "/menu/papaya-smoothies-with-fresh-fruit-and-mint.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["size", "sweetness"],
    subtitle: "Layered ripe papaya topped with fresh fruit and mint",
  },

  // ─── Feast Boards & Ethiopian Heritage (3 verified PNG→WebP assets) ────────
  {
    id: "ethiopian-injera-feast-with-stew-and-sides",
    name: "Ethiopian Injera Feast",
    category: "heritage",
    imagePath: "/menu/ethiopian-injera-feast-with-stew-and-sides.webp",
    imageWidth: 800,
    imageHeight: 533,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    featured: true,
    subtitle: "Traditional injera platter served with rich stews and sides",
  },
  {
    id: "vibrant-banana-leaf-feast-platter",
    name: "Banana Leaf Feast Platter",
    category: "heritage",
    imagePath: "/menu/vibrant-banana-leaf-feast-platter.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Vibrant communal sharing platter presented on banana leaf",
  },
  {
    id: "biryani-feast-on-wooden-board",
    name: "Biryani Feast Board",
    category: "heritage",
    imagePath: "/menu/biryani-feast-on-wooden-board.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    featured: true,
    subtitle: "Aromatic spiced rice feast served on a warm oak board",
  },

  // ─── Grills & Signature Platters (9 verified PNG→WebP assets) ──────────────
  {
    id: "glazed-beef-platter-with-rice-and-salad",
    name: "Glazed Beef Platter",
    category: "platters",
    imagePath: "/menu/glazed-beef-platter-with-rice-and-salad.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    featured: true,
    subtitle: "Glazed beef accompanied by seasoned rice and crisp garden salad",
  },
  {
    id: "glazed-beef-stir-fry-platter",
    name: "Glazed Beef Stir-Fry Platter",
    category: "platters",
    imagePath: "/menu/glazed-beef-stir-fry-platter.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Wok-seared glazed beef strips with fresh vegetables",
  },
  {
    id: "grilled-beef-rice-platter-on-wooden-board",
    name: "Grilled Beef & Rice Board",
    category: "platters",
    imagePath: "/menu/grilled-beef-rice-platter-on-wooden-board.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Char-grilled beef slices plated with rice on wooden board",
  },
  {
    id: "grilled-fish-feast-on-wooden-board",
    name: "Grilled Fish Feast Board",
    category: "platters",
    imagePath: "/menu/grilled-fish-feast-on-wooden-board.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    featured: true,
    subtitle: "Whole-style grilled fish feast with fresh garnishes on wood",
  },
  {
    id: "mixed-grill-kebab-platter-with-rice-and-salad",
    name: "Mixed Grill Kebab Platter",
    category: "platters",
    imagePath: "/menu/mixed-grill-kebab-platter-with-rice-and-salad.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Flame-grilled skewers with herbed rice and fresh salad",
  },
  {
    id: "gourmet-herb-sauced-grilled-plate",
    name: "Herb-Sauced Grilled Plate",
    category: "platters",
    imagePath: "/menu/gourmet-herb-sauced-grilled-plate.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Grilled entrée finished with house herb sauce",
  },
  {
    id: "rectangular-platter-with-salad-rice-and-beef-stir-fry",
    name: "Beef Stir-Fry & Salad Platter",
    category: "platters",
    imagePath: "/menu/rectangular-platter-with-salad-rice-and-beef-stir-fry.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Balanced tasting platter of stir-fried beef, rice, and greens",
  },
  {
    id: "salmon-rice-salad-and-golden-bread",
    name: "Salmon, Rice & Golden Bread",
    category: "platters",
    imagePath: "/menu/salmon-rice-salad-and-golden-bread.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Seared salmon served with rice, salad, and toasted golden bread",
  },
  {
    id: "colorful-noodle-platter-on-wooden-board",
    name: "Colorful Noodle Platter",
    category: "platters",
    imagePath: "/menu/colorful-noodle-platter-on-wooden-board.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Tossed noodles with vibrant market vegetables on a wooden board",
  },

  // ─── Wraps, Sandwiches & Bites (8 verified PNG→WebP assets) ────────────────
  {
    id: "gourmet-mini-burgers-with-potato-wedges",
    name: "Mini Burgers & Potato Wedges",
    category: "wraps",
    imagePath: "/menu/gourmet-mini-burgers-with-potato-wedges.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    featured: true,
    subtitle: "Trio of mini sliders paired with golden potato wedges",
  },
  {
    id: "grilled-wrap-platter-with-sauces",
    name: "Grilled Wrap Platter",
    category: "wraps",
    imagePath: "/menu/grilled-wrap-platter-with-sauces.webp",
    imageWidth: 800,
    imageHeight: 533,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Toasted wraps sliced for sharing with house dipping sauces",
  },
  {
    id: "grilled-wraps-with-crispy-potatoes",
    name: "Grilled Wraps & Crispy Potatoes",
    category: "wraps",
    imagePath: "/menu/grilled-wraps-with-crispy-potatoes.webp",
    imageWidth: 800,
    imageHeight: 533,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Pressed grilled wraps served alongside crispy potatoes",
  },
  {
    id: "savory-wraps-and-crispy-potato-platter",
    name: "Savory Wraps & Potato Platter",
    category: "wraps",
    imagePath: "/menu/savory-wraps-and-crispy-potato-platter.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Savory rolled wraps with golden crisp potatoes",
  },
  {
    id: "gourmet-egg-sandwich-board-with-potatoes",
    name: "Egg Sandwich Board",
    category: "wraps",
    imagePath: "/menu/gourmet-egg-sandwich-board-with-potatoes.webp",
    imageWidth: 800,
    imageHeight: 533,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Toasted egg sandwich board served with roasted potatoes",
  },
  {
    id: "gooey-toasted-sandwich-stack-with-ketchup",
    name: "Toasted Sandwich Stack",
    category: "wraps",
    imagePath: "/menu/gooey-toasted-sandwich-stack-with-ketchup.webp",
    imageWidth: 800,
    imageHeight: 533,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Melted toasted sandwich stack served warm",
  },
  {
    id: "casse-croute-fries-and-crispy-sandwich-sticks",
    name: "Casse-Croûte Fries & Sticks",
    category: "wraps",
    imagePath: "/menu/casse-croute-fries-and-crispy-sandwich-sticks.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Golden fries paired with crispy sandwich sticks",
  },
  {
    id: "crispy-croquette-ring-with-sauces",
    name: "Crispy Croquette Ring",
    category: "wraps",
    imagePath: "/menu/crispy-croquette-ring-with-sauces.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: ["spice"],
    subtitle: "Golden croquettes arranged around dipping sauces",
  },

  // ─── Bakery & Patisserie (3 verified PNG→WebP assets) ──────────────────────
  {
    id: "decadent-chocolate-layer-cake-platter",
    name: "Chocolate Layer Cake",
    category: "patisserie",
    imagePath: "/menu/decadent-chocolate-layer-cake-platter.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: [],
    featured: true,
    subtitle: "Rich layered dark chocolate cake platter",
  },
  {
    id: "napoleon-cake-squares-with-cream-rosettes",
    name: "Napoleon Cake Squares",
    category: "patisserie",
    imagePath: "/menu/napoleon-cake-squares-with-cream-rosettes.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: [],
    subtitle: "Crisp layered pastry squares topped with cream rosettes",
  },
  {
    id: "glossy-chocolate-drizzled-croissant-cluster",
    name: "Chocolate-Drizzled Croissants",
    category: "patisserie",
    imagePath: "/menu/glossy-chocolate-drizzled-croissant-cluster.webp",
    imageWidth: 800,
    imageHeight: 800,
    isTransparentCutout: true,
    availableModifiers: [],
    subtitle: "Flaky croissants finished with glossy chocolate drizzle",
  },
];

export const PAYMENT_METHODS: {
  id: PaymentMethodId;
  label: string;
  detail: string;
  badge?: string;
}[] = [
  {
    id: "telebirr",
    label: "Telebirr",
    detail: "Mobile wallet selection (demo preview)",
    badge: "Popular",
  },
  {
    id: "cbe_birr",
    label: "CBE Birr",
    detail: "Commercial Bank mobile pay (demo preview)",
  },
  {
    id: "card",
    label: "Card",
    detail: "Request card terminal at table",
  },
  {
    id: "cash",
    label: "Cash",
    detail: "Settle in person with your server",
  },
];

export const TABLE_NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1);
