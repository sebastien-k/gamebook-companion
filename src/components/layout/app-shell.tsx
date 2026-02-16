"use client";

import { BottomNav } from "./bottom-nav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-background">
      {/* Contenu principal avec padding pour la BottomNav */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Navigation fixe en bas */}
      <BottomNav />
    </div>
  );
}
