/**
 * Point d'entrée des systèmes de jeu.
 * Discriminated union pour le polymorphisme type-safe.
 *
 * V1 : Fighting Fantasy uniquement
 * V2 : + Lone Wolf
 * V3 : + Graal
 */

export type { GameSystem, BaseCharacter, InventoryItem, DiceRoll, CombatEnemy, UndoEntry } from "./types";
export type { FightingFantasyCharacter } from "./fighting-fantasy";

// Discriminated union — V1 : un seul type
// V2 ajoutera : | LoneWolfCharacter
// V3 ajoutera : | GraalCharacter
export type Character = import("./fighting-fantasy").FightingFantasyCharacter;

// Re-export des configs et règles
export { FIGHTING_FANTASY_CONFIG } from "./fighting-fantasy";
