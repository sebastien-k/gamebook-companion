"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useStorage } from "./use-storage";
import type { Character } from "@/lib/game-systems";
import type { UndoEntry } from "@/lib/game-systems";

/**
 * Hook pour gérer un personnage individuel.
 * Sauvegarde automatique à chaque modification.
 * Supporte l'undo de la dernière action.
 */
export function useCharacter(characterId: string | null) {
  const storage = useStorage();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [undoEntry, setUndoEntry] = useState<UndoEntry | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nettoyage du timer undo au démontage (P0 : éviter state update on unmounted)
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  // Reset undo quand on change de personnage
  useEffect(() => {
    setUndoEntry(null);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
  }, [characterId]);

  // Chargement initial
  useEffect(() => {
    if (!characterId) {
      setCharacter(null);
      setIsLoading(false);
      return;
    }

    async function load() {
      try {
        const char = await storage.getCharacter(characterId!);
        setCharacter(char);
      } catch (error) {
        console.error("[useCharacter] Erreur de chargement :", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [characterId, storage]);

  /**
   * Met à jour le personnage.
   * Sauvegarde automatique dans le storage.
   * Crée une entrée undo (visible 5 secondes).
   */
  const updateCharacter = useCallback(
    async (
      updates: Partial<Character>,
      undoDescription?: string
    ) => {
      if (!character) return;

      // Sauvegarder l'état précédent pour undo
      if (undoDescription) {
        // Annuler le timer précédent
        if (undoTimerRef.current) {
          clearTimeout(undoTimerRef.current);
        }

        setUndoEntry({
          characterId: character.id,
          previousState: JSON.stringify(character),
          description: undoDescription,
          timestamp: new Date().toISOString(),
        });

        // Undo expire après 5 secondes
        undoTimerRef.current = setTimeout(() => {
          setUndoEntry(null);
        }, 5000);
      }

      const updated = { ...character, ...updates } as Character;
      setCharacter(updated);
      await storage.saveCharacter(updated);
    },
    [character, storage]
  );

  /** Annule la dernière action (sécurisé : vérifie que c'est le bon personnage) */
  const undo = useCallback(async () => {
    if (!undoEntry || !character) return;

    // P0 : vérifier que l'undo correspond au personnage actuel
    if (undoEntry.characterId !== character.id) {
      console.warn("[useCharacter] Undo ignoré : personnage différent");
      setUndoEntry(null);
      return;
    }

    try {
      const previousCharacter = JSON.parse(
        undoEntry.previousState
      ) as Character;
      setCharacter(previousCharacter);
      await storage.saveCharacter(previousCharacter);
      setUndoEntry(null);

      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    } catch (error) {
      console.error("[useCharacter] Erreur undo :", error);
    }
  }, [undoEntry, character, storage]);

  /** Annule l'undo manuellement (dismiss) */
  const dismissUndo = useCallback(() => {
    setUndoEntry(null);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
  }, []);

  return {
    character,
    isLoading,
    updateCharacter,
    undoEntry,
    undo,
    dismissUndo,
  };
}
