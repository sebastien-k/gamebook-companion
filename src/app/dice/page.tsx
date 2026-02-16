"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { DiceRoller } from "@/components/dice/dice-roller";
import { useCharacter } from "@/hooks/use-character";
import { useStorage } from "@/hooks/use-storage";
import type { FightingFantasyCharacter } from "@/lib/game-systems/fighting-fantasy";
import { testLuck } from "@/lib/game-systems/fighting-fantasy";
import type { DiceRoll, Character } from "@/lib/game-systems";
import { useCallback } from "react";

export default function DicePage() {
  const storage = useStorage();
  const [lastId, setLastId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const id = await storage.getLastCharacterId();
      setLastId(id);
    }
    load();
  }, [storage]);

  const { character, updateCharacter } = useCharacter(lastId);

  const ff = character as FightingFantasyCharacter | null;

  const handleLuckTest = useCallback(
    async (roll: DiceRoll) => {
      if (!ff) return;
      const { lucky, newLuck } = testLuck(ff, roll.total);
      await updateCharacter(
        { currentLuck: newLuck } as Partial<Character>,
        `Test de Chance : ${lucky ? "Chanceux" : "Malchanceux"} (${roll.total} vs ${ff.currentLuck})`
      );
    },
    [ff, updateCharacter]
  );

  return (
    <AppShell>
      <div className="flex flex-col px-4 pt-6">
        <div className="text-center">
          <h1 className="font-display text-2xl text-primary">Dés</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Simulateur de dés
          </p>
        </div>

        <div className="mt-6">
          <DiceRoller
            showLuckTest={ff !== null && ff.currentLuck > 0}
            currentLuck={ff?.currentLuck}
            onLuckTest={handleLuckTest}
          />
        </div>
      </div>
    </AppShell>
  );
}
