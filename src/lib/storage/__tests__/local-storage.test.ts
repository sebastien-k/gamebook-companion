import { describe, it, expect, beforeEach, vi } from "vitest";
import { LocalStorageService } from "../local-storage";
import { STORAGE_KEY, STORAGE_VERSION } from "../types";
import type { Character } from "../../game-systems";
import type { FightingFantasyCharacter } from "../../game-systems/fighting-fantasy";

/** Mock localStorage global */
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get _store() {
      return store;
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// S'assurer que `window` est défini pour les checks `typeof window`
Object.defineProperty(globalThis, "window", {
  value: globalThis,
  writable: true,
});

/** Helper : crée un personnage FF pour les tests */
function makeCharacter(
  overrides: Partial<FightingFantasyCharacter> = {}
): FightingFantasyCharacter {
  return {
    id: overrides.id ?? "char-1",
    name: overrides.name ?? "Dorian",
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

describe("LocalStorageService", () => {
  let service: LocalStorageService;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    service = new LocalStorageService();
  });

  describe("getCharacters", () => {
    it("retourne un tableau vide si aucune donnée", async () => {
      const chars = await service.getCharacters();
      expect(chars).toEqual([]);
    });

    it("retourne les personnages stockés", async () => {
      const char = makeCharacter();
      await service.saveCharacter(char);

      const chars = await service.getCharacters();
      expect(chars).toHaveLength(1);
      expect(chars[0].id).toBe("char-1");
    });
  });

  describe("getCharacter", () => {
    it("retourne null si le personnage n'existe pas", async () => {
      const result = await service.getCharacter("inexistant");
      expect(result).toBeNull();
    });

    it("retourne le personnage par ID", async () => {
      const char = makeCharacter({ id: "hero-42", name: "Aragorn" });
      await service.saveCharacter(char);

      const result = await service.getCharacter("hero-42");
      expect(result).not.toBeNull();
      expect(result!.name).toBe("Aragorn");
    });
  });

  describe("saveCharacter", () => {
    it("crée un nouveau personnage", async () => {
      const char = makeCharacter();
      await service.saveCharacter(char);

      const chars = await service.getCharacters();
      expect(chars).toHaveLength(1);
    });

    it("met à jour un personnage existant", async () => {
      const char = makeCharacter({ id: "hero-1", name: "V1" });
      await service.saveCharacter(char);

      const updated = makeCharacter({ id: "hero-1", name: "V2" });
      await service.saveCharacter(updated);

      const chars = await service.getCharacters();
      expect(chars).toHaveLength(1);
      expect(chars[0].name).toBe("V2");
    });

    it("met à jour le champ updatedAt", async () => {
      const char = makeCharacter({ id: "hero-1" });
      const before = char.updatedAt;

      // Petit délai pour garantir un timestamp différent
      await new Promise((r) => setTimeout(r, 10));
      await service.saveCharacter(char);

      const saved = await service.getCharacter("hero-1");
      expect(saved!.updatedAt).not.toBe(before);
    });
  });

  describe("deleteCharacter", () => {
    it("supprime le personnage", async () => {
      const char = makeCharacter({ id: "to-delete" });
      await service.saveCharacter(char);
      expect(await service.getCharacters()).toHaveLength(1);

      await service.deleteCharacter("to-delete");
      expect(await service.getCharacters()).toHaveLength(0);
    });

    it("réinitialise lastCharacterId si c'est le perso supprimé", async () => {
      const char1 = makeCharacter({ id: "a" });
      const char2 = makeCharacter({ id: "b" });
      await service.saveCharacter(char1);
      await service.saveCharacter(char2);
      await service.setLastCharacterId("a");

      await service.deleteCharacter("a");

      const lastId = await service.getLastCharacterId();
      // Doit pointer vers le premier personnage restant
      expect(lastId).toBe("b");
    });

    it("met lastCharacterId à null si c'était le dernier perso", async () => {
      const char = makeCharacter({ id: "unique" });
      await service.saveCharacter(char);
      await service.setLastCharacterId("unique");

      await service.deleteCharacter("unique");

      const lastId = await service.getLastCharacterId();
      expect(lastId).toBeNull();
    });

    it("ne supprime rien si l'ID n'existe pas", async () => {
      const char = makeCharacter();
      await service.saveCharacter(char);

      await service.deleteCharacter("inexistant");
      expect(await service.getCharacters()).toHaveLength(1);
    });
  });

  describe("lastCharacterId", () => {
    it("retourne null par défaut", async () => {
      const lastId = await service.getLastCharacterId();
      expect(lastId).toBeNull();
    });

    it("sauvegarde et récupère l'ID", async () => {
      await service.setLastCharacterId("hero-99");
      const lastId = await service.getLastCharacterId();
      expect(lastId).toBe("hero-99");
    });
  });

  describe("exportData / importData", () => {
    it("exporte un JSON valide", async () => {
      const char = makeCharacter({ name: "Export Test" });
      await service.saveCharacter(char);

      const json = await service.exportData();
      const parsed = JSON.parse(json);
      expect(parsed.version).toBe(STORAGE_VERSION);
      expect(parsed.characters).toHaveLength(1);
      expect(parsed.characters[0].name).toBe("Export Test");
    });

    it("importe des données valides", async () => {
      const data = {
        version: STORAGE_VERSION,
        characters: [makeCharacter({ id: "imported", name: "Gimli" })],
        lastCharacterId: "imported",
        updatedAt: new Date().toISOString(),
      };

      await service.importData(JSON.stringify(data));

      const chars = await service.getCharacters();
      expect(chars).toHaveLength(1);
      expect(chars[0].name).toBe("Gimli");
    });

    it("rejette un JSON invalide", async () => {
      await expect(service.importData("pas du json")).rejects.toThrow();
    });

    it("rejette un format sans version", async () => {
      const bad = JSON.stringify({ characters: [] });
      await expect(service.importData(bad)).rejects.toThrow("Format de données invalide");
    });

    it("rejette un format sans characters", async () => {
      const bad = JSON.stringify({ version: 1 });
      await expect(service.importData(bad)).rejects.toThrow("Format de données invalide");
    });

    it("round-trip : export puis import conserve les données", async () => {
      const char1 = makeCharacter({ id: "a", name: "Alpha" });
      const char2 = makeCharacter({ id: "b", name: "Bravo" });
      await service.saveCharacter(char1);
      await service.saveCharacter(char2);
      await service.setLastCharacterId("b");

      const json = await service.exportData();

      // Réinitialiser et importer
      localStorageMock.clear();
      const freshService = new LocalStorageService();
      await freshService.importData(json);

      const chars = await freshService.getCharacters();
      expect(chars).toHaveLength(2);
      expect(chars.map((c: Character) => c.name).sort()).toEqual(["Alpha", "Bravo"]);
    });
  });

  describe("données corrompues", () => {
    it("retourne un envelope vide si localStorage contient du JSON invalide", async () => {
      localStorageMock.setItem(STORAGE_KEY, "not-json-at-all");
      const chars = await service.getCharacters();
      expect(chars).toEqual([]);
    });
  });
});
