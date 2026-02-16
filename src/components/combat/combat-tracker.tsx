"use client";

import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import type { CombatEnemy, Character } from "@/lib/game-systems";
import type { FightingFantasyCharacter } from "@/lib/game-systems/fighting-fantasy";
import { Counter } from "@/components/ui/counter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, RotateCcw, Swords } from "lucide-react";

interface CombatTrackerProps {
  character: FightingFantasyCharacter;
  onUpdate: (updates: Partial<Character>, undoDescription?: string) => void;
}

export function CombatTracker({ character, onUpdate }: CombatTrackerProps) {
  const [newEnemyName, setNewEnemyName] = useState("");
  const [newEnemySkill, setNewEnemySkill] = useState("7");
  const [newEnemyStamina, setNewEnemyStamina] = useState("7");

  const enemies = character.combatEnemies;

  const handleAddEnemy = useCallback(() => {
    const name = newEnemyName.trim() || "Adversaire";
    const skill = parseInt(newEnemySkill) || 7;
    const stamina = parseInt(newEnemyStamina) || 7;

    const enemy: CombatEnemy = {
      id: nanoid(),
      name,
      skill,
      stamina,
      initialSkill: skill,
      initialStamina: stamina,
    };

    onUpdate(
      {
        combatEnemies: [...enemies, enemy],
      } as Partial<Character>,
      `Combat : ajout de ${name}`
    );

    setNewEnemyName("");
    setNewEnemySkill("7");
    setNewEnemyStamina("7");
  }, [newEnemyName, newEnemySkill, newEnemyStamina, enemies, onUpdate]);

  const handleUpdateEnemy = useCallback(
    (enemyId: string, updates: Partial<CombatEnemy>, description: string) => {
      const updatedEnemies = enemies.map((e) =>
        e.id === enemyId ? { ...e, ...updates } : e
      );
      onUpdate(
        { combatEnemies: updatedEnemies } as Partial<Character>,
        description
      );
    },
    [enemies, onUpdate]
  );

  const handleRemoveEnemy = useCallback(
    (enemyId: string) => {
      const enemy = enemies.find((e) => e.id === enemyId);
      onUpdate(
        {
          combatEnemies: enemies.filter((e) => e.id !== enemyId),
        } as Partial<Character>,
        `Combat : retrait de ${enemy?.name ?? "adversaire"}`
      );
    },
    [enemies, onUpdate]
  );

  const handleResetCombat = useCallback(() => {
    onUpdate(
      { combatEnemies: [] } as Partial<Character>,
      "Combat réinitialisé"
    );
  }, [onUpdate]);

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-primary">Combat</h2>
          <p className="text-xs text-muted-foreground">
            {character.name} — Habileté : {character.currentSkill}
          </p>
        </div>
        {enemies.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 text-muted-foreground"
            onClick={handleResetCombat}
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Liste des adversaires */}
      {enemies.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Swords className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Aucun adversaire. Ajoutez-en un ci-dessous.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {enemies.map((enemy) => (
            <EnemyCard
              key={enemy.id}
              enemy={enemy}
              onUpdate={(updates, desc) =>
                handleUpdateEnemy(enemy.id, updates, desc)
              }
              onRemove={() => handleRemoveEnemy(enemy.id)}
            />
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Ajouter un adversaire
          </h3>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleAddEnemy();
            }}
          >
            <Input
              placeholder="Nom de l'adversaire"
              value={newEnemyName}
              onChange={(e) => setNewEnemyName(e.target.value)}
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">
                  Habileté
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={newEnemySkill}
                  onChange={(e) => setNewEnemySkill(e.target.value)}
                  min={1}
                  max={12}
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">
                  Endurance
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={newEnemyStamina}
                  onChange={(e) => setNewEnemyStamina(e.target.value)}
                  min={1}
                  max={24}
                />
              </div>
            </div>
            <Button type="submit" className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/** Carte d'un adversaire en combat */
function EnemyCard({
  enemy,
  onUpdate,
  onRemove,
}: {
  enemy: CombatEnemy;
  onUpdate: (updates: Partial<CombatEnemy>, description: string) => void;
  onRemove: () => void;
}) {
  const dead = enemy.stamina <= 0;

  return (
    <Card className={dead ? "opacity-50" : undefined}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">
              {enemy.name}
              {dead && (
                <span className="ml-2 text-xs text-destructive">
                  (vaincu)
                </span>
              )}
            </h4>
          </div>
          <button
            className="text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label={`Retirer ${enemy.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <Counter
            label="Habileté"
            value={enemy.skill}
            initialValue={enemy.initialSkill}
            min={0}
            max={12}
            colorClass="text-primary"
            onChange={(v, desc) =>
              onUpdate({ skill: v }, `${enemy.name} — ${desc}`)
            }
          />
          <Counter
            label="Endurance"
            value={enemy.stamina}
            initialValue={enemy.initialStamina}
            min={0}
            max={enemy.initialStamina}
            colorClass="text-health"
            criticalThreshold={0.25}
            onChange={(v, desc) =>
              onUpdate({ stamina: v }, `${enemy.name} — ${desc}`)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
