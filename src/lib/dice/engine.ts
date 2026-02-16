/**
 * Moteur de dés.
 * Fonctions pures pour la génération de résultats.
 */

import { nanoid } from "nanoid";
import type { DiceRoll } from "../game-systems";

/** Lance un dé à 6 faces */
export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/** Lance N dés à 6 faces */
export function rollNd6(count: number): number[] {
  return Array.from({ length: count }, () => rollD6());
}

/** Crée un enregistrement de lancer 1d6 */
export function roll1d6(label?: string): DiceRoll {
  const values = rollNd6(1);
  return {
    id: nanoid(),
    type: "1d6",
    values,
    total: values[0],
    label,
    timestamp: new Date().toISOString(),
  };
}

/** Crée un enregistrement de lancer 2d6 */
export function roll2d6(label?: string): DiceRoll {
  const values = rollNd6(2);
  return {
    id: nanoid(),
    type: "2d6",
    values,
    total: values[0] + values[1],
    label,
    timestamp: new Date().toISOString(),
  };
}
