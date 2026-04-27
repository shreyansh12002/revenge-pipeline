"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RetentionMeter, calculateRetentionScore, formatDuration } from "./RetentionMeter";
import { cn, copyToClipboard } from "@/lib/utils";

interface ScriptSection {
  key: string;
  label: string;
  timestamp: string;
  description: string;
}

const SCRIPT_SECTIONS: ScriptSection[] = [
  { key: "hook", label: "HOOK", timestamp: "0:00-0:07", description: "Opening hook - create immediate curiosity" },
  { key: "setup", label: "SETUP", timestamp: "0:07-0:40", description: "Who + context" },
  { key: "conflict", label: "CONFLICT", timestamp: "0:40-2:00", description: "Introduce antagonist and unfair treatment" },
  { key: "escalation", label: "ESCALATION", timestamp: "2:00-4:30", description: "Multiple incidents, increasing stakes" },
  { key: "revenge", label: "REVENGE", timestamp: "4:30-7:30", description: "Smart execution, step-by-step payoff" },
  { key: "outcome", label: "OUTCOME", timestamp: "7:30-9:00", description: "Consequences and emotional closure" },
  { key: "cta", label: "CTA", timestamp: "9:00-10:00", description: "Reinforce satisfaction and twist" },
];

interface ScriptData {
  hook?: string;
  setup?: string;
  conflict?: string;
  escalation?: string;
  revenge?: string;
  outcome?: string;
  cta?: string;
  word_count?: number;
  estimated_duration?: number;
  title?: string;
}

interface ScriptEditorProps {
  storyId: string;
  script: ScriptData;
  onUpdate?: (key: string, content: string) => void;
  onSave?: (script: ScriptData) => Promise<void>;
}

export function ScriptEditor({ storyId, script, onUpdate, onSave }: ScriptEditorProps) {
  const [localScript, setLocalScript] = useState(script);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => {
    setLocalScript(script);
  }, [script]);

  const handleSectionChange = useCallback((key: string, value: string) => {
    setLocalScript(prev => ({ ...prev, [key]: value }));
    onUpdate?.(key, value);
  }, [onUpdate]);

  const copyFullScript = async () => {
    const fullScript = SCRIPT_SECTIONS.map(section => {
      const content = localScript[section.key as keyof typeof localScript] || "";
      return `[${section.label}] ${section.timestamp}\n${content}`;
    }).join("\n\n");

    const success = await copyToClipboard(fullScript);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(localScript);
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = typeof localScript.word_count === 'number' && localScript.word_count > 0
    ? localScript.word_count
    : SCRIPT_SECTIONS.reduce((acc, section) => {
      const content = localScript[section.key as keyof ScriptData] || "";
      if (typeof content !== 'string') return acc;
      return acc + content.trim().split(/\s+/).filter(Boolean).length;
    }, 0);

  const estimatedDuration = localScript.estimated_duration ||
    Math.round(wordCount / 150 * 60);

  const retentionScore = calculateRetentionScore(localScript);

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {localScript.title || "Video Script"}
            </h3>
            <p className="text-sm text-text-secondary">
              {SCRIPT_SECTIONS.length} sections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-text-muted">Words:</span>
              <span className="ml-1 font-medium text-text-primary">
                {new Intl.NumberFormat().format(wordCount)}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Duration:</span>
              <span className="ml-1 font-medium text-text-primary">
                {formatDuration(estimatedDuration)}
              </span>
            </div>
          </div>

          {/* Retention Meter */}
          <RetentionMeter score={retentionScore} size="md" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyFullScript}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="ml-1">{copied ? "Copied!" : "Copy Script"}</span>
            </Button>
            {onSave && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                loading={isSaving}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {SCRIPT_SECTIONS.map((section) => {
          const content = localScript[section.key as keyof ScriptData] || "";
          const sectionWordCount = typeof content === 'string'
            ? content.trim().split(/\s+/).filter(Boolean).length
            : 0;

          return (
            <Card key={section.key} className="relative overflow-hidden">
              {/* Section Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-text-primary">
                    {section.label}
                  </h4>
                  <Badge variant="default" className="bg-surface-elevated text-text-secondary">
                    {section.timestamp}
                  </Badge>
                </div>
                <span className="text-xs text-text-muted">
                  {sectionWordCount} words
                </span>
              </div>

              {/* Section Description */}
              <p className="text-xs text-text-muted mb-3">
                {section.description}
              </p>

              {/* Textarea */}
              <textarea
                value={content}
                onChange={(e) => handleSectionChange(section.key, e.target.value)}
                placeholder={`Enter ${section.label.toLowerCase()} content...`}
                className={cn(
                  "w-full min-h-[120px] p-3 bg-surface-elevated border border-border rounded-lg",
                  "text-text-primary text-sm leading-relaxed",
                  "placeholder:text-text-muted",
                  "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
                  "resize-y transition-colors"
                )}
                onFocus={() => setEditingSection(section.key)}
                onBlur={() => setEditingSection(null)}
              />

              {/* Edit indicator */}
              {editingSection === section.key && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs text-accent">Editing...</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-sm text-text-muted">
          Target: 900-1500 words, 5-10 minute video
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyFullScript}
          >
            <Copy size={14} />
            <span className="ml-1">Copy Full Script</span>
          </Button>
          {onSave && (
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isSaving}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Script preview component for read-only display
 */
interface ScriptPreviewProps {
  script: ScriptData;
  className?: string;
}

export function ScriptPreview({ script, className }: ScriptPreviewProps) {
  const wordCount = script.word_count || 0;
  const estimatedDuration = script.estimated_duration ||
    Math.round(wordCount / 150 * 60);
  const retentionScore = calculateRetentionScore(script);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">
          {script.title || "Script Preview"}
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-text-secondary">
            {new Intl.NumberFormat().format(wordCount)} words
          </div>
          <div className="text-sm text-text-secondary">
            {formatDuration(estimatedDuration)}
          </div>
          <RetentionMeter score={retentionScore} size="sm" />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {SCRIPT_SECTIONS.map((section) => {
          const content = script[section.key as keyof typeof script] || "";
          if (!content) return null;

          return (
            <div key={section.key} className="p-3 bg-surface rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="info" className="text-xs">
                  {section.label}
                </Badge>
                <span className="text-xs text-text-muted">
                  {section.timestamp}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}