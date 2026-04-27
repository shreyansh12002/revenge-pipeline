"use client";

import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tag...",
  label,
  error,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex flex-wrap gap-2 p-3 bg-surface border border-border rounded-lg",
          "focus-within:ring-2 focus-within:ring-accent/50 focus-within:border-accent",
          error && "border-danger",
          className
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent text-sm rounded-md"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-accent/70 transition-colors"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[100px] bg-transparent text-text-primary placeholder:text-text-muted outline-none"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}