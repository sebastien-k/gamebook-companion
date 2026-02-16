import { describe, it, expect } from "vitest";
import {
  FF_LIMITS,
  rollCreationStat,
  isStaminaCritical,
  isDead,
  clamp,
  eatMeal,
  testLuck,
} from "../rules";
import type { FightingFantasyCharacter } from "../types";

/** Helper : crée un personnage avec des valeurs par défaut */
function makeCharacter(
  overrides: Partial<FightingFantasyCharacter> = {}
): FightingFantasyCharacter {
  return {
    id: "test-id",
    name: "Test Hero",
    gameSystem: "fighting-fantasy",
    bookTitle: "",
    currentPage: 1,
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    initialSkill: 10,
    currentSkill: 10,
    initialStamina: 20,
    currentStamina: 20,
    initialLuck: 10,
    currentLuck: 10,
    maxFear: 0,
    currentFear: 0,
    meals: 5,
    gold: 0,
    inventory: [],
    combatEnemies: [],
    ...overrides,
  };
}

describe("FF_LIMITS", () => {
  it("doit avoir les constantes attendues", () => {
    expect(FF_LIMITS.SKILL_MIN).toBe(1);
    expect(FF_LIMITS.SKILL_MAX).toBe(12);
    expect(FF_LIMITS.STAMINA_MIN).toBe(0);
    expect(FF_LIMITS.STAMINA_MAX).toBe(24);
    expect(FF_LIMITS.STAMINA_HEAL_PER_MEAL).toBe(4);
    expect(FF_LIMITS.CRITICAL_THRESHOLD).toBe(0.25);
  });
});

describe("rollCreationStat", () => {
  it("1d6+6 doit retourner entre 7 et 12", () => {
    for (let i = 0; i < 100; i++) {
      const result = rollCreationStat(1, 6);
      expect(result).toBeGreaterThanOrEqual(7);
      expect(result).toBeLessThanOrEqual(12);
    }
  });

  it("2d6+12 doit retourner entre 14 et 24", () => {
    for (let i = 0; i < 100; i++) {
      const result = rollCreationStat(2, 12);
      expect(result).toBeGreaterThanOrEqual(14);
      expect(result).toBeLessThanOrEqual(24);
    }
  });
});

describe("isStaminaCritical", () => {
  it("retourne true quand endurance < 25% du max", () => {
    const char = makeCharacter({ initialStamina: 20, currentStamina: 4 });
    expect(isStaminaCritical(char)).toBe(true);
  });

  it("retourne false quand endurance >= 25% du max", () => {
    const char = makeCharacter({ initialStamina: 20, currentStamina: 5 });
    expect(isStaminaCritical(char)).toBe(false);
  });

  it("retourne true quand endurance = 0", () => {
    const char = makeCharacter({ initialStamina: 20, currentStamina: 0 });
    expect(isStaminaCritical(char)).toBe(true);
  });

  it("retourne false quand initialStamina = 0 (division par zéro)", () => {
    const char = makeCharacter({ initialStamina: 0, currentStamina: 0 });
    expect(isStaminaCritical(char)).toBe(false);
  });
});

describe("isDead", () => {
  it("retourne true quand endurance = 0", () => {
    const char = makeCharacter({ currentStamina: 0 });
    expect(isDead(char)).toBe(true);
  });

  it("retourne true quand endurance < 0", () => {
    const char = makeCharacter({ currentStamina: -1 });
    expect(isDead(char)).toBe(true);
  });

  it("retourne false quand endurance > 0", () => {
    const char = makeCharacter({ currentStamina: 1 });
    expect(isDead(char)).toBe(false);
  });
});

describe("clamp", () => {
  it("retourne la valeur si dans la plage", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("retourne le min si en dessous", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it("retourne le max si au-dessus", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("fonctionne avec min = max", () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });
});

describe("eatMeal", () => {
  it("retourne null si pas de provisions", () => {
    const char = makeCharacter({ meals: 0 });
    expect(eatMeal(char)).toBeNull();
  });

  it("diminue les provisions de 1 et ajoute 4 endurance", () => {
    const char = makeCharacter({
      meals: 3,
      currentStamina: 10,
      initialStamina: 20,
    });
    const result = eatMeal(char);
    expect(result).not.toBeNull();
    expect(result!.meals).toBe(2);
    expect(result!.currentStamina).toBe(14);
  });

  it("ne dépasse pas l'endurance initiale", () => {
    const char = makeCharacter({
      meals: 3,
      currentStamina: 18,
      initialStamina: 20,
    });
    const result = eatMeal(char);
    expect(result!.currentStamina).toBe(20);
  });

  it("gère le cas endurance déjà au max", () => {
    const char = makeCharacter({
      meals: 3,
      currentStamina: 20,
      initialStamina: 20,
    });
    const result = eatMeal(char);
    expect(result!.currentStamina).toBe(20);
    expect(result!.meals).toBe(2);
  });
});

describe("testLuck", () => {
  it("chanceux quand jet <= chance actuelle", () => {
    const char = makeCharacter({ currentLuck: 8 });
    const { lucky, newLuck } = testLuck(char, 7);
    expect(lucky).toBe(true);
    expect(newLuck).toBe(7); // 8 - 1
  });

  it("chanceux quand jet = chance actuelle (égalité)", () => {
    const char = makeCharacter({ currentLuck: 8 });
    const { lucky, newLuck } = testLuck(char, 8);
    expect(lucky).toBe(true);
    expect(newLuck).toBe(7);
  });

  it("malchanceux quand jet > chance actuelle", () => {
    const char = makeCharacter({ currentLuck: 8 });
    const { lucky, newLuck } = testLuck(char, 9);
    expect(lucky).toBe(false);
    expect(newLuck).toBe(7);
  });

  it("chance ne descend pas en dessous de 0", () => {
    const char = makeCharacter({ currentLuck: 0 });
    const { lucky, newLuck } = testLuck(char, 5);
    expect(lucky).toBe(false);
    expect(newLuck).toBe(0);
  });
});
