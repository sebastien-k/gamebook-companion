import { AppShell } from "@/components/layout/app-shell";
import { Users } from "lucide-react";

export default function HomePage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center px-4 pt-8">
        {/* En-t\u00eate */}
        <h1 className="font-display text-2xl text-primary">
          Gamebook Companion
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vos fiches de personnage
        </p>

        {/* Empty state */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">
              Aucun personnage
            </p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Cr\u00e9ez votre premier personnage pour commencer votre aventure
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
