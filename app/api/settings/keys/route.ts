import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { apifyToken, anthropicKey } = await request.json();
    const supabase = createAdminClient();

    // Save Apify token if provided
    if (apifyToken !== undefined) {
      const { error: apifyError } = await supabase
        .from("app_config")
        .upsert({ key: "apify_token", value: apifyToken }, { onConflict: "key" });

      if (apifyError) {
        console.error("Error saving Apify token:", apifyError);
        return NextResponse.json(
          { success: false, error: "Failed to save Apify token" },
          { status: 500 }
        );
      }
    }

    // Save Anthropic key if provided
    if (anthropicKey !== undefined) {
      const { error: anthropicError } = await supabase
        .from("app_config")
        .upsert({ key: "anthropic_key", value: anthropicKey }, { onConflict: "key" });

      if (anthropicError) {
        console.error("Error saving Anthropic key:", anthropicError);
        return NextResponse.json(
          { success: false, error: "Failed to save Anthropic key" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const supabase = createAdminClient();

    // Get both API keys
    const { data: apifyData } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "apify_token")
      .single();

    const { data: anthropicData } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "anthropic_key")
      .single();

    return NextResponse.json({
      success: true,
      apifyToken: apifyData?.value || null,
      anthropicKey: anthropicData?.value || null,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}