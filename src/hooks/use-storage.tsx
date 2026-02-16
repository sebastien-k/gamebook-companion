"use client";

import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import type { IStorageService } from "@/lib/storage";
import { LocalStorageService } from "@/lib/storage";

const StorageContext = createContext<IStorageService | null>(null);

/**
 * Provider de storage.
 * En V1, instancie un LocalStorageService.
 * En V2, on pourra swapper avec SupabaseStorageService ici.
 */
export function StorageProvider({ children }: { children: ReactNode }) {
  const storageRef = useRef<IStorageService>(new LocalStorageService());

  return (
    <StorageContext.Provider value={storageRef.current}>
      {children}
    </StorageContext.Provider>
  );
}

/** Hook pour accéder au service de storage */
export function useStorage(): IStorageService {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage doit être utilisé dans un StorageProvider");
  }
  return context;
}
