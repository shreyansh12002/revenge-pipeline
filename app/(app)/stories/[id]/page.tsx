"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, ArrowUp, MessageCircle, Calendar, Trash2, FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn, formatDate, truncate } from "@/lib/utils";
import { getRetentionRisk } from "@/lib/viral-score";
import type { Story, StoryStatus } from "@/types";

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

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

interface ScriptData {
  hook?: string;
  setup?: string;
  conflict?: string;
  escalation?: string;
  revenge?: string;
  outcome?: string;
  cta?: string;
}

interface PackageData {
  titles?: string[];
  thumbnail_text?: string;
  description?: string;
  tags?: string[];
  hashtags?: string[];
  voice_style?: {
    accent?: string;
    tone?: string;
    speed?: number;
    pauses?: boolean;
  };
}

export default function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
  const storyId = resolvedParams.id;

  // Fetch story data
  useEffect(() => {
    if (!storyId) return;

    const fetchStory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/stories/${storyId}`);
        const data = await response.json();

        if (data.success) {
          setStory(data.data);
        } else if (response.status === 404) {
          setNotFound(true);
        } else {
          toast("Failed to load story", "error");
        }
      } catch (error) {
        console.error("Error fetching story:", error);
        toast("Failed to load story", "error");
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId, toast]);

  // Handle delete
  const handleDelete = async () => {
    if (!storyId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/stories/${storyId}`, { method: "DELETE" });
      const data = await response.json();

      if (data.success) {
        toast("Story deleted successfully", "success");
        router.push("/stories");
      } else {
        toast("Failed to delete story", "error");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      toast("Failed to delete story", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Handle generate script
  const handleGenerateScript = async () => {
    if (!storyId) return;

    setIsGeneratingScript(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/script`, { method: "POST" });
      const data = await response.json();

      if (data.success) {
        toast("Script generated successfully", "success");
        // Refresh story data
        const storyRes = await fetch(`/api/stories/${storyId}`);
        const storyData = await storyRes.json();
        if (storyData.success) {
          setStory(storyData.data);
        }
      } else {
        toast(data.error || "Failed to generate script", "error");
      }
    } catch (error) {
      console.error("Error generating script:", error);
      toast("Failed to generate script", "error");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Handle generate package
  const handleGeneratePackage = async () => {
    if (!storyId) return;

    setIsGeneratingPackage(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/package`, { method: "POST" });
      const data = await response.json();

      if (data.success) {
        toast("Package generated successfully", "success");
        // Refresh story data
        const storyRes = await fetch(`/api/stories/${storyId}`);
        const storyData = await storyRes.json();
        if (storyData.success) {
          setStory(storyData.data);
        }
      } else {
        toast(data.error || "Failed to generate package", "error");
      }
    } catch (error) {
      console.error("Error generating package:", error);
      toast("Failed to generate package", "error");
    } finally {
      setIsGeneratingPackage(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="space-y-6 text-center py-12">
        <h2 className="text-2xl font-bold text-text-primary">Story not found</h2>
        <p className="text-text-secondary">The story you're looking for doesn't exist.</p>
        <Link href="/stories">
          <Button variant="secondary">Back to Stories</Button>
        </Link>
      </div>
    );
  }

  // No story yet
  if (!story) return null;

  const retentionRisk = getRetentionRisk(story);
  const script = story.script as ScriptData | undefined;
  const packageData = story.youtube_package as PackageData | undefined;

  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 text-danger text-sm">
          Failed to load story. Please try again.
        </div>
      )}

      {/* Back Button */}
      <Link
        href="/stories"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Stories
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{story.title}</h1>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <Badge variant="default" className="bg-accent/10 text-accent">
            r/{story.subreddit}
          </Badge>
          {story.status && (
            <Badge variant={statusVariants[story.status]}>
              {statusLabels[story.status]}
            </Badge>
          )}
          {story.viral_score !== undefined && story.viral_score !== null && (
            <Badge variant={getViralScoreVariant(story.viral_score)}>
              Viral Score: {story.viral_score}
            </Badge>
          )}
          <Badge
            variant={
              retentionRisk.level === "high"
                ? "danger"
                : retentionRisk.level === "medium"
                ? "warning"
                : "success"
            }
          >
            Retention: {retentionRisk.level}
          </Badge>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center gap-6 text-sm text-text-secondary flex-wrap">
        <span>by {story.author}</span>
        <div className="flex items-center gap-1.5">
          <ArrowUp size={14} className="text-accent" />
          <span>{formatNumber(story.upvotes ?? story.score ?? 0)} upvotes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageCircle size={14} className="text-accent-secondary" />
          <span>{formatNumber(story.comment_count ?? story.num_comments ?? 0)} comments</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span>Scraped {formatDate(story.scraped_at ?? "")}</span>
        </div>
      </div>

      {/* URL Link */}
      <div>
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
        >
          View on Reddit
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Viral Score Breakdown */}
      {story.viral_score !== undefined && story.viral_score !== null && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="font-semibold text-text-primary mb-3">Viral Score Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-text-muted">Upvotes</span>
              <p className="font-medium text-text-primary">30%</p>
            </div>
            <div>
              <span className="text-text-muted">Comments</span>
              <p className="font-medium text-text-primary">25%</p>
            </div>
            <div>
              <span className="text-text-muted">Length</span>
              <p className="font-medium text-text-primary">15%</p>
            </div>
            <div>
              <span className="text-text-muted">Keywords</span>
              <p className="font-medium text-text-primary">20%</p>
            </div>
            <div>
              <span className="text-text-muted">Title</span>
              <p className="font-medium text-text-primary">10%</p>
            </div>
          </div>
          {retentionRisk.reasons.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <span className="text-text-muted text-sm">Potential issues:</span>
              <ul className="mt-1 text-sm text-warning">
                {retentionRisk.reasons.map((reason, i) => (
                  <li key={i}>• {reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Story Body */}
      {story.body && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="font-semibold text-text-primary mb-3">Story Content</h3>
          <pre className="whitespace-pre-wrap text-text-secondary font-sans text-sm leading-relaxed">
            {story.body}
          </pre>
        </div>
      )}

      {/* Script Preview */}
      {script && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="font-semibold text-text-primary mb-4">Script Preview</h3>
          <div className="space-y-4">
            {script.hook && (
              <div>
                <h4 className="text-sm font-medium text-accent mb-1">Hook</h4>
                <p className="text-text-secondary text-sm">{script.hook}</p>
              </div>
            )}
            {script.setup && (
              <div>
                <h4 className="text-sm font-medium text-accent mb-1">Setup</h4>
                <p className="text-text-secondary text-sm">{script.setup}</p>
              </div>
            )}
            {script.conflict && (
              <div>
                <h4 className="text-sm font-medium text-accent mb-1">Conflict</h4>
                <p className="text-text-secondary text-sm">{script.conflict}</p>
              </div>
            )}
            {script.escalation && (
              <div>
                <h4 className="text-sm font-medium text-accent mb-1">Escalation</h4>
                <p className="text-text-secondary text-sm">{script.escalation}</p>
              </div>
            )}
            {script.revenge && (
              <div>
                <h4 className="text-sm font-medium text-accent mb-1">Revenge</h4>
                <p className="text-text-secondary text-sm">{script.revenge}</p>
              </div>
            )}
            {script.outcome && (
              <div>
                <h4 className="text-sm font-medium text-accent mb-1">Outcome</h4>
                <p className="text-text-secondary text-sm">{script.outcome}</p>
              </div>
            )}
            {script.cta && (
              <div>
                <h4 className="text-sm font-medium text-accent mb-1">CTA</h4>
                <p className="text-text-secondary text-sm">{script.cta}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Package Preview */}
      {packageData && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="font-semibold text-text-primary mb-4">YouTube Package</h3>
          <div className="space-y-4">
            {packageData.titles && packageData.titles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-accent mb-2">Title Options</h4>
                <ul className="space-y-1">
                  {packageData.titles.map((title, i) => (
                    <li key={i} className="text-text-secondary text-sm">• {title}</li>
                  ))}
                </ul>
              </div>
            )}
            {packageData.thumbnail_text && (
              <div>
                <h4 className="text-sm font-medium text-accent mb-1">Thumbnail Text</h4>
                <p className="text-text-secondary text-sm font-medium">{packageData.thumbnail_text}</p>
              </div>
            )}
            {packageData.description && (
              <div>
                <h4 className="text-sm font-medium text-accent mb-1">Description</h4>
                <p className="text-text-secondary text-sm">{packageData.description}</p>
              </div>
            )}
            {packageData.tags && packageData.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-accent mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {packageData.tags.map((tag, i) => (
                    <Badge key={i} variant="default">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="font-semibold text-text-primary mb-4">Actions</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleGenerateScript}
            loading={isGeneratingScript}
            disabled={isGeneratingScript}
            className="flex-1"
          >
            <FileText size={16} />
            {story.script ? "Regenerate Script" : "Generate Script"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleGeneratePackage}
            loading={isGeneratingPackage}
            disabled={isGeneratingScript || isGeneratingPackage || !story.script}
            className="flex-1"
          >
            <Package size={16} />
            {packageData ? "Regenerate Package" : "Generate Package"}
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
        {!story.script && (
          <p className="text-text-muted text-sm mt-3">
            Click "Generate Script" to create a YouTube script for this story.
          </p>
        )}
        {story.script && !packageData && (
          <p className="text-text-muted text-sm mt-3">
            Script generated! Click "Generate Package" to create YouTube metadata.
          </p>
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
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}