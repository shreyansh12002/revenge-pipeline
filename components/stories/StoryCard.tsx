"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, MessageCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { truncate, cn } from "@/lib/utils";
import type { Story, StoryStatus } from "@/types";

interface StoryCardProps {
  story: Story;
  onDelete?: (id: string) => void;
  view?: "grid" | "list";
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const statusVariants: Record<StoryStatus, "default" | "info" | "success" | "warning"> = {
  raw: "default",
  scripted: "info",
  packaged: "success",
  exported: "warning",
};

const statusLabels: Record<StoryStatus, string> = {
  raw: "Raw",
  scripted: "Scripted",
  packaged: "Packaged",
  exported: "Exported",
};

function getViralScoreVariant(score: number): "success" | "warning" | "danger" {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "danger";
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: num >= 1000 ? "compact" : "standard",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(num);
}

export function StoryCard({
  story,
  onDelete,
  view = "grid",
  selectable = false,
  selected = false,
  onSelect,
}: StoryCardProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = () => {
    // Always navigate to detail page on click
    router.push(`/stories/${story.id}`);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(story.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/stories/${story.id}`, { method: "DELETE" });
      setShowDeleteModal(false);
      onDelete?.(story.id);
    } catch (error) {
      console.error("Error deleting story:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isList = view === "list";

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          "bg-surface border border-border rounded-xl p-4 cursor-pointer",
          "hover:border-accent/50 transition-all duration-200",
          "group relative",
          isList && "flex gap-4",
          selected && "border-accent bg-accent/5",
          selectable && "pl-10"
        )}
      >
        {/* Selection Checkbox */}
        {selectable && (
          <div
            onClick={handleCheckboxClick}
            className={cn(
              "absolute top-3 left-3 z-10",
              isList && "relative top-0 left-0 mr-2"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                selected
                  ? "bg-accent border-accent"
                  : "border-border bg-surface hover:border-accent/50"
              )}
            >
              {selected && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={isList ? "flex-1 min-w-0" : ""}>
          {/* Title */}
          <h3
            className={cn(
              "font-semibold text-text-primary group-hover:text-accent transition-colors",
              isList ? "text-base" : "text-sm mb-3"
            )}
          >
            {truncate(story.title, 80)}
          </h3>

          {/* Subreddit Badge */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="default" className="bg-accent/10 text-accent">
              r/{story.subreddit}
            </Badge>
            {story.status && (
              <Badge variant={statusVariants[story.status]}>
                {statusLabels[story.status]}
              </Badge>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <div className="flex items-center gap-1.5">
              <ArrowUp size={14} className="text-accent" />
              <span>{formatNumber(story.upvotes ?? story.score ?? 0)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle size={14} className="text-accent-secondary" />
              <span>{formatNumber(story.comment_count ?? story.num_comments ?? 0)}</span>
            </div>
            {story.viral_score !== undefined && story.viral_score !== null && (
              <Badge variant={getViralScoreVariant(story.viral_score)}>
                VS: {story.viral_score}
              </Badge>
            )}
          </div>

          {/* List View: Additional Info */}
          {isList && (
            <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
              <span>by {story.author}</span>
              <span>{formatRelativeTime(story.scraped_at ?? "")}</span>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDeleteClick}
          className={cn(
            "absolute opacity-0 group-hover:opacity-100 transition-opacity",
            "text-text-muted hover:text-danger p-2 rounded-lg",
            isList ? "relative" : "top-3 right-3",
            !isList && "bg-surface/90 backdrop-blur-sm"
          )}
          aria-label="Delete story"
        >
          <Trash2 size={16} />
        </button>

        {/* Grid View: Time */}
        {!isList && (
          <div className="text-xs text-text-muted mt-3">
            {formatRelativeTime(story.scraped_at ?? "")}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Story"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to delete this story? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={isDeleting}
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}