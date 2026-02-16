"use client";

import { useState, useEffect, useCallback } from "react";
import { useStorage } from "./use-storage";
import type { Character } from "@/lib/game-systems";

/**
 * Hook pour gérer la liste des personnages.
 * Charge tous les personnages et expose le CRUD.
 */
export function useCharacters() {
  const storage = useStorage();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [lastCharacterId, setLastCharacterId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement initial
  useEffect(() => {
    async function load() {
      try {
        const [chars, lastId] = await Promise.all([
          storage.getCharacters(),
          storage.getLastCharacterId(),
        ]);
        setCharacters(chars);
        setLastCharacterId(lastId);
      } catch (error) {
        console.error("[useCharacters] Erreur de chargement :", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [storage]);

  /** Recharge la liste depuis le storage */
  const reload = useCallback(async () => {
    const chars = await storage.getCharacters();
    setCharacters(chars);
  }, [storage]);

  /** Supprime un personnage */
  const deleteCharacter = useCallback(
    async (id: string) => {
      await storage.deleteCharacter(id);
      setCharacters((prev) => prev.filter((c) => c.id !== id));
      if (lastCharacterId === id) {
        const remaining = characters.filter((c) => c.id !== id);
        const newLastId = remaining.length > 0 ? remaining[0].id : null;
        setLastCharacterId(newLastId);
      }
    },
    [storage, lastCharacterId, characters]
  );

  /** Définit le dernier personnage utilisé */
  const selectCharacter = useCallback(
    async (id: string) => {
      await storage.setLastCharacterId(id);
      setLastCharacterId(id);
    },
    [storage]
  );

  return {
    characters,
    lastCharacterId,
    isLoading,
    reload,
    deleteCharacter,
    selectCharacter,
  };
}
