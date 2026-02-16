"use client";

import type { Character } from "@/lib/game-systems";
import { FIGHTING_FANTASY_CONFIG } from "@/lib/game-systems";
import type { FightingFantasyCharacter } from "@/lib/game-systems/fighting-fantasy";
import { isStaminaCritical } from "@/lib/game-systems/fighting-fantasy";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Swords, Heart, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
  character: Character;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CharacterCard({
  character,
  isSelected,
  onSelect,
  onDelete,
}: CharacterCardProps) {
  // Pour la V1, tous les personnages sont des Défis Fantastiques
  const ff = character as FightingFantasyCharacter;
  const critical = isStaminaCritical(ff);

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-all active:scale-[0.98]",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={() => onSelect(character.id)}
    >
      <CardContent className="p-4">
        {/* En-tête : nom + système */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-lg text-primary">
              {character.name || "Sans nom"}
            </h3>
            {character.bookTitle && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                <BookOpen className="h-3 w-3 shrink-0" />
                {character.bookTitle}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {FIGHTING_FANTASY_CONFIG.shortName}
          </Badge>
        </div>

        {/* Stats résumé */}
        <div className="mt-3 flex items-center gap-4 text-sm">
          {/* Habileté */}
          <div className="flex items-center gap-1">
            <Swords className="h-4 w-4 text-primary" />
            <span className="font-medium">{ff.currentSkill}</span>
            <span className="text-muted-foreground">/ {ff.initialSkill}</span>
          </div>

          {/* Endurance */}
          <div className="flex items-center gap-1">
            <Heart
              className={cn(
                "h-4 w-4",
                critical ? "text-health-critical animate-pulse" : "text-health"
              )}
            />
            <span
              className={cn(
                "font-medium",
                critical && "text-health-critical"
              )}
            >
              {ff.currentStamina}
            </span>
            <span className="text-muted-foreground">/ {ff.initialStamina}</span>
          </div>

          {/* Chance */}
          <div className="flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-luck" />
            <span className="font-medium">{ff.currentLuck}</span>
          </div>
        </div>

        {/* Paragraphe en cours */}
        {character.currentPage > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            &sect; {character.currentPage}
          </div>
        )}
      </CardContent>

      {/* Bouton supprimer (visible au hover desktop + toujours visible sur mobile) */}
      <button
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-opacity hover:bg-destructive/20 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(character.id);
        }}
        aria-label={`Supprimer ${character.name}`}
      >
        &times;
      </button>
    </Card>
  );
}
