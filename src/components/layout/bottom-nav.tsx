"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Users, ScrollText, Swords, Dices } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "Personnages",
    icon: Users,
  },
  {
    href: "/character",
    label: "Fiche",
    icon: ScrollText,
  },
  {
    href: "/combat",
    label: "Combat",
    icon: Swords,
  },
  {
    href: "/dice",
    label: "D\u00e9s",
    icon: Dices,
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm safe-bottom"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[4rem] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors",
                "active:scale-95",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-colors",
                  isActive && "drop-shadow-[0_0_6px_var(--gold)]"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "font-medium transition-colors",
                  isActive && "text-primary"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
