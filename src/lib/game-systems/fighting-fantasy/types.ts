/**
 * Types spécifiques au système Défis Fantastiques.
 *
 * Stats :
 * - Habileté (skill) : départ + actuelle
 * - Endurance (stamina) : départ + actuelle
 * - Chance (luck) : départ + actuelle
 * - Peur (fear) : maximale + actuelle (optionnel selon le livre)
 * - Provisions (meals)
 * - Pièces d'or (gold)
 */

import type { BaseCharacter, InventoryItem, CombatEnemy } from "../types";

export interface FightingFantasyCharacter extends BaseCharacter {
  gameSystem: "fighting-fantasy";

  // Habileté
  initialSkill: number;
  currentSkill: number;

  // Endurance
  initialStamina: number;
  currentStamina: number;

  // Chance
  initialLuck: number;
  currentLuck: number;

  // Peur (optionnel, dépend du livre)
  maxFear: number;
  currentFear: number;

  // Ressources
  meals: number;
  gold: number;

  // Inventaire
  inventory: InventoryItem[];

  // Combat en cours
  combatEnemies: CombatEnemy[];
}
