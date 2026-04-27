import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl p-6",
        hover && "hover:border-accent/50 transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}