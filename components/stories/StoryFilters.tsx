"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface StoryFiltersProps {
  filters: {
    subreddit?: string;
    status?: string;
    minScore?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  };
  onChange: (filters: StoryFiltersProps["filters"]) => void;
  subreddits: string[];
}

const SORT_OPTIONS = [
  { value: "scraped_at", label: "Date Scraped" },
  { value: "upvotes", label: "Upvotes" },
  { value: "viral_score", label: "Viral Score" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "raw", label: "Raw" },
  { value: "scripted", label: "Scripted" },
  { value: "packaged", label: "Packaged" },
  { value: "exported", label: "Exported" },
];

export function StoryFilters({ filters, onChange, subreddits }: StoryFiltersProps) {
  const handleChange = (key: string, value: string | number | undefined) => {
    onChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleClear = () => {
    onChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== ""
  );

  return (
    <div className="space-y-4">
      {/* Main Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Search stories..."
            value={filters.search || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg",
              "text-text-primary placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
              "transition-colors"
            )}
          />
        </div>

        {/* Subreddit Filter */}
        <select
          value={filters.subreddit || ""}
          onChange={(e) => handleChange("subreddit", e.target.value)}
          className={cn(
            "px-4 py-2.5 bg-surface border border-border rounded-lg",
            "text-text-primary cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
            "transition-colors min-w-[140px]"
          )}
        >
          <option value="">All Subreddits</option>
          {subreddits.map((sub) => (
            <option key={sub} value={sub}>
              r/{sub}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.status || ""}
          onChange={(e) => handleChange("status", e.target.value)}
          className={cn(
            "px-4 py-2.5 bg-surface border border-border rounded-lg",
            "text-text-primary cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
            "transition-colors min-w-[140px]"
          )}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Min Viral Score */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min VS"
            min="0"
            max="100"
            value={filters.minScore ?? ""}
            onChange={(e) =>
              handleChange("minScore", e.target.value ? parseInt(e.target.value, 10) : undefined)
            }
            className={cn(
              "w-20 px-3 py-2.5 bg-surface border border-border rounded-lg",
              "text-text-primary placeholder:text-text-muted text-center",
              "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
              "transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            )}
          />
        </div>
      </div>

      {/* Sort Controls Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Sort By */}
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span>Sort by:</span>
          <select
            value={filters.sortBy || "scraped_at"}
            onChange={(e) => handleChange("sortBy", e.target.value)}
            className={cn(
              "px-3 py-1.5 bg-surface border border-border rounded-lg",
              "text-text-primary cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
              "transition-colors"
            )}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order Toggle */}
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => handleChange("sortOrder", "asc")}
            className={cn(
              "px-3 py-1.5 text-sm transition-colors",
              filters.sortOrder === "asc" || !filters.sortOrder
                ? "bg-accent/10 text-accent"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            ASC
          </button>
          <button
            onClick={() => handleChange("sortOrder", "desc")}
            className={cn(
              "px-3 py-1.5 text-sm transition-colors border-l border-border",
              filters.sortOrder === "desc"
                ? "bg-accent/10 text-accent"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            DESC
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-text-muted"
          >
            <X size={14} />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}