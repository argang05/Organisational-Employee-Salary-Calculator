"use client";

import { X } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { items, dismiss } = useToast();

  return (
    <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "rounded-2xl border bg-white p-4 shadow-soft backdrop-blur",
            item.variant === "destructive"
              ? "border-destructive/30"
              : "border-border",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold">{item.title}</p>
              {item.description ? (
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="rounded-full p-1 text-muted-foreground transition hover:bg-secondary"
              aria-label="Dismiss toast"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
