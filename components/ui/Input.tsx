import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Input({
  label,
  error,
  helper,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-2.5 bg-surface border border-border rounded-lg",
          "text-text-primary placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors",
          error && "border-danger focus:ring-danger/50 focus:border-danger",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      {helper && !error && <p className="text-sm text-text-muted">{helper}</p>}
    </div>
  );
}