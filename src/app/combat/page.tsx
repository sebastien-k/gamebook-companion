import { AppShell } from "@/components/layout/app-shell";
import { Swords } from "lucide-react";

export default function CombatPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center px-4 pt-8">
        <h1 className="font-display text-2xl text-primary">Combat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tracker de combat
        </p>

        {/* Empty state */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Swords className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Aucun combat en cours. Ajoutez un adversaire pour commencer.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
