"use client";

import { useState, useCallback } from "react";
import type { FightingFantasyCharacter } from "@/lib/game-systems/fighting-fantasy";
import { FF_LIMITS, isStaminaCritical, isDead } from "@/lib/game-systems/fighting-fantasy";
import { FIGHTING_FANTASY_CONFIG } from "@/lib/game-systems/fighting-fantasy";
import type { Character, InventoryItem } from "@/lib/game-systems";
import { Counter } from "@/components/ui/counter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Swords,
  Heart,
  Sparkles,
  Ghost,
  Apple,
  Coins,
  Package,
  StickyNote,
  Plus,
  X,
  BookOpen,
  Undo2,
  Pencil,
} from "lucide-react";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";
import { EditCharacterDialog } from "./edit-character-dialog";

interface CharacterSheetProps {
  character: FightingFantasyCharacter;
  onUpdate: (updates: Partial<Character>, undoDescription?: string) => void;
  undoEntry: { description: string } | null;
  onUndo: () => void;
  onDismissUndo: () => void;
}

export function CharacterSheet({
  character,
  onUpdate,
  undoEntry,
  onUndo,
  onDismissUndo,
}: CharacterSheetProps) {
  const [newItemName, setNewItemName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const dead = isDead(character);
  const critical = isStaminaCritical(character);

  const handleStatChange = useCallback(
    (field: keyof FightingFantasyCharacter, value: number, description: string) => {
      onUpdate({ [field]: value } as Partial<Character>, description);
    },
    [onUpdate]
  );

  const handleAddItem = useCallback(() => {
    const name = newItemName.trim();
    if (!name) return;

    const newItem: InventoryItem = { id: nanoid(), name };
    onUpdate(
      {
        inventory: [...character.inventory, newItem],
      } as Partial<Character>,
      `Ajout : ${name}`
    );
    setNewItemName("");
  }, [newItemName, character.inventory, onUpdate]);

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      const item = character.inventory.find((i) => i.id === itemId);
      onUpdate(
        {
          inventory: character.inventory.filter((i) => i.id !== itemId),
        } as Partial<Character>,
        `Retrait : ${item?.name ?? "objet"}`
      );
    },
    [character.inventory, onUpdate]
  );

  const handleNotesChange = useCallback(
    (notes: string) => {
      onUpdate({ notes } as Partial<Character>);
    },
    [onUpdate]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      onUpdate({ currentPage: page } as Partial<Character>);
    },
    [onUpdate]
  );

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {/* Alerte de mort */}
      {dead && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-destructive bg-destructive/10 p-3 text-center text-sm text-destructive"
        >
          &#x2620;&#xFE0F; Votre aventure est terminée...
        </div>
      )}

      {/* En-tête sticky : stats principales + tracker page */}
      <div className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl text-primary">
                {character.name}
              </h2>
              <button
                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-primary"
                onClick={() => setEditOpen(true)}
                aria-label="Modifier le personnage"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            {character.bookTitle && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                {character.bookTitle}
              </p>
            )}
          </div>

          {/* Marque-page */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Marque-page
            </span>
            <input
              type="number"
              inputMode="numeric"
              className="h-8 w-16 rounded border border-border bg-input text-center text-sm font-medium tabular-nums"
              value={character.currentPage || ""}
              placeholder="§ ..."
              onChange={(e) => handlePageChange(parseInt(e.target.value) || 0)}
              min={0}
              aria-label="Marque-page — paragraphe en cours"
            />
          </div>
        </div>

        {/* Mini stats résumé */}
        <div className="mt-2 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Swords className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{character.currentSkill}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart
              className={cn(
                "h-3.5 w-3.5",
                critical ? "text-health-critical" : "text-health"
              )}
            />
            <span
              className={cn("font-medium", critical && "text-health-critical")}
            >
              {character.currentStamina}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-luck" />
            <span className="font-medium">{character.currentLuck}</span>
          </div>
          {character.maxFear > 0 && (
            <div className="flex items-center gap-1">
              <Ghost className="h-3.5 w-3.5 text-fear" />
              <span className="font-medium">{character.currentFear}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats détaillées */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Caractéristiques
          </h3>

          <Counter
            label={FIGHTING_FANTASY_CONFIG.statLabels.skill}
            value={character.currentSkill}
            initialValue={character.initialSkill}
            min={FF_LIMITS.SKILL_MIN}
            max={character.initialSkill}
            colorClass="text-primary"
            onChange={(v, desc) => handleStatChange("currentSkill", v, desc)}
          />

          <Counter
            label={FIGHTING_FANTASY_CONFIG.statLabels.stamina}
            value={character.currentStamina}
            initialValue={character.initialStamina}
            min={FF_LIMITS.STAMINA_MIN}
            max={character.initialStamina}
            colorClass="text-health"
            criticalThreshold={FF_LIMITS.CRITICAL_THRESHOLD}
            onChange={(v, desc) => handleStatChange("currentStamina", v, desc)}
          />

          <Counter
            label={FIGHTING_FANTASY_CONFIG.statLabels.luck}
            value={character.currentLuck}
            initialValue={character.initialLuck}
            min={FF_LIMITS.LUCK_MIN}
            max={character.initialLuck}
            colorClass="text-luck"
            onChange={(v, desc) => handleStatChange("currentLuck", v, desc)}
          />

          {character.maxFear > 0 && (
            <Counter
              label={FIGHTING_FANTASY_CONFIG.statLabels.fear}
              value={character.currentFear}
              initialValue={character.maxFear}
              min={FF_LIMITS.FEAR_MIN}
              max={character.maxFear}
              colorClass="text-fear"
              onChange={(v, desc) => handleStatChange("currentFear", v, desc)}
            />
          )}
        </CardContent>
      </Card>

      {/* Provisions et Or */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Ressources
          </h3>

          <Counter
            label={FIGHTING_FANTASY_CONFIG.statLabels.meals}
            value={character.meals}
            min={FF_LIMITS.MEALS_MIN}
            max={FF_LIMITS.MEALS_MAX}
            colorClass="text-foreground"
            onChange={(v, desc) => handleStatChange("meals", v, desc)}
          />

          <Counter
            label={FIGHTING_FANTASY_CONFIG.statLabels.gold}
            value={character.gold}
            min={FF_LIMITS.GOLD_MIN}
            max={FF_LIMITS.GOLD_MAX}
            colorClass="text-gold"
            onChange={(v, desc) => handleStatChange("gold", v, desc)}
          />
        </CardContent>
      </Card>

      {/* Inventaire */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Package className="h-4 w-4" />
              Inventaire
            </h3>
            <Badge variant="secondary" className="text-xs">
              {character.inventory.length}
            </Badge>
          </div>

          {/* Liste des items */}
          {character.inventory.length === 0 ? (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Aucun objet. Ajoutez des éléments ci-dessous.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1.5">
              {character.inventory.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2 text-sm"
                >
                  <span>{item.name}</span>
                  <button
                    className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label={`Retirer ${item.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Ajout rapide */}
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleAddItem();
            }}
          >
            <Input
              placeholder="Ajouter un objet..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              variant="secondary"
              disabled={!newItemName.trim()}
              aria-label="Ajouter"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <StickyNote className="h-4 w-4" />
            Notes
          </h3>
          <Textarea
            placeholder="Notez vos indices, choix importants..."
            value={character.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="min-h-[8rem] resize-y"
          />
        </CardContent>
      </Card>

      {/* Dialog d'édition du personnage */}
      <EditCharacterDialog
        character={character}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(updates) => onUpdate(updates, "Personnage modifié")}
      />

      {/* Snackbar Undo */}
      {undoEntry && (
        <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto flex max-w-lg items-center justify-between gap-3 rounded-lg bg-card border border-border px-4 py-3 shadow-lg">
          <span className="truncate text-sm">{undoEntry.description}</span>
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-primary"
              onClick={onUndo}
            >
              <Undo2 className="h-4 w-4" />
              Annuler
            </Button>
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={onDismissUndo}
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
