"use client";

import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import { useStorage } from "@/hooks/use-storage";
import type { FightingFantasyCharacter } from "@/lib/game-systems/fighting-fantasy";
import { FIGHTING_FANTASY_CONFIG } from "@/lib/game-systems/fighting-fantasy";
import { rollCreationStat } from "@/lib/game-systems/fighting-fantasy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dices, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type WizardStep = "info" | "skill" | "stamina" | "luck" | "confirm";

const STEPS: WizardStep[] = ["info", "skill", "stamina", "luck", "confirm"];

interface CreationWizardProps {
  onComplete: (character: FightingFantasyCharacter) => void;
  onCancel: () => void;
}

export function CreationWizard({ onComplete, onCancel }: CreationWizardProps) {
  const storage = useStorage();

  const [step, setStep] = useState<WizardStep>("info");
  const [name, setName] = useState("");
  const [bookTitle, setBookTitle] = useState("");

  // Stats roulées
  const [skill, setSkill] = useState<number | null>(null);
  const [stamina, setStamina] = useState<number | null>(null);
  const [luck, setLuck] = useState<number | null>(null);

  // Animation de roulement
  const [isRolling, setIsRolling] = useState(false);

  const stepIndex = STEPS.indexOf(step);
  const { creation } = FIGHTING_FANTASY_CONFIG;

  const rollStat = useCallback(
    (diceCount: 1 | 2, bonus: number, setter: (v: number) => void) => {
      setIsRolling(true);

      // Animation : valeurs aléatoires rapides pendant 500ms
      const interval = setInterval(() => {
        setter(rollCreationStat(diceCount, bonus));
      }, 80);

      setTimeout(() => {
        clearInterval(interval);
        const finalValue = rollCreationStat(diceCount, bonus);
        setter(finalValue);
        setIsRolling(false);

        // Feedback haptique
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 600);
    },
    []
  );

  const handleNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setStep(STEPS[nextIndex]);
    }
  };

  const handleCreate = async () => {
    if (skill === null || stamina === null || luck === null) return;

    const now = new Date().toISOString();
    const character: FightingFantasyCharacter = {
      id: nanoid(),
      name: name.trim() || "Aventurier",
      bookTitle: bookTitle.trim(),
      gameSystem: "fighting-fantasy",
      currentPage: 1,
      notes: "",
      createdAt: now,
      updatedAt: now,

      initialSkill: skill,
      currentSkill: skill,
      initialStamina: stamina,
      currentStamina: stamina,
      initialLuck: luck,
      currentLuck: luck,

      maxFear: 0,
      currentFear: 0,

      meals: 0,
      gold: 0,

      inventory: [],
      combatEnemies: [],
    };

    await storage.saveCharacter(character);
    await storage.setLastCharacterId(character.id);
    onComplete(character);
  };

  const canProceed = () => {
    switch (step) {
      case "info":
        return true; // Le nom est optionnel
      case "skill":
        return skill !== null;
      case "stamina":
        return stamina !== null;
      case "luck":
        return luck !== null;
      case "confirm":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* Titre */}
      <div className="text-center">
        <h2 className="font-display text-xl text-primary">
          Nouveau personnage
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {FIGHTING_FANTASY_CONFIG.name}
        </p>
      </div>

      {/* Indicateur d'étape */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              i <= stepIndex ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Contenu de l'étape */}
      {step === "info" && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-4">
            <div>
              <label
                htmlFor="char-name"
                className="mb-1.5 block text-sm font-medium"
              >
                Nom du personnage
              </label>
              <Input
                id="char-name"
                placeholder="Aventurier"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label
                htmlFor="book-title"
                className="mb-1.5 block text-sm font-medium"
              >
                Titre du livre
              </label>
              <Input
                id="book-title"
                placeholder="Le Sorcier de la Montagne de Feu"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === "skill" && (
        <StatRollStep
          label={creation.skill.label}
          formula="1d6 + 6"
          value={skill}
          isRolling={isRolling}
          onRoll={() => rollStat(1, 6, setSkill)}
        />
      )}

      {step === "stamina" && (
        <StatRollStep
          label={creation.stamina.label}
          formula="2d6 + 12"
          value={stamina}
          isRolling={isRolling}
          onRoll={() => rollStat(2, 12, setStamina)}
        />
      )}

      {step === "luck" && (
        <StatRollStep
          label={creation.luck.label}
          formula="1d6 + 6"
          value={luck}
          isRolling={isRolling}
          onRoll={() => rollStat(1, 6, setLuck)}
        />
      )}

      {step === "confirm" && (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-display text-lg text-primary">
              R&eacute;capitulatif
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Nom</dt>
                <dd className="font-medium">{name || "Aventurier"}</dd>
              </div>
              {bookTitle && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Livre</dt>
                  <dd className="font-medium">{bookTitle}</dd>
                </div>
              )}
              <div className="my-2 border-t border-border" />
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {creation.skill.label}
                </dt>
                <dd className="font-medium text-primary">{skill}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {creation.stamina.label}
                </dt>
                <dd className="font-medium text-health">{stamina}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {creation.luck.label}
                </dt>
                <dd className="font-medium text-luck">{luck}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Boutons de navigation */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={stepIndex === 0 ? onCancel : () => setStep(STEPS[stepIndex - 1])}
        >
          {stepIndex === 0 ? "Annuler" : "Retour"}
        </Button>

        {step === "confirm" ? (
          <Button className="flex-1 gap-2" onClick={handleCreate}>
            <Check className="h-4 w-4" />
            Cr&eacute;er
          </Button>
        ) : (
          <Button
            className="flex-1 gap-2"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/** Sous-composant pour le lancer de stat */
function StatRollStep({
  label,
  formula,
  value,
  isRolling,
  onRoll,
}: {
  label: string;
  formula: string;
  value: number | null;
  isRolling: boolean;
  onRoll: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-6">
        <p className="text-sm text-muted-foreground">{formula}</p>
        <h3 className="font-display text-lg">{label}</h3>

        {/* Valeur du dé */}
        <div
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-xl border-2 border-primary/30 bg-muted text-3xl font-bold text-primary transition-all",
            isRolling && "animate-[dice-shake_0.3s_ease-in-out_infinite]",
            value !== null && !isRolling && "border-primary shadow-[0_0_12px_var(--gold-dark)]"
          )}
        >
          {value !== null ? value : "?"}
        </div>

        {/* Bouton de lancer */}
        <Button
          size="lg"
          className="gap-2"
          onClick={onRoll}
          disabled={isRolling}
        >
          <Dices className="h-5 w-5" />
          {value === null ? "Lancer" : "Relancer"}
        </Button>
      </CardContent>
    </Card>
  );
}
