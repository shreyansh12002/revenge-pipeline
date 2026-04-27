"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, LayoutGrid, List, FileText, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StoryCard } from "@/components/stories/StoryCard";
import { StoryFilters } from "@/components/stories/StoryFilters";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { Story } from "@/types";

const SUBREDDITS = ["ProRevenge", "NuclearRevenge", "MaliciousCompliance", "EntitledPeople", "AmITheAsshole", "TrueOffMyChest"];

type ViewMode = "grid" | "list";

interface StoriesResponse {
  success: boolean;
  data: Story[];
  total: number;
  page: number;
  pageSize: number;
}

export default function StoriesPage() {
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    search?: string;
    subreddit?: string;
    status?: string;
    minScore?: number;
    sortBy?: string;
    sortOrder?: string;
  }>({
    sortBy: "scraped_at",
    sortOrder: "desc",
  });

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const pageSize = 30;

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem("stories-view-mode") as ViewMode | null;
    if (savedView) {
      setViewMode(savedView);
    }
  }, []);

  // Save view preference
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("stories-view-mode", mode);
  };

  // Build query string from filters
  const buildQueryString = useCallback((f: typeof filters, p: number) => {
    const params = new URLSearchParams();
    params.set("page", p.toString());
    params.set("pageSize", pageSize.toString());
    params.set("sortBy", f.sortBy || "scraped_at");
    params.set("sortOrder", f.sortOrder || "desc");

    if (f.search) params.set("search", f.search);
    if (f.subreddit) params.set("subreddit", f.subreddit);
    if (f.status) params.set("status", f.status);
    if (f.minScore !== undefined) params.set("minScore", f.minScore.toString());

    return params.toString();
  }, [pageSize]);

  // Fetch stories
  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const queryString = buildQueryString(filters, page);
      const response = await fetch(`/api/stories?${queryString}`);
      const data: StoriesResponse = await response.json();

      if (data.success) {
        setStories(data.data);
        setTotal(data.total);
      } else {
        toast("Failed to load stories", "error");
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast("Failed to load stories", "error");
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, buildQueryString, toast]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Handle filter changes
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  // Handle story deletion
  const handleDeleteStory = (deletedId: string) => {
    setStories((prev) => prev.filter((s) => s.id !== deletedId));
    setTotal((prev) => prev - 1);
    toast("Story deleted successfully", "success");
  };

  // Bulk selection handlers
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === stories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(stories.map((s) => s.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    setIsBulkDeleting(true);
    let deletedCount = 0;

    try {
      for (const id of selectedIds) {
        const response = await fetch(`/api/stories/${id}`, { method: "DELETE" });
        if (response.ok) {
          deletedCount++;
        }
      }

      setStories((prev) => prev.filter((s) => !selectedIds.has(s.id)));
      setTotal((prev) => prev - deletedCount);
      setSelectedIds(new Set());
      toast(`${deletedCount} story/stories deleted successfully`, "success");
    } catch (error) {
      console.error("Error bulk deleting stories:", error);
      toast("Failed to delete some stories", "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Stories</h1>
          <p className="text-text-secondary mt-1">
            Browse and manage your scraped Reddit stories
          </p>
        </div>
        <Link href="/scrape">
          <Button>
            <Plus size={16} />
            Scrape New
          </Button>
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <StoryFilters
          filters={filters}
          onChange={handleFilterChange}
          subreddits={SUBREDDITS}
        />

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
          <button
            onClick={() => handleViewChange("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-accent/10 text-accent"
                : "text-text-muted hover:text-text-primary"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => handleViewChange("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-accent/10 text-accent"
                : "text-text-muted hover:text-text-primary"
            }`}
            aria-label="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-accent/10 border border-accent/30 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-primary font-medium">
              {selectedIds.size} selected
            </span>
            <button
              onClick={selectAll}
              className="text-sm text-accent hover:underline"
            >
              {selectedIds.size === stories.length ? "Deselect all" : "Select all"}
            </button>
            <button
              onClick={clearSelection}
              className="text-sm text-text-muted hover:text-text-primary"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              loading={isBulkDeleting}
            >
              <Trash2 size={14} />
              <span className="ml-2">Delete Selected</span>
            </Button>
          </div>
        </div>
      )}

      {/* Story Count */}
      <div className="text-sm text-text-secondary">
        Showing {stories.length} of {total} stories
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 text-danger text-sm">
          Failed to load stories. Please try again.
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-4"
          }
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4">
              <Skeleton className="h-5 w-3/4 mb-3" />
              <div className="flex gap-2 mb-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : stories.length === 0 ? (
        /* Empty State */
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No stories yet</h3>
          <p className="text-text-secondary mb-6">
            Scrape some stories from Reddit to get started
          </p>
          <Link href="/scrape">
            <Button>Scrape Stories</Button>
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View - Click to open detail page */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onDelete={handleDeleteStory}
              view="grid"
            />
          ))}
        </div>
      ) : (
        /* List View - Clickable with selection for bulk actions */
        <div className="flex flex-col gap-3">
          {stories.map((story) => (
            <div key={story.id} className="relative group">
              {/* Selection checkbox overlay */}
              <input
                type="checkbox"
                checked={selectedIds.has(story.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleSelection(story.id);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded border-2 border-border bg-surface z-10 cursor-pointer checked:bg-accent checked:border-accent"
              />
              <StoryCard
                story={story}
                onDelete={handleDeleteStory}
                view="list"
                selectable
                selected={selectedIds.has(story.id)}
                onSelect={toggleSelection}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}