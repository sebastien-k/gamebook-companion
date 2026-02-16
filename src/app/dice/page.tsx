import { AppShell } from "@/components/layout/app-shell";
import { Dices } from "lucide-react";

export default function DicePage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center px-4 pt-8">
        <h1 className="font-display text-2xl text-primary">D&eacute;s</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simulateur de d&eacute;s
        </p>

        {/* Placeholder pour le simulateur de d&eacute;s */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Dices className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Le simulateur de d&eacute;s arrive bient&ocirc;t...
          </p>
        </div>
      </div>
    </AppShell>
  );
}
