"use client";

import { useState, useEffect } from "react";
import type { FightingFantasyCharacter } from "@/lib/game-systems/fighting-fantasy";
import { FF_LIMITS } from "@/lib/game-systems/fighting-fantasy";
import { FIGHTING_FANTASY_CONFIG } from "@/lib/game-systems/fighting-fantasy";
import type { Character } from "@/lib/game-systems";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Swords, Heart, Sparkles } from "lucide-react";

interface EditCharacterDialogProps {
  character: FightingFantasyCharacter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Character>) => void;
}

export function EditCharacterDialog({
  character,
  open,
  onOpenChange,
  onSave,
}: EditCharacterDialogProps) {
  const [name, setName] = useState(character.name);
  const [bookTitle, setBookTitle] = useState(character.bookTitle);
  const [initialSkill, setInitialSkill] = useState(character.initialSkill);
  const [initialStamina, setInitialStamina] = useState(character.initialStamina);
  const [initialLuck, setInitialLuck] = useState(character.initialLuck);

  // Réinitialiser les valeurs quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setName(character.name);
      setBookTitle(character.bookTitle);
      setInitialSkill(character.initialSkill);
      setInitialStamina(character.initialStamina);
      setInitialLuck(character.initialLuck);
    }
  }, [open, character]);

  const handleSave = () => {
    const updates: Partial<FightingFantasyCharacter> = {};

    // Nom et livre
    if (name !== character.name) updates.name = name;
    if (bookTitle !== character.bookTitle) updates.bookTitle = bookTitle;

    // Habileté de départ
    if (initialSkill !== character.initialSkill) {
      updates.initialSkill = initialSkill;
      // Ajuster la valeur actuelle si elle dépasse la nouvelle valeur de départ
      if (character.currentSkill > initialSkill) {
        updates.currentSkill = initialSkill;
      }
    }

    // Endurance de départ
    if (initialStamina !== character.initialStamina) {
      updates.initialStamina = initialStamina;
      if (character.currentStamina > initialStamina) {
        updates.currentStamina = initialStamina;
      }
    }

    // Chance de départ
    if (initialLuck !== character.initialLuck) {
      updates.initialLuck = initialLuck;
      if (character.currentLuck > initialLuck) {
        updates.currentLuck = initialLuck;
      }
    }

    // Ne sauvegarder que si quelque chose a changé
    if (Object.keys(updates).length > 0) {
      onSave(updates as Partial<Character>);
    }

    onOpenChange(false);
  };

  const clampStat = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Modifier le personnage</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Nom */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-name"
              className="text-sm font-medium text-muted-foreground"
            >
              Nom
            </label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sans nom"
            />
          </div>

          {/* Titre du livre */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-book"
              className="text-sm font-medium text-muted-foreground"
            >
              Titre du livre
            </label>
            <Input
              id="edit-book"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="Ex : Le Sorcier de la Montagne de Feu"
            />
          </div>

          {/* Séparateur */}
          <div className="border-t border-border" />

          <p className="text-xs text-muted-foreground">
            Stats de départ — les valeurs actuelles seront ajustées si elles
            dépassent les nouvelles valeurs de départ.
          </p>

          {/* Stats de départ */}
          <div className="flex flex-col gap-3">
            {/* Habileté */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {FIGHTING_FANTASY_CONFIG.statLabels.skill}
                </span>
              </div>
              <Input
                type="number"
                inputMode="numeric"
                className="h-8 w-16 text-center tabular-nums"
                value={initialSkill}
                onChange={(e) =>
                  setInitialSkill(
                    clampStat(
                      parseInt(e.target.value) || 1,
                      FF_LIMITS.SKILL_MIN,
                      FF_LIMITS.SKILL_MAX
                    )
                  )
                }
                min={FF_LIMITS.SKILL_MIN}
                max={FF_LIMITS.SKILL_MAX}
              />
            </div>

            {/* Endurance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-health" />
                <span className="text-sm font-medium">
                  {FIGHTING_FANTASY_CONFIG.statLabels.stamina}
                </span>
              </div>
              <Input
                type="number"
                inputMode="numeric"
                className="h-8 w-16 text-center tabular-nums"
                value={initialStamina}
                onChange={(e) =>
                  setInitialStamina(
                    clampStat(
                      parseInt(e.target.value) || 1,
                      1,
                      FF_LIMITS.STAMINA_MAX
                    )
                  )
                }
                min={1}
                max={FF_LIMITS.STAMINA_MAX}
              />
            </div>

            {/* Chance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-luck" />
                <span className="text-sm font-medium">
                  {FIGHTING_FANTASY_CONFIG.statLabels.luck}
                </span>
              </div>
              <Input
                type="number"
                inputMode="numeric"
                className="h-8 w-16 text-center tabular-nums"
                value={initialLuck}
                onChange={(e) =>
                  setInitialLuck(
                    clampStat(
                      parseInt(e.target.value) || 1,
                      1,
                      FF_LIMITS.LUCK_MAX
                    )
                  )
                }
                min={1}
                max={FF_LIMITS.LUCK_MAX}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
