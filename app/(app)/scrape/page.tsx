"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { CheckCircle, XCircle, Loader2, Plus, X } from "lucide-react";
import type { ScrapeConfig } from "@/types";

const DEFAULT_SUBREDDITS = [
  "ProRevenge",
  "NuclearRevenge",
  "MaliciousCompliance",
  "EntitledPeople",
  "AmITheAsshole",
  "TrueOffMyChest",
];

interface ScrapeStatus {
  status: "idle" | "running" | "completed" | "error";
  runId?: string;
  itemsCount?: number;
  error?: string;
}

interface CustomSubreddit {
  name: string;
  created_at: string;
}

function ScrapeForm({
  customSubreddits,
  onCustomSubredditsChange,
  onSubmit,
  loading,
}: {
  customSubreddits: CustomSubreddit[];
  onCustomSubredditsChange: (subreddits: CustomSubreddit[]) => void;
  onSubmit: (config: ScrapeConfig) => void;
  loading: boolean;
}) {
  const [sort, setSort] = useState<"hot" | "new" | "top">("top");
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year" | "all">("month");
  const [maxItems, setMaxItems] = useState(50);
  const [minUpvotes, setMinUpvotes] = useState(3000);
  const [minComments, setMinComments] = useState(200);
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>(DEFAULT_SUBREDDITS);
  const [customInput, setCustomInput] = useState("");

  const handleToggleSubreddit = (subreddit: string) => {
    setSelectedSubreddits((prev) =>
      prev.includes(subreddit)
        ? prev.filter((s) => s !== subreddit)
        : [...prev, subreddit]
    );
  };

  const handleAddCustomSubreddit = async () => {
    if (!customInput.trim()) return;

    try {
      const response = await fetch("/api/subreddits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customInput }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!customSubreddits.find((s) => s.name === data.subreddit.name)) {
          onCustomSubredditsChange([...customSubreddits, data.subreddit]);
        }
        setCustomInput("");
      }
    } catch (error) {
      console.error("Error adding custom subreddit:", error);
    }
  };

  const handleRemoveCustomSubreddit = async (name: string) => {
    try {
      const response = await fetch(`/api/subreddits?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onCustomSubredditsChange(customSubreddits.filter((s) => s.name !== name));
        setSelectedSubreddits((prev) => prev.filter((s) => s !== name));
      }
    } catch (error) {
      console.error("Error removing custom subreddit:", error);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      sort,
      time_range: timeRange,
      limit: maxItems,
      min_upvotes: minUpvotes,
      min_comments: minComments,
      subreddits: selectedSubreddits,
    });
  };

  return (
    <div className="space-y-8">
      {/* Sort Options */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Sort & Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Sort By"
            value={sort}
            onChange={(e) => setSort(e.target.value as "hot" | "new" | "top")}
            options={[
              { value: "top", label: "Top" },
              { value: "hot", label: "Hot" },
              { value: "new", label: "New" },
            ]}
          />
          <Select
            label="Time Range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "day" | "week" | "month" | "year" | "all")}
            options={[
              { value: "day", label: "Past 24 Hours" },
              { value: "week", label: "Past Week" },
              { value: "month", label: "Past Month" },
              { value: "year", label: "Past Year" },
              { value: "all", label: "All Time" },
            ]}
          />
        </div>
      </div>

      {/* Numeric Filters */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Max Items"
            type="number"
            value={maxItems}
            onChange={(e) => setMaxItems(Math.max(1, parseInt(e.target.value) || 50))}
            min={1}
            max={500}
            helper="Maximum posts to scrape"
          />
          <Input
            label="Min Upvotes"
            type="number"
            value={minUpvotes}
            onChange={(e) => setMinUpvotes(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            helper="Filter low-engagement posts"
          />
          <Input
            label="Min Comments"
            type="number"
            value={minComments}
            onChange={(e) => setMinComments(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            helper="Filter low-engagement posts"
          />
        </div>
      </div>

      {/* Subreddit Selection */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Subreddits</h3>

        {/* Default Subreddits */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {DEFAULT_SUBREDDITS.map((subreddit) => (
            <label
              key={subreddit}
              className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg cursor-pointer hover:border-accent/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedSubreddits.includes(subreddit)}
                onChange={() => handleToggleSubreddit(subreddit)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-text-primary text-sm">r/{subreddit}</span>
            </label>
          ))}

          {/* Custom Subreddits */}
          {customSubreddits.map((subreddit) => (
            <label
              key={subreddit.name}
              className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg cursor-pointer hover:border-accent/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedSubreddits.includes(subreddit.name)}
                onChange={() => handleToggleSubreddit(subreddit.name)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-text-primary text-sm">r/{subreddit.name}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveCustomSubreddit(subreddit.name);
                }}
                className="ml-auto text-text-muted hover:text-danger transition-colors"
              >
                <X size={14} />
              </button>
            </label>
          ))}
        </div>

        {/* Add Custom Subreddit */}
        <div className="flex gap-3">
          <Input
            placeholder="Enter subreddit name (e.g., pettyrevenge)"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCustomSubreddit()}
            className="flex-1"
          />
          <Button
            variant="secondary"
            onClick={handleAddCustomSubreddit}
            disabled={!customInput.trim()}
          >
            <Plus size={16} />
            Add
          </Button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={selectedSubreddits.length === 0}
          size="lg"
        >
          Run Scrape
        </Button>
      </div>
    </div>
  );
}

function ScrapeProgress({
  runId,
  onComplete,
  onError,
  onRetry,
}: {
  runId: string;
  onComplete: (count: number) => void;
  onError: (error: string) => void;
  onRetry: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"checking" | "scraping" | "processing" | "completed" | "error">("checking");
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/scrape/${runId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check status");
      }

      if (data.status === "running") {
        setStatus("scraping");
        setProgress(prev => Math.min(prev + 5, 90));
      } else if (data.status === "completed") {
        setStatus("completed");
        setProgress(100);
        onComplete(data.itemsCount);
      } else if (data.status === "error") {
        setStatus("error");
        setError(data.error);
        onError(data.error);
      }
    } catch (err) {
      setStatus("error");
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      onError(errorMessage);
    }
  }, [runId, onComplete, onError]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (status !== "completed" && status !== "error" && runId) {
        checkStatus();
      }
    }, 3000);

    // Initial check (only when runId is available)
    if (runId) {
      checkStatus();
    }

    return () => clearInterval(interval);
  }, [runId, status, checkStatus]);

  const statusMessages = {
    checking: "Connecting to scraper...",
    scraping: "Scraping Reddit posts...",
    processing: "Processing and saving stories...",
    completed: "Scrape complete!",
    error: "Scrape failed",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {status === "completed" ? (
          <CheckCircle className="text-accent-secondary" size={48} />
        ) : status === "error" ? (
          <XCircle className="text-danger" size={48} />
        ) : (
          <Loader2 className="text-accent animate-spin" size={48} />
        )}
        <div>
          <h3 className="text-xl font-semibold text-text-primary">
            {statusMessages[status]}
          </h3>
          <p className="text-text-secondary text-sm mt-1">
            {status === "scraping" && "Fetching posts from selected subreddits..."}
            {status === "processing" && "Transforming data and calculating viral scores..."}
            {status === "completed" && "All stories have been saved to the database."}
            {status === "error" && error}
          </p>
        </div>
      </div>

      <ProgressBar
        value={progress}
        indeterminate={status === "checking" || status === "scraping"}
        showValue
      />

      {status === "error" && (
        <div className="flex gap-3">
          <Button onClick={onRetry} variant="primary">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}


export default function ScrapePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [customSubreddits, setCustomSubreddits] = useState<CustomSubreddit[]>([]);
  const [scrapeStatus, setScrapeStatus] = useState<ScrapeStatus>({ status: "idle" });
  const [loading, setLoading] = useState(false);

  // Fetch custom subreddits on mount
  useEffect(() => {
    const fetchSubreddits = async () => {
      try {
        const response = await fetch("/api/subreddits");
        if (response.ok) {
          const data = await response.json();
          setCustomSubreddits(data.subreddits || []);
        }
      } catch (error) {
        console.error("Error fetching custom subreddits:", error);
      }
    };

    fetchSubreddits();
  }, []);

  const handleSubmit = async (config: ScrapeConfig) => {
    setLoading(true);
    setScrapeStatus({ status: "running" });

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subreddits: config.subreddits,
          sort: config.sort,
          time_range: config.time_range,
          max_items: config.limit,
          min_upvotes: config.min_upvotes,
          min_comments: config.min_comments,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start scrape");
      }

      setScrapeStatus({ status: "running", runId: data.runId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start scrape";
      setScrapeStatus({ status: "error", error: message });
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (count: number) => {
    setScrapeStatus({ status: "completed", itemsCount: count });
    toast(`Successfully scraped ${count} stories`, "success");
  };

  const handleError = (error: string) => {
    setScrapeStatus({ status: "error", error });
    toast(error, "error");
  };

  const handleRetry = () => {
    setScrapeStatus({ status: "idle" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Scrape Stories</h1>
        <p className="text-text-secondary mt-2">
          Fetch fresh stories from Reddit using Apify
        </p>
      </div>

      <Card>
        {scrapeStatus.status === "idle" ? (
          <ScrapeForm
            customSubreddits={customSubreddits}
            onCustomSubredditsChange={setCustomSubreddits}
            onSubmit={handleSubmit}
            loading={loading}
          />
        ) : (
          <ScrapeProgress
            runId={scrapeStatus.runId!}
            onComplete={handleComplete}
            onError={handleError}
            onRetry={handleRetry}
          />
        )}
      </Card>

      {/* Completion State */}
      {scrapeStatus.status === "completed" && (
        <Card className="bg-accent-secondary/5 border-accent-secondary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CheckCircle className="text-accent-secondary" size={32} />
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {scrapeStatus.itemsCount} Stories Scraped
                </h3>
                <p className="text-text-secondary text-sm">
                  Your stories are ready for review and processing.
                </p>
              </div>
            </div>
            <Button onClick={() => router.push("/stories")} variant="primary">
              View Stories
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
