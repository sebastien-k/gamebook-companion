"use client";

import { StorageProvider } from "@/hooks/use-storage";

export function Providers({ children }: { children: React.ReactNode }) {
  return <StorageProvider>{children}</StorageProvider>;
}
