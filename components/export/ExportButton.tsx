"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileJson, FileText, FileType, ExternalLink, ChevronDown, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { exportToJSON, downloadJSON } from "@/lib/export/json";
import { exportToText, downloadText } from "@/lib/export/text";
import type { Story } from "@/types";

interface ExportButtonProps {
  story: Story;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

type ExportFormat = "json" | "text" | "pdf" | "gdocs";

export function ExportButton({
  story,
  variant = "secondary",
  size = "md",
  className = "",
}: ExportButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const filename = `${story.title.replace(/[^a-z0-9]/gi, "_").substring(0, 50)}`;

  async function handleExport(format: ExportFormat) {
    setLoading(format);

    try {
      if (format === "json") {
        const content = exportToJSON(story);
        downloadJSON(content, `${filename}.json`);
      } else if (format === "text") {
        const content = exportToText(story);
        downloadText(content, `${filename}.txt`);
      } else if (format === "pdf") {
        const { pdf } = await import("@react-pdf/renderer");
        const { ScriptPDF } = await import("@/lib/export/pdf");
        const blob = await pdf(<ScriptPDF story={story} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "gdocs") {
        const content = exportToText(story);
        await navigator.clipboard.writeText(content);
        toast("Copied! Paste into Google Docs.", "success");
      }
    } catch (err) {
      console.error("Export error:", err);
      toast(`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    } finally {
      setLoading(null);
      setIsOpen(false);
    }
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const variantClasses = {
    primary: "bg-accent hover:bg-accent/90 text-white",
    secondary: "bg-surface-elevated hover:bg-border text-text-primary border border-border",
    ghost: "hover:bg-surface-elevated text-text-secondary hover:text-text-primary",
  };

  const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors ${sizeClasses[size]} ${variantClasses[variant]}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Download size={iconSize} />
        <span>Export</span>
        <ChevronDown
          size={iconSize}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface-elevated border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs text-text-muted uppercase tracking-wide">Export Format</p>
          </div>

          <div className="py-1">
            <button
              onClick={() => handleExport("json")}
              disabled={loading === "json"}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
            >
              <FileJson size={16} className="text-amber-500" />
              <div className="text-left flex-1">
                <span className="block">JSON</span>
                <span className="text-xs text-text-muted">Complete data export</span>
              </div>
              {loading === "json" && (
                <span className="text-xs text-accent animate-pulse">Exporting...</span>
              )}
            </button>

            <button
              onClick={() => handleExport("text")}
              disabled={loading === "text"}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
            >
              <FileText size={16} className="text-blue-400" />
              <div className="text-left flex-1">
                <span className="block">Plain Text</span>
                <span className="text-xs text-text-muted">Formatted script text</span>
              </div>
              {loading === "text" && (
                <span className="text-xs text-accent animate-pulse">Exporting...</span>
              )}
            </button>

            <button
              onClick={() => handleExport("pdf")}
              disabled={loading === "pdf"}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
            >
              <FileType size={16} className="text-red-400" />
              <div className="text-left flex-1">
                <span className="block">PDF</span>
                <span className="text-xs text-text-muted">Print-ready document</span>
              </div>
              {loading === "pdf" && (
                <span className="text-xs text-accent animate-pulse">Exporting...</span>
              )}
            </button>

            <button
              onClick={() => handleExport("gdocs")}
              disabled={loading === "gdocs"}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
            >
              <ExternalLink size={16} className="text-green-400" />
              <div className="text-left flex-1">
                <span className="block">Copy for Google Docs</span>
                <span className="text-xs text-text-muted">Copies text to clipboard</span>
              </div>
              {loading === "gdocs" && (
                <span className="text-xs text-accent animate-pulse">Copying...</span>
              )}
            </button>
          </div>

          <div className="px-3 py-2 border-t border-border bg-surface/50">
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              <X size={12} />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
