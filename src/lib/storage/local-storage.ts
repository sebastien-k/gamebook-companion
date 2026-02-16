/**
 * Implémentation localStorage du service de stockage.
 * Toutes les méthodes sont Promise-based pour compatibilité avec l'interface.
 */

import type { Character } from "../game-systems";
import type { IStorageService, StorageEnvelope } from "./types";
import { STORAGE_VERSION, STORAGE_KEY } from "./types";

function getEnvelope(): StorageEnvelope {
  if (typeof window === "undefined") {
    return createEmptyEnvelope();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyEnvelope();

    const data = JSON.parse(raw) as StorageEnvelope;

    // Migration si nécessaire
    if (data.version < STORAGE_VERSION) {
      return migrate(data);
    }

    return data;
  } catch {
    console.warn("[Storage] Données corrompues, réinitialisation");
    return createEmptyEnvelope();
  }
}

function saveEnvelope(envelope: StorageEnvelope): void {
  if (typeof window === "undefined") return;

  envelope.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}

function createEmptyEnvelope(): StorageEnvelope {
  return {
    version: STORAGE_VERSION,
    characters: [],
    lastCharacterId: null,
    updatedAt: new Date().toISOString(),
  };
}

function migrate(data: StorageEnvelope): StorageEnvelope {
  // V1 → pas de migration nécessaire pour l'instant
  // Quand on ajoutera de nouveaux champs, on les migrera ici
  return {
    ...data,
    version: STORAGE_VERSION,
  };
}

export class LocalStorageService implements IStorageService {
  async getCharacters(): Promise<Character[]> {
    const envelope = getEnvelope();
    return envelope.characters;
  }

  async getCharacter(id: string): Promise<Character | null> {
    const envelope = getEnvelope();
    return envelope.characters.find((c) => c.id === id) ?? null;
  }

  async saveCharacter(character: Character): Promise<void> {
    const envelope = getEnvelope();
    const index = envelope.characters.findIndex((c) => c.id === character.id);

    character.updatedAt = new Date().toISOString();

    if (index >= 0) {
      envelope.characters[index] = character;
    } else {
      envelope.characters.push(character);
    }

    saveEnvelope(envelope);
  }

  async deleteCharacter(id: string): Promise<void> {
    const envelope = getEnvelope();
    envelope.characters = envelope.characters.filter((c) => c.id !== id);

    if (envelope.lastCharacterId === id) {
      envelope.lastCharacterId =
        envelope.characters.length > 0 ? envelope.characters[0].id : null;
    }

    saveEnvelope(envelope);
  }

  async getLastCharacterId(): Promise<string | null> {
    const envelope = getEnvelope();
    return envelope.lastCharacterId;
  }

  async setLastCharacterId(id: string): Promise<void> {
    const envelope = getEnvelope();
    envelope.lastCharacterId = id;
    saveEnvelope(envelope);
  }

  async exportData(): Promise<string> {
    const envelope = getEnvelope();
    return JSON.stringify(envelope, null, 2);
  }

  async importData(json: string): Promise<void> {
    try {
      const imported = JSON.parse(json) as StorageEnvelope;

      // Validation basique
      if (!imported.version || !Array.isArray(imported.characters)) {
        throw new Error("Format de données invalide");
      }

      // Migration si nécessaire
      const migrated =
        imported.version < STORAGE_VERSION ? migrate(imported) : imported;

      saveEnvelope(migrated);
    } catch (error) {
      throw new Error(
        `Erreur d'import : ${error instanceof Error ? error.message : "format invalide"}`
      );
    }
  }
}
