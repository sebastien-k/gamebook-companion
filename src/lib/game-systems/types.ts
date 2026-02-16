/**
 * Types partagés entre tous les systèmes de jeu.
 * Discriminated union pour le polymorphisme type-safe.
 */

export type GameSystem = "fighting-fantasy" | "lone-wolf" | "graal";

/** Base commune à tous les personnages */
export interface BaseCharacter {
  id: string;
  name: string;
  bookTitle: string;
  gameSystem: GameSystem;
  currentPage: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Item d'inventaire */
export interface InventoryItem {
  id: string;
  name: string;
}

/** Historique d'un lancer de dés */
export interface DiceRoll {
  id: string;
  type: "1d6" | "2d6";
  values: number[];
  total: number;
  label?: string;
  timestamp: string;
}

/** Adversaire en combat */
export interface CombatEnemy {
  id: string;
  name: string;
  skill: number;
  stamina: number;
  initialSkill: number;
  initialStamina: number;
}

/** État de la dernière action (pour undo) */
export interface UndoEntry {
  characterId: string;
  previousState: string; // JSON sérialisé
  description: string;
  timestamp: string;
}
