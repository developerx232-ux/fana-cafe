/**
 * Fana Cafe — Static Menu Catalogue
 * All prices in Ethiopian Birr (ETB)
 */

export type Category = "coffee" | "juice" | "food" | "dessert";
export type PaymentMethod = "telebirr" | "cbe_birr" | "card" | "cash";

export interface Modifier {
  size?:  "small" | "regular" | "large";
  sugar?: "none" | "less" | "regular" | "extra";
  milk?:  "none" | "regular" | "oat" | "almond";
  notes?: string; // max 80 chars
}

export interface MenuItem {
  id:          string;
  category:    Category;
  name:        string;
  nameAm?:     string;      // Amharic name
  description: string;
  priceETB:    number;
  imageAsset?: string;      // path relative to public/
  modifiers:   (keyof Omit<Modifier, "notes">)[];
  popular?:    boolean;
  hasNotes:    boolean;
}

export interface OrderItem {
  menuItem:  MenuItem;
  qty:       number;
  modifiers: Modifier;
}

// ─────────────────────────────────────────────────────────────────────────────
// COFFEE & HOT DRINKS
// ─────────────────────────────────────────────────────────────────────────────
const coffeeItems: MenuItem[] = [
  {
    id: "macchiato",
    category: "coffee",
    name: "Macchiato",
    nameAm: "ማኪያቶ",
    description: "Traditional Ethiopian macchiato — bold espresso crowned with a dollop of steamed milk",
    priceETB: 55,
    modifiers: ["size", "sugar", "milk"],
    popular: true,
    hasNotes: true,
  },
  {
    id: "bunna",
    category: "coffee",
    name: "Ethiopian Coffee (Bunna)",
    nameAm: "ቡና",
    description: "Ceremonial-style black coffee brewed from freshly roasted Yirgacheffe beans",
    priceETB: 45,
    modifiers: ["sugar"],
    popular: true,
    hasNotes: false,
  },
  {
    id: "cappuccino",
    category: "coffee",
    name: "Cappuccino",
    description: "Equal parts espresso, steamed milk, and thick milk foam",
    priceETB: 95,
    modifiers: ["size", "sugar", "milk"],
    hasNotes: true,
  },
  {
    id: "latte",
    category: "coffee",
    name: "Latte",
    description: "Double espresso with silky steamed milk and light latte art",
    priceETB: 100,
    modifiers: ["size", "sugar", "milk"],
    hasNotes: true,
  },
  {
    id: "americano",
    category: "coffee",
    name: "Americano",
    description: "Long black espresso diluted with hot water",
    priceETB: 75,
    modifiers: ["size", "sugar"],
    hasNotes: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// JUICES & SMOOTHIES (Fana Juice Bar)
// ─────────────────────────────────────────────────────────────────────────────
const juiceItems: MenuItem[] = [
  {
    id: "avocado_juice",
    category: "juice",
    name: "Avocado Juice",
    nameAm: "አቮካዶ ጁስ",
    description: "Creamy blended avocado with a touch of honey and lemon",
    priceETB: 120,
    imageAsset: "assets img/Guava Smoothie Mason Jar Garnish.png",
    modifiers: ["size", "sugar"],
    popular: true,
    hasNotes: false,
  },
  {
    id: "mango_smoothie",
    category: "juice",
    name: "Mango Smoothie",
    description: "Fresh local mango blended with yogurt and honey",
    priceETB: 115,
    imageAsset: "assets img/Papaya Smoothies with Fresh Fruit and Mint.png",
    modifiers: ["size", "sugar"],
    popular: true,
    hasNotes: false,
  },
  {
    id: "berry_smoothie",
    category: "juice",
    name: "Berry Smoothie",
    description: "Mixed tropical berries blended with banana and coconut milk",
    priceETB: 130,
    imageAsset: "assets img/Berry Smoothie Mason Jar Mug.png",
    modifiers: ["size", "sugar"],
    hasNotes: true,
  },
  {
    id: "pineapple_juice",
    category: "juice",
    name: "Pineapple Juice",
    nameAm: "አናናስ ጁስ",
    description: "Fresh-pressed pineapple juice, lightly chilled",
    priceETB: 95,
    modifiers: ["size"],
    hasNotes: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FOOD
// ─────────────────────────────────────────────────────────────────────────────
const foodItems: MenuItem[] = [
  {
    id: "injera_feast",
    category: "food",
    name: "Ethiopian Injera Feast",
    nameAm: "ኢንጀራ ፍስት",
    description: "Spongy sourdough injera with choice of wot (stew) — Doro, Tibs, or Shiro",
    priceETB: 220,
    imageAsset: "assets img/Ethiopian Injera Feast with Stew and Sides.png",
    modifiers: [],
    popular: true,
    hasNotes: true,
  },
  {
    id: "grilled_beef_platter",
    category: "food",
    name: "Grilled Beef Platter",
    description: "Seasoned grilled beef strips with rice, garden salad, and house sauce",
    priceETB: 280,
    imageAsset: "assets img/Glazed Beef Platter with Rice and Salad.png",
    modifiers: [],
    hasNotes: true,
  },
  {
    id: "mini_burgers",
    category: "food",
    name: "Gourmet Mini Burgers",
    description: "Three slider burgers with crispy potato wedges and spiced ketchup",
    priceETB: 240,
    imageAsset: "assets img/Gourmet Mini Burgers with Potato Wedges.png",
    modifiers: [],
    popular: true,
    hasNotes: true,
  },
  {
    id: "grilled_wrap",
    category: "food",
    name: "Grilled Wrap Platter",
    description: "Warm tortilla wraps filled with grilled chicken, veggies, and tzatziki",
    priceETB: 210,
    imageAsset: "assets img/Grilled Wrap Platter with Sauces.png",
    modifiers: [],
    hasNotes: true,
  },
  {
    id: "biryani_feast",
    category: "food",
    name: "Biryani Feast",
    description: "Fragrant spiced biryani rice with slow-cooked beef and raita",
    priceETB: 260,
    imageAsset: "assets img/Biryani Feast on Wooden Board.png",
    modifiers: [],
    hasNotes: true,
  },
  {
    id: "egg_sandwich_board",
    category: "food",
    name: "Gourmet Egg Sandwich Board",
    description: "Toasted sourdough with fried eggs, avocado, and roasted potatoes",
    priceETB: 185,
    imageAsset: "assets img/Gourmet Egg Sandwich Board with Potatoes.png",
    modifiers: [],
    hasNotes: true,
  },
  {
    id: "salmon_rice",
    category: "food",
    name: "Salmon Rice & Salad",
    description: "Pan-seared salmon fillet on herbed rice with golden bread",
    priceETB: 320,
    imageAsset: "assets img/Salmon Rice Salad and Golden Bread.png",
    modifiers: [],
    hasNotes: true,
  },
  {
    id: "crispy_fries",
    category: "food",
    name: "Fries & Crispy Sandwich Sticks",
    description: "Classic crispy fries with stuffed sandwich bites and two dipping sauces",
    priceETB: 155,
    imageAsset: "assets img/Casse-Croûte Fries and Crispy Sandwich Sticks.png",
    modifiers: [],
    hasNotes: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DESSERTS
// ─────────────────────────────────────────────────────────────────────────────
const dessertItems: MenuItem[] = [
  {
    id: "chocolate_cake",
    category: "dessert",
    name: "Decadent Chocolate Layer Cake",
    description: "Three-layer dark chocolate sponge with ganache and chocolate shards",
    priceETB: 150,
    imageAsset: "assets img/Decadent Chocolate Layer Cake Platter.png",
    modifiers: [],
    popular: true,
    hasNotes: false,
  },
  {
    id: "napoleon_cake",
    category: "dessert",
    name: "Napoleon Cake Squares",
    description: "Flaky mille-feuille squares layered with vanilla cream and cream rosettes",
    priceETB: 140,
    imageAsset: "assets img/Napoleon Cake Squares with Cream Rosettes.png",
    modifiers: [],
    hasNotes: false,
  },
  {
    id: "chocolate_croissant",
    category: "dessert",
    name: "Chocolate-Drizzled Croissant",
    description: "Buttery croissant cluster with glossy dark and white chocolate drizzle",
    priceETB: 95,
    imageAsset: "assets img/Glossy Chocolate-Drizzled Croissant Cluster.png",
    modifiers: [],
    hasNotes: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const MENU_ITEMS: MenuItem[] = [
  ...coffeeItems,
  ...juiceItems,
  ...foodItems,
  ...dessertItems,
];

export const MENU_BY_CATEGORY: Record<Category, MenuItem[]> = {
  coffee:  coffeeItems,
  juice:   juiceItems,
  food:    foodItems,
  dessert: dessertItems,
};

export const POPULAR_ITEMS = MENU_ITEMS.filter((item) => item.popular);

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; primary?: boolean }[] = [
  { id: "telebirr",  label: "Telebirr",   icon: "🟡", primary: true },
  { id: "cbe_birr",  label: "CBE Birr",   icon: "🔵" },
  { id: "card",      label: "Card",        icon: "💳" },
  { id: "cash",      label: "Cash",        icon: "💵" },
];

export const TABLE_COUNT = 20;
