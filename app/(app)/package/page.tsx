"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, FileText, Edit2, Tag, Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { YouTubePackageForm } from "@/components/package/YouTubePackageForm";
import { ExportButton } from "@/components/export/ExportButton";
import { cn } from "@/lib/utils";
import type { Story, YouTubePackage } from "@/types";

interface StoryWithPackage extends Story {
  youtube_package: YouTubePackage;
}

export default function PackagePage() {
  const [stories, setStories] = useState<StoryWithPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<StoryWithPackage | null>(null);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);

  // Fetch packaged stories
  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch stories with youtube_package (status: packaged or exported)
        const response = await fetch("/api/stories?status=packaged,exported");
        const data = await response.json();

        if (data.success) {
          // Filter to only stories with youtube_package
          const packagedStories = (data.data || []).filter(
            (story: Story) => story.youtube_package
          );
          setStories(packagedStories);
        } else {
          setError(data.error || "Failed to load packages");
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError("Failed to load packages");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Reset selectedTitleIndex when opening a different story's modal
  useEffect(() => {
    if (editingStory) {
      setSelectedTitleIndex(0);
    }
  }, [editingStory]);

  // Handle package update
  const handlePackageUpdate = (storyId: string, updatedPackage: YouTubePackage) => {
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? { ...s, youtube_package: updatedPackage }
          : s
      )
    );
    setEditingStory(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">YouTube Packages</h1>
          <p className="text-text-secondary mt-2">Manage your YouTube content packages</p>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">YouTube Packages</h1>
          <p className="text-text-secondary mt-2">Manage your YouTube content packages</p>
        </div>

        <Card className="border-danger/30 bg-danger/5">
          <div className="flex items-center gap-3 text-danger">
            <AlertCircle size={20} />
            <div>
              <p className="font-medium">Error loading packages</p>
              <p className="text-sm text-danger/80">{error}</p>
            </div>
          </div>
        </Card>

        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (stories.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">YouTube Packages</h1>
          <p className="text-text-secondary mt-2">Manage your YouTube content packages</p>
        </div>

        <Card className="text-center py-12">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-surface-elevated rounded-full flex items-center justify-center">
              <Package size={32} className="text-text-muted" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">No packages yet</h3>
              <p className="text-text-secondary mt-1">
                Generate a package from a scripted story.
              </p>
            </div>
            <Link href="/scripts">
              <Button>
                Go to Scripts
                <FileText size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">YouTube Packages</h1>
          <p className="text-text-secondary mt-2">
            {stories.length} package{stories.length !== 1 ? "s" : ""} ready
          </p>
        </div>
        <Link href="/scripts">
          <Button variant="secondary">
            <Package size={16} />
            <span className="ml-2">Find More Stories</span>
          </Button>
        </Link>
      </div>

      {/* Packages list */}
      <div className="space-y-4">
        {stories.map((story) => {
          const pkg = story.youtube_package;
          const selectedTitle = pkg?.titles?.[selectedTitleIndex] || pkg?.titles?.[0] || "Untitled";

          return (
            <Card key={story.id} hover>
              <div className="flex items-start justify-between gap-4">
                {/* Left side - Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-text-primary truncate">
                      {pkg?.titles?.[0] || story.title}
                    </h3>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant="default" className="bg-accent/10 text-accent">
                      r/{story.subreddit}
                    </Badge>
                    <Badge
                      variant={story.status === "exported" ? "warning" : "success"}
                    >
                      {story.status === "exported" ? "Exported" : "Packaged"}
                    </Badge>
                  </div>

                  {/* Selected title preview */}
                  <div className="bg-surface-elevated border border-border rounded-lg p-3 mb-3">
                    <p className="text-xs text-text-muted mb-1">Selected Title:</p>
                    <p className="text-text-primary font-medium">{selectedTitle}</p>
                  </div>

                  {/* Thumbnail text preview */}
                  {pkg?.thumbnail_text && (
                    <div className="bg-surface-elevated border border-border rounded-lg p-3 mb-3">
                      <p className="text-xs text-text-muted mb-1">Thumbnail:</p>
                      <p className="text-xl font-bold text-text-primary uppercase tracking-wide">
                        {pkg.thumbnail_text}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <div className="flex items-center gap-1">
                      <Tag size={14} />
                      <span>{pkg?.tags?.length || 0} tags</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText size={14} />
                      <span>{pkg?.description?.length || 0} chars</span>
                    </div>
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/stories/${story.id}`}>
                    <Button variant="ghost" size="sm">
                      <FileText size={14} />
                      <span className="ml-2">View Script</span>
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingStory(story)}
                  >
                    <Edit2 size={14} />
                    <span className="ml-2">Edit Package</span>
                  </Button>
                  <ExportButton story={story} size="sm" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingStory}
        onClose={() => setEditingStory(null)}
        title="Edit YouTube Package"
        className="max-w-2xl"
      >
        {editingStory && (
          <div className="space-y-4">
            {/* Story title */}
            <div className="pb-4 border-b border-border">
              <p className="text-xs text-text-muted mb-1">Editing package for:</p>
              <p className="text-text-primary font-medium">{editingStory.title}</p>
            </div>

            {/* Title selector */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">
                Select Primary Title:
              </p>
              <div className="flex flex-wrap gap-2">
                {editingStory.youtube_package.titles.map((title, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTitleIndex(index)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm transition-colors",
                      selectedTitleIndex === index
                        ? "bg-accent text-white"
                        : "bg-surface-elevated text-text-secondary hover:bg-border"
                    )}
                  >
                    Option {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Package form */}
            <YouTubePackageForm
              storyId={editingStory.id}
              youtubePackage={editingStory.youtube_package}
              onUpdate={(pkg) => handlePackageUpdate(editingStory.id, pkg)}
              onClose={() => setEditingStory(null)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
