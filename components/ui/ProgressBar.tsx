import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  className?: string;
  indeterminate?: boolean;
}

export function ProgressBar({
  value,
  label,
  showValue = false,
  className,
  indeterminate = false,
}: ProgressBarProps) {
  return (
    <div className="space-y-2">
      {(label || showValue) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-text-secondary">{label}</span>}
          {showValue && <span className="text-text-muted">{Math.round(value)}%</span>}
        </div>
      )}
      <div className={cn("h-2 bg-surface rounded-full overflow-hidden", className)}>
        <div
          className={cn(
            "h-full bg-accent rounded-full transition-all duration-300",
            indeterminate && "animate-shimmer bg-gradient-to-r from-accent via-accent/50 to-accent bg-[length:200%_100%]"
          )}
          style={indeterminate ? undefined : { width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}