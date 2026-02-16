"use client";

import { useEffect, useRef } from "react";
import { useDice } from "@/hooks/use-dice";
import type { DiceRoll } from "@/lib/game-systems";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dices, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DiceRollerProps {
  /** Afficher le bouton Tester la Chance ? */
  showLuckTest?: boolean;
  /** Chance actuelle pour le test */
  currentLuck?: number;
  /** Callback quand un test de chance est résolu */
  onLuckTest?: (roll: DiceRoll) => void;
}

export function DiceRoller({
  showLuckTest,
  currentLuck,
  onLuckTest,
}: DiceRollerProps) {
  const {
    currentRoll,
    history,
    isRolling,
    rollOneDice,
    rollTwoDice,
    clearHistory,
  } = useDice();

  // Notifier le parent quand un Test de Chance est résolu
  const prevHistoryLenRef = useRef(history.length);
  useEffect(() => {
    if (history.length > prevHistoryLenRef.current) {
      const lastRoll = history[0];
      if (lastRoll?.label === "Test de Chance" && onLuckTest) {
        onLuckTest(lastRoll);
      }
    }
    prevHistoryLenRef.current = history.length;
  }, [history, onLuckTest]);

  const handleRoll1d6 = () => {
    rollOneDice();
  };

  const handleRoll2d6 = () => {
    rollTwoDice();
  };

  const handleLuckTest = () => {
    rollTwoDice("Test de Chance");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Zone d'affichage du résultat */}
      <div className="flex flex-col items-center gap-2">
        <AnimatePresence mode="wait">
          {currentRoll ? (
            <motion.div
              key={currentRoll.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex items-center gap-3"
            >
              {currentRoll.values.map((value, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-xl border-2 border-primary/30 bg-muted text-3xl font-bold text-primary",
                    isRolling &&
                      "animate-[dice-shake_0.3s_ease-in-out_infinite]"
                  )}
                >
                  {value}
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30"
            >
              <Dices className="h-8 w-8 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Total */}
        {currentRoll && !isRolling && currentRoll.values.length > 1 && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-primary"
            aria-live="polite"
          >
            Total : {currentRoll.total}
          </motion.p>
        )}

        {/* Label du lancer */}
        {currentRoll?.label && !isRolling && (
          <p className="text-sm text-muted-foreground">{currentRoll.label}</p>
        )}
      </div>

      {/* Boutons de lancer */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1 gap-2"
            onClick={handleRoll1d6}
            disabled={isRolling}
          >
            <Dices className="h-5 w-5" />
            1d6
          </Button>
          <Button
            size="lg"
            className="flex-1 gap-2"
            onClick={handleRoll2d6}
            disabled={isRolling}
          >
            <Dices className="h-5 w-5" />
            2d6
          </Button>
        </div>

        {/* Bouton Tester la Chance */}
        {showLuckTest && currentLuck !== undefined && (
          <Button
            size="lg"
            variant="secondary"
            className="gap-2 border border-luck/30 text-luck"
            onClick={handleLuckTest}
            disabled={isRolling || currentLuck <= 0}
          >
            <Sparkles className="h-4 w-4" /> Tester la Chance
            {currentLuck > 0 && (
              <span className="text-xs opacity-70">
                ({currentLuck} restant{currentLuck > 1 ? "s" : ""})
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Historique */}
      {history.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-medium text-muted-foreground">
                Historique ({history.length})
              </h4>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={clearHistory}
                aria-label="Effacer l'historique"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {history.map((roll, index) => (
                <li
                  key={roll.id}
                  className={cn(
                    "flex items-center justify-between rounded px-2 py-1 text-xs",
                    index === 0 && "bg-primary/10"
                  )}
                >
                  <span className="text-muted-foreground">
                    {roll.type} — [{roll.values.join(", ")}]
                    {roll.label && ` — ${roll.label}`}
                  </span>
                  <span className="font-medium tabular-nums">{roll.total}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
