import { createAdminClient } from "@/lib/supabase/server";
import { validateContent } from "@/lib/claude";
import { NextRequest, NextResponse } from "next/server";
import type { YouTubeScript, YouTubePackage } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { script, youtube_package } = body as {
      script: YouTubeScript;
      youtube_package: YouTubePackage;
    };

    if (!script) {
      return NextResponse.json({ error: "Script is required" }, { status: 400 });
    }

    // Run validation
    const validation = validateContent(script, youtube_package);

    // Determine overall quality score
    const avg_title_score = validation.title_scores.length > 0
      ? validation.title_scores.reduce((a, b) => a + b, 0) / validation.title_scores.length
      : 50;

    const overall_score = Math.round(
      (validation.hook_score * 0.4) + (avg_title_score * 0.4) + (validation.tag_count_ok ? 20 : 0)
    );

    return NextResponse.json({
      success: true,
      data: {
        ...validation,
        overall_score,
        recommendations: generateRecommendations(validation),
      },
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}

function generateRecommendations(validation: {
  hook_score: number;
  title_scores: number[];
  tag_count_ok: boolean;
  issues: string[];
}): string[] {
  const recommendations: string[] = [];

  if (validation.hook_score < 70) {
    recommendations.push("Improve hook: Start with urgency + mystery. Avoid greetings like 'Hey' or 'Welcome back'. Use '...' or 'BUT' for tension.");
  }

  const weak_titles = validation.title_scores.filter(s => s < 70);
  if (weak_titles.length > 0) {
    recommendations.push(`Improve ${weak_titles.length} title(s): Add personal words (I/My/They), power words (destroyed/karma/revenge), and tension markers (.../BUT).`);
  }

  if (!validation.tag_count_ok) {
    recommendations.push("Tags: Include 15-25 tags. Mix primary keywords (revenge, karma) with long-tail variations.");
  }

  if (validation.issues.length === 0 && validation.hook_score >= 80) {
    recommendations.push("Content looks great! High retention potential.");
  }

  return recommendations;
}