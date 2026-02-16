/**
 * Règles métier pour Défis Fantastiques.
 *
 * Création : Habileté = 1d6+6, Endurance = 2d6+12, Chance = 1d6+6
 * Endurance à 0 = mort
 * Chance décrémentée à chaque "Test de Chance"
 * Provisions : +4 endurance quand on mange (pas au-dessus du départ)
 */

import type { FightingFantasyCharacter } from "./types";

/** Limites pour les stats */
export const FF_LIMITS = {
  SKILL_MIN: 1,
  SKILL_MAX: 12,
  STAMINA_MIN: 0,
  STAMINA_MAX: 24,
  LUCK_MIN: 0,
  LUCK_MAX: 12,
  FEAR_MIN: 0,
  FEAR_MAX: 18,
  MEALS_MIN: 0,
  MEALS_MAX: 99,
  GOLD_MIN: 0,
  GOLD_MAX: 99,
  STAMINA_HEAL_PER_MEAL: 4,
  CRITICAL_THRESHOLD: 0.25, // < 25% de l'endurance max = critique
} as const;

/** Génère une valeur de création : 1d6 + bonus */
export function rollCreationStat(diceCount: 1 | 2, bonus: number): number {
  let total = 0;
  for (let i = 0; i < diceCount; i++) {
    total += Math.floor(Math.random() * 6) + 1;
  }
  return total + bonus;
}

/** Vérifie si l'endurance est critique (< 25% du max) */
export function isStaminaCritical(character: FightingFantasyCharacter): boolean {
  if (character.initialStamina === 0) return false;
  return (
    character.currentStamina / character.initialStamina <
    FF_LIMITS.CRITICAL_THRESHOLD
  );
}

/** Vérifie si le personnage est mort */
export function isDead(character: FightingFantasyCharacter): boolean {
  return character.currentStamina <= 0;
}

/** Clamp une valeur dans une plage */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Manger un repas : -1 provision, +4 endurance (max = départ)
 * Retourne null si pas de provisions
 */
export function eatMeal(
  character: FightingFantasyCharacter
): Partial<FightingFantasyCharacter> | null {
  if (character.meals <= 0) return null;

  return {
    meals: character.meals - 1,
    currentStamina: Math.min(
      character.currentStamina + FF_LIMITS.STAMINA_HEAL_PER_MEAL,
      character.initialStamina
    ),
  };
}

/**
 * Tester la Chance : jet 2d6.
 * Si total <= chance actuelle → chanceux. Sinon → malchanceux.
 * La chance diminue de 1 après chaque test.
 */
export function testLuck(
  character: FightingFantasyCharacter,
  rollTotal: number
): {
  lucky: boolean;
  newLuck: number;
} {
  const lucky = rollTotal <= character.currentLuck;
  const newLuck = Math.max(0, character.currentLuck - 1);
  return { lucky, newLuck };
}
