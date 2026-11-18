"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  type CartOrderItem,
  type MenuItem,
  type PaymentMethodId,
  type SelectedModifiers,
} from "@/data/menu";
import { createDemoOrderRef } from "@/lib/utils";
import { startLenis, stopLenis } from "@/lib/lenis";

export type OrderFlowStatus = "browsing" | "confirmed";

interface OrderDrawerContextValue {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  tableNumber: number | null;
  setTableNumber: (table: number) => void;
  detectedFromQr: boolean;
  cart: CartOrderItem[];
  totalItemCount: number;
  customizingItem: MenuItem | null;
  startCustomizing: (item: MenuItem) => void;
  cancelCustomizing: () => void;
  addToCart: (item: MenuItem, modifiers: SelectedModifiers) => void;
  updateQty: (lineId: string, delta: number) => void;
  removeLine: (lineId: string) => void;
  paymentMethod: PaymentMethodId;
  setPaymentMethod: (method: PaymentMethodId) => void;
  status: OrderFlowStatus;
  demoOrderRef: string | null;
  submitDemoOrder: () => void;
  resetOrderFlow: () => void;
}

const OrderDrawerContext = createContext<OrderDrawerContextValue | null>(null);

function buildModifierKey(modifiers: SelectedModifiers): string {
  return JSON.stringify({
    size: modifiers.size ?? "",
    sweetness: modifiers.sweetness ?? "",
    milk: modifiers.milk ?? "",
    spice: modifiers.spice ?? "",
    notes: (modifiers.notes ?? "").trim(),
  });
}

export function OrderDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tableNumber, setTableNumberState] = useState<number | null>(null);
  const [detectedFromQr, setDetectedFromQr] = useState(false);
  const [cart, setCart] = useState<CartOrderItem[]>([]);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("telebirr");
  const [status, setStatus] = useState<OrderFlowStatus>("browsing");
  const [demoOrderRef, setDemoOrderRef] = useState<string | null>(null);

  // Hydrate table number from QR URL query param (?table=1..20)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const rawTable = params.get("table");
    if (!rawTable) return;
    const parsed = Number.parseInt(rawTable, 10);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 20) {
      queueMicrotask(() => {
        setTableNumberState(parsed);
        setDetectedFromQr(true);
      });
    }
  }, []);

  // Lock background Lenis & body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      stopLenis();
      document.body.style.overflow = "hidden";
    } else {
      startLenis();
      document.body.style.overflow = "";
    }
    return () => {
      startLenis();
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (customizingItem) {
          setCustomizingItem(null);
        } else {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, customizingItem]);

  const openDrawer = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setCustomizingItem(null);
    setIsOpen(false);
  }, []);

  const setTableNumber = useCallback((table: number) => {
    setTableNumberState(table);
    setDetectedFromQr(false);
  }, []);

  const startCustomizing = useCallback((item: MenuItem) => {
    setStatus("browsing");
    setCustomizingItem(item);
    setIsOpen(true);
  }, []);

  const cancelCustomizing = useCallback(() => {
    setCustomizingItem(null);
  }, []);

  const addToCart = useCallback((item: MenuItem, modifiers: SelectedModifiers) => {
    const cleanModifiers: SelectedModifiers = {
      ...modifiers,
      notes: modifiers.notes?.trim() ? modifiers.notes.trim().slice(0, 80) : undefined,
    };
    const key = `${item.id}::${buildModifierKey(cleanModifiers)}`;

    setCart((prev) => {
      const existing = prev.find((line) => line.lineId === key);
      if (existing) {
        return prev.map((line) =>
          line.lineId === key ? { ...line, qty: line.qty + 1 } : line
        );
      }
      return [...prev, { lineId: key, menuItem: item, qty: 1, modifiers: cleanModifiers }];
    });
    setCustomizingItem(null);
    setStatus("browsing");
  }, []);

  const updateQty = useCallback((lineId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) =>
          line.lineId === lineId ? { ...line, qty: line.qty + delta } : line
        )
        .filter((line) => line.qty > 0)
    );
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setCart((prev) => prev.filter((line) => line.lineId !== lineId));
  }, []);

  const submitDemoOrder = useCallback(() => {
    if (!tableNumber || cart.length === 0) return;
    setDemoOrderRef(createDemoOrderRef(tableNumber));
    setStatus("confirmed");
  }, [tableNumber, cart.length]);

  const resetOrderFlow = useCallback(() => {
    setCart([]);
    setDemoOrderRef(null);
    setStatus("browsing");
  }, []);

  const totalItemCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.qty, 0),
    [cart]
  );

  const value = useMemo<OrderDrawerContextValue>(
    () => ({
      isOpen,
      openDrawer,
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
    }),
    [
      isOpen,
      openDrawer,
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
      status,
      demoOrderRef,
      submitDemoOrder,
      resetOrderFlow,
    ]
  );

  return (
    <OrderDrawerContext.Provider value={value}>
      {children}
    </OrderDrawerContext.Provider>
  );
}

export function useOrderDrawer(): OrderDrawerContextValue {
  const ctx = useContext(OrderDrawerContext);
  if (!ctx) {
    throw new Error("useOrderDrawer must be used within OrderDrawerProvider");
  }
  return ctx;
}
