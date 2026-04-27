import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "text" | "circle" | "rect";
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = "text",
  className,
  width,
  height,
}: SkeletonProps) {
  const variantStyles = {
    text: "h-4 rounded",
    circle: "rounded-full",
    rect: "rounded-lg",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-surface via-surface-elevated to-surface bg-[length:200%_100%]",
        "animate-shimmer",
        variantStyles[variant],
        className
      )}
      style={style}
    />
  );
}