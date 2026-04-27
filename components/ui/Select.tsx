import React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helper?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({
  label,
  helper,
  options,
  error,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full px-4 py-2.5 bg-surface border border-border rounded-lg",
            "text-text-primary appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors",
            error && "border-danger focus:ring-danger/50 focus:border-danger",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted"
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      {helper && !error && <p className="text-sm text-text-muted">{helper}</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}