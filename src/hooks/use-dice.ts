"use client";

import { useState, useCallback } from "react";
import { roll1d6, roll2d6 } from "@/lib/dice";
import type { DiceRoll } from "@/lib/game-systems";

const MAX_HISTORY = 10;

/**
 * Hook pour le simulateur de dés.
 * Gère l'état du lancer en cours et l'historique.
 */
export function useDice() {
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [history, setHistory] = useState<DiceRoll[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const addToHistory = useCallback((roll: DiceRoll) => {
    setHistory((prev) => [roll, ...prev].slice(0, MAX_HISTORY));
  }, []);

  /** Lance 1d6 avec animation */
  const rollOneDice = useCallback(
    (label?: string) => {
      setIsRolling(true);

      // Animation rapide pendant 600ms
      const interval = setInterval(() => {
        setCurrentRoll(roll1d6());
      }, 80);

      setTimeout(() => {
        clearInterval(interval);
        const finalRoll = roll1d6(label);
        setCurrentRoll(finalRoll);
        addToHistory(finalRoll);
        setIsRolling(false);

        // Feedback haptique
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 600);
    },
    [addToHistory]
  );

  /** Lance 2d6 avec animation */
  const rollTwoDice = useCallback(
    (label?: string) => {
      setIsRolling(true);

      const interval = setInterval(() => {
        setCurrentRoll(roll2d6());
      }, 80);

      setTimeout(() => {
        clearInterval(interval);
        const finalRoll = roll2d6(label);
        setCurrentRoll(finalRoll);
        addToHistory(finalRoll);
        setIsRolling(false);

        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 600);
    },
    [addToHistory]
  );

  /** Efface l'historique */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    currentRoll,
    history,
    isRolling,
    rollOneDice,
    rollTwoDice,
    clearHistory,
  };
}
