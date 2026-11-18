"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe, React 19 idiomatic media query hook built on useSyncExternalStore.
 */
export function useMediaQuery(query: string, serverDefault = false): boolean {
  const subscribe = (onStoreChange: () => void) => {
    if (typeof window === "undefined") return () => {};
    const mq = window.matchMedia(query);
    mq.addEventListener("change", onStoreChange);
    return () => mq.removeEventListener("change", onStoreChange);
  };

  const getSnapshot = () => {
    if (typeof window === "undefined") return serverDefault;
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => serverDefault;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
