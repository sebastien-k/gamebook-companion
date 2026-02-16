"use client";

import { useState, useCallback, useRef } from "react";
import { useStorage } from "@/hooks/use-storage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Upload, Settings, AlertCircle, Check, TriangleAlert } from "lucide-react";

interface DataManagerProps {
  onImportComplete: () => void;
}

export function DataManager({ onImportComplete }: DataManagerProps) {
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [pendingJson, setPendingJson] = useState<string | null>(null);
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

  /** Étape 1 : lire le fichier et demander confirmation */
  const handleFileSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const json = await file.text();
        // Validation rapide avant de demander confirmation
        const parsed = JSON.parse(json);
        if (!parsed.version || !Array.isArray(parsed.characters)) {
          throw new Error("Format de données invalide");
        }
        setPendingJson(json);
        setConfirmImport(true);
      } catch (error) {
        setStatus({
          type: "error",
          message: `Erreur de lecture : ${error instanceof Error ? error.message : "format invalide"}`,
        });
      }

      // Reset l'input pour pouvoir reimporter le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  /** Étape 2 : effectuer l'import après confirmation */
  const handleConfirmImport = useCallback(async () => {
    if (!pendingJson) return;

    try {
      await storage.importData(pendingJson);
      setStatus({ type: "success", message: "Import réussi !" });
      setConfirmImport(false);
      setPendingJson(null);
      onImportComplete();
      setTimeout(() => {
        setStatus(null);
        setOpen(false);
      }, 2000);
    } catch (error) {
      setConfirmImport(false);
      setPendingJson(null);
      setStatus({
        type: "error",
        message: `Erreur d'import : ${error instanceof Error ? error.message : "format invalide"}`,
      });
    }
  }, [pendingJson, storage, onImportComplete]);

  const handleCancelImport = useCallback(() => {
    setConfirmImport(false);
    setPendingJson(null);
  }, []);

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
              onChange={handleFileSelected}
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

      {/* Dialog de confirmation d'import */}
      <Dialog open={confirmImport} onOpenChange={(open) => !open && handleCancelImport()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-destructive" />
              Confirmer l&apos;import
            </DialogTitle>
            <DialogDescription>
              L&apos;import va <strong>remplacer tous vos personnages actuels</strong>.
              Cette action est irréversible. Pensez à exporter vos données avant de continuer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={handleCancelImport}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmImport}>
              Remplacer mes données
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
