"use client";

import { Info, Plus, Sparkles, X } from "lucide-react";
import { MENU_ITEMS } from "@/data/menu";
import { scrollToTarget } from "@/lib/lenis";
import { cn } from "@/lib/utils";
import { useOrderDrawer } from "./OrderDrawerProvider";
import TableSelector from "./TableSelector";
import CartItemsList from "./CartItemsList";
import PaymentMethodSelector from "./PaymentMethodSelector";
import ItemModifierModal from "./ItemModifierModal";
import OrderConfirmationView from "./OrderConfirmationView";

export default function OrderDrawer() {
  const {
    isOpen,
    closeDrawer,
    tableNumber,
    setTableNumber,
    detectedFromQr,
    cart,
    totalItemCount,
    customizingItem,
    startCustomizing,
    cancelCustomizing,
    addToCart,
    updateQty,
    removeLine,
    paymentMethod,
    setPaymentMethod,
    status,
    demoOrderRef,
    submitDemoOrder,
    resetOrderFlow,
  } = useOrderDrawer();

  const canSubmit = tableNumber !== null && cart.length > 0;
  const quickAddItems = MENU_ITEMS.filter((i) => i.featured).slice(0, 4);

  const handleBrowseMenu = () => {
    closeDrawer();
    setTimeout(() => scrollToTarget("#menu"), 180);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={cn(
          "fixed inset-0 z-overlay bg-fana-dark/75 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Slide-over Sheet */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Fana Cafe QR Table Ordering Drawer"
        aria-hidden={!isOpen}
        className={cn(
          "fixed right-0 top-0 z-drawer flex h-[100dvh] w-full max-w-[28rem] flex-col border-l border-fana-cream/12 bg-[#171411] text-fana-cream shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        )}
      >
        {customizingItem ? (
          <ItemModifierModal
            item={customizingItem}
            onCancel={cancelCustomizing}
            onConfirm={addToCart}
          />
        ) : status === "confirmed" && demoOrderRef && tableNumber ? (
          <OrderConfirmationView
            demoOrderRef={demoOrderRef}
            tableNumber={tableNumber}
            items={cart}
            paymentMethod={paymentMethod}
            onStartNew={resetOrderFlow}
            onClose={closeDrawer}
          />
        ) : (
          <>
            {/* Drawer Header */}
            <header className="flex items-start justify-between gap-4 border-b border-fana-cream/10 px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-fana-gold/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-fana-gold">
                    <Sparkles className="h-2.5 w-2.5" />
                    QR Table Ordering · Prototype
                  </span>
                </div>
                <h2 className="mt-1.5 font-display text-xl text-fana-cream">
                  Fana Cafe · Table Order
                </h2>
                <p className="text-xs text-fana-cream/55">
                  22 Mazoria, Addis Ababa
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fana-cream/15 text-fana-cream/75 transition hover:border-fana-gold hover:text-fana-gold"
                aria-label="Close ordering drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {/* Drawer Body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              {/* Transparent Demo Banner */}
              <div className="flex items-start gap-2.5 rounded-xl border border-fana-cream/10 bg-fana-dark/60 px-3.5 py-2.5 text-[11px] leading-relaxed text-fana-cream/65">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fana-gold" aria-hidden="true" />
                <span>
                  Interactive frontend demo flow — no live POS orders or real Telebirr/CBE Birr payments are processed yet.
                </span>
              </div>

              {/* 1. Table Selector (1-20) */}
              <TableSelector
                tableNumber={tableNumber}
                detectedFromQr={detectedFromQr}
                onSelect={setTableNumber}
              />

              {/* 2. Cart Items */}
              <CartItemsList
                items={cart}
                onUpdateQty={updateQty}
                onRemove={removeLine}
                onBrowseMenu={handleBrowseMenu}
              />

              {/* Quick-add featured picks directly inside drawer */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-fana-cream/70">
                    Quick Add Favorites
                  </h3>
                  <button
                    type="button"
                    onClick={handleBrowseMenu}
                    className="text-[11px] text-fana-gold hover:underline"
                  >
                    View all 27 items
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickAddItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => startCustomizing(item)}
                      className="flex items-center justify-between gap-2 rounded-xl border border-fana-cream/10 bg-fana-dark/55 px-3 py-2 text-left text-xs text-fana-cream/85 transition hover:border-fana-gold/60 hover:text-fana-cream"
                    >
                      <span className="truncate">{item.name}</span>
                      <Plus className="h-3.5 w-3.5 shrink-0 text-fana-gold" />
                    </button>
                  ))}
                </div>
              </section>

              {/* 3. Payment Method Selection */}
              <PaymentMethodSelector
                selected={paymentMethod}
                onSelect={setPaymentMethod}
              />
            </div>

            {/* Sticky Submit Footer */}
            <footer className="space-y-2.5 border-t border-fana-cream/10 bg-fana-dark/95 px-6 py-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-fana-cream/60">
                  {tableNumber
                    ? `Table ${String(tableNumber).padStart(2, "0")} · ${totalItemCount} item(s)`
                    : "Choose a table number above"}
                </span>
                <span className="font-mono text-[11px] text-fana-gold">
                  In-cafe pricing
                </span>
              </div>

              <button
                type="button"
                disabled={!canSubmit}
                onClick={submitDemoOrder}
                className={cn(
                  "w-full rounded-full px-5 py-3.5 text-sm font-semibold transition",
                  canSubmit
                    ? "bg-fana-gold text-fana-dark hover:bg-fana-gold/90"
                    : "cursor-not-allowed bg-fana-cream/10 text-fana-cream/35"
                )}
              >
                {!tableNumber
                  ? "Select Table (1–20) to Continue"
                  : cart.length === 0
                    ? "Add an Item to Preview Order"
                    : `Preview Demo Order · Table ${String(tableNumber).padStart(2, "0")}`}
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
