"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CombatTracker } from "@/components/combat/combat-tracker";
import { useCharacter } from "@/hooks/use-character";
import { useStorage } from "@/hooks/use-storage";
import type { FightingFantasyCharacter } from "@/lib/game-systems/fighting-fantasy";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CombatPage() {
  const router = useRouter();
  const storage = useStorage();
  const [lastId, setLastId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState(true);

  useEffect(() => {
    async function load() {
      const id = await storage.getLastCharacterId();
      setLastId(id);
      setLoadingId(false);
    }
    load();
  }, [storage]);

  const { character, isLoading, updateCharacter } = useCharacter(lastId);

  if (loadingId || isLoading) {
    return (
      <AppShell>
        <div className="flex justify-center pt-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!character) {
    return (
      <AppShell>
        <div className="flex flex-col items-center px-4 pt-8">
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Swords className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Sélectionnez un personnage pour accéder au combat
            </p>
            <Button variant="secondary" onClick={() => router.push("/")}>
              Voir les personnages
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="pt-6">
        <CombatTracker
          character={character as FightingFantasyCharacter}
          onUpdate={updateCharacter}
        />
      </div>
    </AppShell>
  );
}
