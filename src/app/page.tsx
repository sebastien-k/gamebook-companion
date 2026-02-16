"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CharacterCard } from "@/components/character/character-card";
import { CreationWizard } from "@/components/character/creation-wizard";
import { useCharacters } from "@/hooks/use-characters";
import type { FightingFantasyCharacter } from "@/lib/game-systems/fighting-fantasy";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataManager } from "@/components/character/data-manager";
import { Users, Plus } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const {
    characters,
    lastCharacterId,
    isLoading,
    reload,
    deleteCharacter,
    selectCharacter,
  } = useCharacters();

  const [showWizard, setShowWizard] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleSelect = useCallback(
    async (id: string) => {
      await selectCharacter(id);
      router.push("/character");
    },
    [selectCharacter, router]
  );

  const handleCreateComplete = useCallback(
    async (_character: FightingFantasyCharacter) => {
      setShowWizard(false);
      await reload();
      router.push("/character");
    },
    [reload, router]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteCharacter(deleteTarget);
    setDeleteTarget(null);
  }, [deleteTarget, deleteCharacter]);

  const characterToDelete = deleteTarget
    ? characters.find((c) => c.id === deleteTarget)
    : null;

  // Wizard de création
  if (showWizard) {
    return (
      <AppShell>
        <CreationWizard
          onComplete={handleCreateComplete}
          onCancel={() => setShowWizard(false)}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col px-4 pt-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-primary">
              Gamebook Companion
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Vos fiches de personnage
            </p>
          </div>
          <DataManager onImportComplete={reload} />
        </div>

        {/* Liste ou empty state */}
        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : characters.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                Aucun personnage
              </p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Créez votre premier personnage pour commencer votre aventure
              </p>
            </div>
            <Button className="mt-2 gap-2" onClick={() => setShowWizard(true)}>
              <Plus className="h-5 w-5" />
              Créer un personnage
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={character.id === lastCharacterId}
                onSelect={handleSelect}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}

        {/* Bouton flottant de création */}
        {characters.length > 0 && (
          <Button
            size="lg"
            className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full p-0 shadow-lg"
            onClick={() => setShowWizard(true)}
            aria-label="Créer un personnage"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le personnage ?</DialogTitle>
            <DialogDescription>
              {characterToDelete
                ? `"${characterToDelete.name || "Sans nom"}" sera définitivement supprimé. Cette action est irréversible.`
                : "Cette action est irréversible."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteConfirm}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
