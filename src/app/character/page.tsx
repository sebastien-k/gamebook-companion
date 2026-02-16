import { AppShell } from "@/components/layout/app-shell";
import { ScrollText } from "lucide-react";

export default function CharacterPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center px-4 pt-8">
        <h1 className="font-display text-2xl text-primary">Fiche</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fiche de personnage
        </p>

        {/* Empty state */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ScrollText className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            S&eacute;lectionnez ou cr&eacute;ez un personnage pour voir sa fiche
          </p>
        </div>
      </div>
    </AppShell>
  );
}
