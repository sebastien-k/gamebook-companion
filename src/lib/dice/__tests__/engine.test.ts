import { describe, it, expect, vi } from "vitest";
import { rollD6, rollNd6, roll1d6, roll2d6 } from "../engine";

describe("rollD6", () => {
  it("retourne un entier entre 1 et 6", () => {
    for (let i = 0; i < 200; i++) {
      const result = rollD6();
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it("utilise Math.random (distribution)", () => {
    const spy = vi.spyOn(Math, "random");

    // Forcer le résultat minimum (random = 0 → 1)
    spy.mockReturnValueOnce(0);
    expect(rollD6()).toBe(1);

    // Forcer le résultat maximum (random = 0.999... → 6)
    spy.mockReturnValueOnce(0.999);
    expect(rollD6()).toBe(6);

    // Valeur intermédiaire (random = 0.5 → 4)
    spy.mockReturnValueOnce(0.5);
    expect(rollD6()).toBe(4);

    spy.mockRestore();
  });
});

describe("rollNd6", () => {
  it("retourne un tableau de la bonne taille", () => {
    expect(rollNd6(1)).toHaveLength(1);
    expect(rollNd6(3)).toHaveLength(3);
    expect(rollNd6(5)).toHaveLength(5);
  });

  it("chaque valeur est entre 1 et 6", () => {
    const results = rollNd6(10);
    results.forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(6);
    });
  });

  it("retourne un tableau vide pour count = 0", () => {
    expect(rollNd6(0)).toHaveLength(0);
  });
});

describe("roll1d6", () => {
  it("retourne un DiceRoll de type 1d6", () => {
    const result = roll1d6();
    expect(result.type).toBe("1d6");
    expect(result.values).toHaveLength(1);
    expect(result.total).toBe(result.values[0]);
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.total).toBeLessThanOrEqual(6);
  });

  it("contient un ID unique (nanoid)", () => {
    const r1 = roll1d6();
    const r2 = roll1d6();
    expect(r1.id).toBeTruthy();
    expect(r2.id).toBeTruthy();
    expect(r1.id).not.toBe(r2.id);
  });

  it("contient un timestamp ISO valide", () => {
    const result = roll1d6();
    expect(result.timestamp).toBeTruthy();
    const date = new Date(result.timestamp);
    expect(date.getTime()).not.toBeNaN();
  });

  it("inclut le label si fourni", () => {
    const result = roll1d6("Test Habileté");
    expect(result.label).toBe("Test Habileté");
  });

  it("label est undefined si non fourni", () => {
    const result = roll1d6();
    expect(result.label).toBeUndefined();
  });
});

describe("roll2d6", () => {
  it("retourne un DiceRoll de type 2d6", () => {
    const result = roll2d6();
    expect(result.type).toBe("2d6");
    expect(result.values).toHaveLength(2);
    expect(result.total).toBe(result.values[0] + result.values[1]);
    expect(result.total).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeLessThanOrEqual(12);
  });

  it("total est la somme des deux dés", () => {
    const spy = vi.spyOn(Math, "random");
    // Math.floor(random * 6) + 1
    // Dé 1 = 3 (random=0.4 → floor(2.4)+1 = 3), Dé 2 = 5 (random=0.7 → floor(4.2)+1 = 5)
    spy.mockReturnValueOnce(0.4);
    spy.mockReturnValueOnce(0.7);

    const result = roll2d6();
    expect(result.values[0]).toBe(3);
    expect(result.values[1]).toBe(5);
    expect(result.total).toBe(8);

    spy.mockRestore();
  });

  it("contient un ID unique", () => {
    const r1 = roll2d6();
    const r2 = roll2d6();
    expect(r1.id).not.toBe(r2.id);
  });

  it("inclut le label si fourni", () => {
    const result = roll2d6("Test de Chance");
    expect(result.label).toBe("Test de Chance");
  });

  it("plage de valeurs correcte sur 100 lancers", () => {
    for (let i = 0; i < 100; i++) {
      const result = roll2d6();
      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeLessThanOrEqual(12);
    }
  });
});
