"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RetentionMeterProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { size: 60, strokeWidth: 4, fontSize: "text-sm" },
  md: { size: 80, strokeWidth: 5, fontSize: "text-lg" },
  lg: { size: 120, strokeWidth: 6, fontSize: "text-2xl" },
};

function getLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Okay";
  return "Poor";
}

function getColor(score: number): string {
  if (score >= 70) return "#22c55e"; // green-500
  if (score >= 40) return "#eab308"; // yellow-500
  return "#ef4444"; // red-500
}

export function RetentionMeter({
  score,
  size = "md",
  showLabel = true,
  className,
}: RetentionMeterProps) {
  const config = sizeConfig[size];
  const clampedScore = Math.min(100, Math.max(0, score));
  const color = getColor(clampedScore);
  const label = getLabel(clampedScore);

  // SVG circle calculations
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (clampedScore / 100) * circumference;
  const strokeDashoffset = circumference - progress;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg
          width={config.size}
          height={config.size}
          viewBox={`0 0 ${config.size} ${config.size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-border"
          />
          {/* Progress circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 0.5s ease",
            }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold text-text-primary", config.fontSize)}>
            {Math.round(clampedScore)}
          </span>
        </div>
      </div>
      {showLabel && (
        <span
          className={cn("text-xs font-medium", size === "lg" && "text-sm")}
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Calculate retention score based on script content
 */
export function calculateRetentionScore(script: {
  hook?: string;
  setup?: string;
  conflict?: string;
  escalation?: string;
  revenge?: string;
  outcome?: string;
  cta?: string;
  word_count?: number;
}): number {
  let score = 50; // Base score

  // Check hook (critical for retention)
  if (script.hook && script.hook.length > 20) score += 10;

  // Check all sections have content
  const sections = [script.setup, script.conflict, script.escalation, script.revenge, script.outcome];
  const filledSections = sections.filter(s => s && s.length > 50).length;
  score += filledSections * 5;

  // Word count optimization (900-1500 words is ideal)
  const wordCount = script.word_count || 0;
  if (wordCount >= 900 && wordCount <= 1500) score += 15;
  else if (wordCount >= 600 && wordCount <= 1800) score += 10;
  else if (wordCount > 0) score += 5;

  // Check for CTA
  if (script.cta && script.cta.length > 20) score += 5;

  return Math.min(100, Math.max(0, score));
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}