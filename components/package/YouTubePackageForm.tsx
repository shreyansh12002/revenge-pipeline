"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { YouTubePackage } from "@/types";

interface YouTubePackageFormProps {
  storyId: string;
  youtubePackage: YouTubePackage;
  onUpdate?: (pkg: YouTubePackage) => void;
  onClose?: () => void;
}

export function YouTubePackageForm({
  storyId,
  youtubePackage,
  onUpdate,
  onClose,
}: YouTubePackageFormProps) {
  const { toast } = useToast();
  const [pkg, setPkg] = useState<YouTubePackage>(youtubePackage);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    setPkg(youtubePackage);
  }, [youtubePackage]);

  // Copy to clipboard
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast("Failed to copy to clipboard", "error");
    }
  };

  // Copy all content formatted
  const copyAllContent = async () => {
    const content = `# Selected Title
${pkg.titles[selectedTitleIndex]}

# Thumbnail Text
${pkg.thumbnail_text}

# Description
${pkg.description}

# Tags
${pkg.tags.join(", ")}

# Hashtags
${pkg.hashtags.join(" ")}

# All Title Options
${pkg.titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;

    await copyToClipboard(content, "all");
    toast("Copied all content to clipboard", "success");
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_package: pkg }),
      });
      const data = await response.json();

      if (data.success) {
        toast("Package saved successfully", "success");
        onUpdate?.(pkg);
        onClose?.();
      } else {
        toast(data.error || "Failed to save package", "error");
      }
    } catch {
      toast("Failed to save package", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Titles Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-text-secondary">
            Video Titles
          </label>
          <span className="text-xs text-text-muted">5 options</span>
        </div>
        <div className="space-y-2">
          {pkg.titles.map((title, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name="title"
                checked={selectedTitleIndex === index}
                onChange={() => setSelectedTitleIndex(index)}
                className="accent-accent"
              />
              <div className="relative flex-1">
                <Input
                  value={title}
                  onChange={(e) => {
                    const newTitles = [...pkg.titles];
                    newTitles[index] = e.target.value;
                    setPkg({ ...pkg, titles: newTitles });
                  }}
                  className={cn(
                    "pr-16",
                    title.length > 60 && "border-warning"
                  )}
                />
                <span
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 text-xs",
                    title.length > 60 ? "text-warning" : "text-text-muted"
                  )}
                >
                  {title.length}/60
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(title, `title-${index}`)}
              >
                {copiedField === `title-${index}` ? (
                  <Check size={14} className="text-accent-secondary" />
                ) : (
                  <Copy size={14} />
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnail Text */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-text-secondary">
            Thumbnail Text
          </label>
          <span className="text-xs text-text-muted">Max 6 words</span>
        </div>
        <div className="relative">
          <Input
            value={pkg.thumbnail_text}
            onChange={(e) => setPkg({ ...pkg, thumbnail_text: e.target.value })}
            className={cn(
              "text-lg font-bold pr-16",
              pkg.thumbnail_text.split(" ").length > 6 && "border-warning"
            )}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => copyToClipboard(pkg.thumbnail_text, "thumbnail")}
          >
            {copiedField === "thumbnail" ? (
              <Check size={14} className="text-accent-secondary" />
            ) : (
              <Copy size={14} />
            )}
          </Button>
        </div>
        {/* Preview */}
        <div className="bg-surface-elevated border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-text-primary uppercase tracking-wide">
            {pkg.thumbnail_text || "Thumbnail Preview"}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-text-secondary">
            Description
          </label>
          <span className="text-xs text-text-muted">
            {pkg.description.length} chars
          </span>
        </div>
        <div className="relative">
          <textarea
            value={pkg.description}
            onChange={(e) => setPkg({ ...pkg, description: e.target.value })}
            rows={6}
            className={cn(
              "w-full px-4 py-2.5 bg-surface border border-border rounded-lg",
              "text-text-primary placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
              "resize-none transition-colors"
            )}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={() => copyToClipboard(pkg.description, "description")}
          >
            {copiedField === "description" ? (
              <Check size={14} className="text-accent-secondary" />
            ) : (
              <Copy size={14} />
            )}
          </Button>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-text-secondary">
            Tags
          </label>
          <span
            className={cn(
              "text-xs",
              pkg.tags.length < 15 || pkg.tags.length > 25
                ? "text-warning"
                : "text-text-muted"
            )}
          >
            {pkg.tags.length} tags (15-25 recommended)
          </span>
        </div>
        <TagInput
          value={pkg.tags}
          onChange={(tags) => setPkg({ ...pkg, tags })}
          placeholder="Add a tag and press Enter..."
        />
      </div>

      {/* Hashtags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-text-secondary">
            Hashtags
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {pkg.hashtags.map((hashtag, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-accent/10 text-accent text-sm rounded-md"
            >
              {hashtag}
            </span>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            copyToClipboard(pkg.hashtags.join(" "), "hashtags")
          }
        >
          <Copy size={14} className="mr-2" />
          Copy Hashtags
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="secondary" onClick={copyAllContent}>
          <Copy size={14} />
          <span className="ml-2">Copy All</span>
        </Button>
        <div className="flex items-center gap-3">
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span className="ml-2">Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
