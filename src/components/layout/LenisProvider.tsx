/**
 * LenisProvider — initializes smooth scroll on mount.
 * Must be a client component ("use client").
 */
"use client";

import { useEffect } from "react";
import { initLenis, destroyLenis } from "@/lib/lenis";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initLenis();
    return () => destroyLenis();
  }, []);

  return <>{children}</>;
}
