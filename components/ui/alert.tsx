import * as React from "react";

import { cn } from "@/lib/utils";

export function Alert({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "destructive";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        variant === "destructive"
          ? "border-destructive/25 bg-destructive/10 text-destructive"
          : "border-border bg-secondary/50 text-foreground",
        className,
      )}
      {...props}
    />
  );
}
