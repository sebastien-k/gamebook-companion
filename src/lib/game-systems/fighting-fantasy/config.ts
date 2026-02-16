/**
 * Configuration / métadonnées du système Défis Fantastiques.
 */

import type { GameSystem } from "../types";

export const FIGHTING_FANTASY_CONFIG = {
  id: "fighting-fantasy" as GameSystem,
  name: "Défis Fantastiques",
  shortName: "Défis Fantastiques",
  description: "Le système classique de Steve Jackson et Ian Livingstone",

  /** Formules de création */
  creation: {
    skill: { dice: 1 as const, bonus: 6, label: "Habileté" },
    stamina: { dice: 2 as const, bonus: 12, label: "Endurance" },
    luck: { dice: 1 as const, bonus: 6, label: "Chance" },
  },

  /** Labels des stats pour l'UI */
  statLabels: {
    skill: "Habileté",
    stamina: "Endurance",
    luck: "Chance",
    fear: "Peur",
    meals: "Provisions",
    gold: "Pièces d'or",
  },
} as const;
