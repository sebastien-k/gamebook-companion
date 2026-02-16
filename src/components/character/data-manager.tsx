"use client";

import { useState, useCallback, useRef } from "react";
import { useStorage } from "@/hooks/use-storage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Upload, Settings, AlertCircle, Check } from "lucide-react";

interface DataManagerProps {
  onImportComplete: () => void;
}

export function DataManager({ onImportComplete }: DataManagerProps) {
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleExport = useCallback(async () => {
    try {
      const json = await storage.exportData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `gamebook-companion-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus({ type: "success", message: "Export réussi !" });
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      setStatus({
        type: "error",
        message: `Erreur d'export : ${error instanceof Error ? error.message : "inconnue"}`,
      });
    }
  }, [storage]);

  const handleImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const json = await file.text();
        await storage.importData(json);
        setStatus({ type: "success", message: "Import réussi !" });
        onImportComplete();
        setTimeout(() => {
          setStatus(null);
          setOpen(false);
        }, 2000);
      } catch (error) {
        setStatus({
          type: "error",
          message: `Erreur d'import : ${error instanceof Error ? error.message : "format invalide"}`,
        });
      }

      // Reset l'input pour pouvoir reimporter le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [storage, onImportComplete]
  );

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
        aria-label="Gérer les données"
      >
        <Settings className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestion des données</DialogTitle>
            <DialogDescription>
              Exportez ou importez vos personnages au format JSON
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            <Button
              variant="secondary"
              className="gap-2 justify-start"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Exporter tous les personnages
            </Button>

            <Button
              variant="secondary"
              className="gap-2 justify-start"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Importer depuis un fichier
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />

            {/* Status */}
            {status && (
              <div
                className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                  status.type === "success"
                    ? "bg-health/10 text-health"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {status.type === "success" ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                {status.message}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
