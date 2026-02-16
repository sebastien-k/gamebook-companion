"use client";

import { useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CounterProps {
  label: string;
  value: number;
  initialValue?: number;
  min?: number;
  max?: number;
  colorClass?: string;
  criticalThreshold?: number;
  onChange: (newValue: number, description: string) => void;
}

/**
 * Compteur +/- tactile (48px touch targets).
 * Affiche valeur actuelle / valeur de départ.
 * Change de couleur quand critique.
 */
export function Counter({
  label,
  value,
  initialValue,
  min = 0,
  max = 99,
  colorClass = "text-primary",
  criticalThreshold,
  onChange,
}: CounterProps) {
  const isCritical =
    criticalThreshold !== undefined &&
    initialValue !== undefined &&
    initialValue > 0 &&
    value / initialValue < criticalThreshold;

  const isDead = value <= 0 && min === 0;

  const handleDecrement = useCallback(() => {
    if (value > min) {
      onChange(value - 1, `${label} : ${value} → ${value - 1}`);
    }
  }, [value, min, onChange, label]);

  const handleIncrement = useCallback(() => {
    if (value < max) {
      onChange(value + 1, `${label} : ${value} → ${value + 1}`);
    }
  }, [value, max, onChange, label]);

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <div className="min-w-[5rem]">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      </div>

      {/* Bouton - */}
      <button
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary transition-colors active:scale-95",
          "disabled:opacity-30"
        )}
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label={`Diminuer ${label}`}
      >
        <Minus className="h-5 w-5" />
      </button>

      {/* Valeur */}
      <div className="flex min-w-[4rem] flex-col items-center">
        <span
          className={cn(
            "text-2xl font-bold tabular-nums transition-colors",
            isDead
              ? "text-destructive"
              : isCritical
                ? "text-health-critical animate-[pulse-critical_1.5s_ease-in-out_infinite]"
                : colorClass
          )}
        >
          {value}
        </span>
        {initialValue !== undefined && (
          <span className="text-xs text-muted-foreground">/ {initialValue}</span>
        )}
      </div>

      {/* Bouton + */}
      <button
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary transition-colors active:scale-95",
          "disabled:opacity-30"
        )}
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label={`Augmenter ${label}`}
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
