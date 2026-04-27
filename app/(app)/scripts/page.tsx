"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Package, ArrowRight, Clock, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { RetentionMeter, calculateRetentionScore, formatDuration } from "@/components/script/RetentionMeter";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { Story, YouTubeScript } from "@/types";

interface StoryWithScript extends Story {
  script?: YouTubeScript;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function ScriptsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stories, setStories] = useState<StoryWithScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPackageId, setGeneratingPackageId] = useState<string | null>(null);

  // Fetch scripted stories
  useEffect(() => {
    const fetchScripts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/stories?status=scripted,packaged,exported");
        const data = await response.json();

        if (data.success) {
          setStories(data.data || []);
        } else {
          setError(data.error || "Failed to load scripts");
        }
      } catch (err) {
        console.error("Error fetching scripts:", err);
        setError("Failed to load scripts");
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();
  }, []);

  // Handle generate package
  const handleGeneratePackage = async (storyId: string) => {
    setGeneratingPackageId(storyId);
    setError(null); // Clear any previous errors
    try {
      const response = await fetch(`/api/stories/${storyId}/package`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        // Update local state
        setStories(prev =>
          prev.map(s =>
            s.id === storyId
              ? { ...s, status: "packaged", youtube_package: data.data }
              : s
          )
        );
        toast("Package generated successfully!", "success");
        // Navigate to package page
        router.push(`/package?storyId=${storyId}`);
      } else {
        setError(data.error || "Failed to generate package");
        toast(data.error || "Failed to generate package", "error");
      }
    } catch (err) {
      console.error("Error generating package:", err);
      setError("Failed to generate package");
      toast("Failed to generate package", "error");
    } finally {
      setGeneratingPackageId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Video Scripts</h1>
          <p className="text-text-secondary mt-2">Transform stories into YouTube-ready scripts</p>
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
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-36" />
                </div>
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
          <h1 className="text-3xl font-bold text-text-primary">Video Scripts</h1>
          <p className="text-text-secondary mt-2">Transform stories into YouTube-ready scripts</p>
        </div>

        <Card className="border-danger/30 bg-danger/5">
          <div className="flex items-center gap-3 text-danger">
            <AlertCircle size={20} />
            <div>
              <p className="font-medium">Error loading scripts</p>
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
          <h1 className="text-3xl font-bold text-text-primary">Video Scripts</h1>
          <p className="text-text-secondary mt-2">Transform stories into YouTube-ready scripts</p>
        </div>

        <Card className="text-center py-12">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-surface-elevated rounded-full flex items-center justify-center">
              <FileText size={32} className="text-text-muted" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">No scripts yet</h3>
              <p className="text-text-secondary mt-1">
                Generate a script from a story to see it here.
              </p>
            </div>
            <Link href="/stories">
              <Button>
                Go to Stories
                <ArrowRight size={16} className="ml-2" />
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
          <h1 className="text-3xl font-bold text-text-primary">Video Scripts</h1>
          <p className="text-text-secondary mt-2">
            {stories.length} script{stories.length !== 1 ? "s" : ""} ready for editing
          </p>
        </div>
        <Link href="/stories">
          <Button variant="secondary">
            <FileText size={16} />
            <span className="ml-2">Find More Stories</span>
          </Button>
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <Card className="border-warning/30 bg-warning/5">
          <div className="flex items-center gap-3 text-warning">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {/* Scripts list */}
      <div className="space-y-4">
        {stories.map((story) => {
          const script = story.script as YouTubeScript | undefined;
          const wordCount = script?.word_count || 0;
          const estimatedDuration = script?.estimated_duration ||
            (wordCount > 0 ? Math.round(wordCount / 150 * 60) : 0);
          const retentionScore = script ? calculateRetentionScore(script) : 0;
          const isPackagedOrExported = story.status === "packaged" || story.status === "exported";
          const isGenerating = generatingPackageId === story.id;

          return (
            <Card key={story.id} hover>
              <div className="flex items-start justify-between gap-4">
                {/* Left side - Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-text-primary truncate">
                      {script?.title || story.title}
                    </h3>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant="default" className="bg-accent/10 text-accent">
                      r/{story.subreddit}
                    </Badge>
                    <Badge
                      variant={
                        story.status === "packaged" ? "success" :
                        story.status === "exported" ? "warning" : "info"
                      }
                    >
                      {story.status === "packaged" ? "Packaged" :
                       story.status === "exported" ? "Exported" : "Scripted"}
                    </Badge>
                    {retentionScore >= 70 && (
                      <Badge variant="success" className="text-xs">
                        High Retention
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <div className="flex items-center gap-1">
                      <FileText size={14} />
                      <span>{formatNumber(wordCount)} words</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatDuration(estimatedDuration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      <span>{formatNumber(story.comment_count ?? story.num_comments ?? 0)}</span>
                    </div>
                  </div>

                  {/* Hook preview */}
                  {script?.hook && (
                    <p className="mt-3 text-sm text-text-muted line-clamp-2">
                      <span className="text-accent font-medium">Hook:</span> {script.hook}
                    </p>
                  )}
                </div>

                {/* Right side - Actions & Meter */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <RetentionMeter score={retentionScore} size="md" />

                  <div className="flex flex-col gap-2">
                    <Link href={`/stories/${story.id}`}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <FileText size={14} />
                        <span className="ml-2">Edit Script</span>
                      </Button>
                    </Link>

                    <Button
                      variant={isPackagedOrExported ? "ghost" : "secondary"}
                      size="sm"
                      onClick={() => handleGeneratePackage(story.id)}
                      disabled={isPackagedOrExported || isGenerating}
                      loading={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span className="ml-2">Generating...</span>
                        </>
                      ) : (
                        <>
                          <Package size={14} />
                          <span className="ml-2">
                            {isPackagedOrExported ? "View Package" : "Generate Package"}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination placeholder */}
      {stories.length >= 10 && (
        <div className="flex items-center justify-center pt-4">
          <p className="text-sm text-text-muted">
            Showing {stories.length} scripts
          </p>
        </div>
      )}
    </div>
  );
}