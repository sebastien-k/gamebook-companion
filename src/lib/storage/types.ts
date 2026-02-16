/**
 * Interface abstraite du storage.
 * Promise-based pour permettre le swap localStorage → Supabase en V2.
 */

import type { Character } from "../game-systems";

/** Enveloppe de stockage avec version pour les migrations */
export interface StorageEnvelope {
  version: number;
  characters: Character[];
  lastCharacterId: string | null;
  updatedAt: string;
}

/** Interface du service de stockage */
export interface IStorageService {
  /** Récupère tous les personnages */
  getCharacters(): Promise<Character[]>;

  /** Récupère un personnage par son ID */
  getCharacter(id: string): Promise<Character | null>;

  /** Sauvegarde un personnage (création ou mise à jour) */
  saveCharacter(character: Character): Promise<void>;

  /** Supprime un personnage */
  deleteCharacter(id: string): Promise<void>;

  /** Récupère l'ID du dernier personnage utilisé */
  getLastCharacterId(): Promise<string | null>;

  /** Définit le dernier personnage utilisé */
  setLastCharacterId(id: string): Promise<void>;

  /** Exporte toutes les données en JSON */
  exportData(): Promise<string>;

  /** Importe des données depuis un JSON */
  importData(json: string): Promise<void>;
}

export const STORAGE_VERSION = 1;
export const STORAGE_KEY = "gamebook-companion-data";
