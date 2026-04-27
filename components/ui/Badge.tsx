import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "info" | "success" | "warning" | "danger" | "default";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  info: "bg-accent/10 text-accent",
  success: "bg-accent-secondary/10 text-accent-secondary",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  default: "bg-surface-elevated text-text-secondary",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}