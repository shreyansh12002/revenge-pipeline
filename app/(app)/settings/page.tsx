"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, Key, Trash2, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

function maskApiKey(key: string | null): string {
  if (!key || key.length < 8) return "Not configured";
  return "••••••••" + key.slice(-4);
}

export default function SettingsPage() {
  const { toast } = useToast();

  // API Keys section
  const [apifyToken, setApifyToken] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [currentApifyMasked, setCurrentApifyMasked] = useState<string | null>(null);
  const [currentAnthropicMasked, setCurrentAnthropicMasked] = useState<string | null>(null);
  const [showApifyToken, setShowApifyToken] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [savingKeys, setSavingKeys] = useState(false);

  // Password section
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Danger zone
  const [showClearModal, setShowClearModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Subreddits section
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [loadingSubreddits, setLoadingSubreddits] = useState(true);
  const [newSubreddit, setNewSubreddit] = useState("");
  const [addingSubreddit, setAddingSubreddit] = useState(false);
  const [deletingSubreddit, setDeletingSubreddit] = useState<string | null>(null);

  // All available subreddits (combined defaults + custom)
  const defaultSubreddits = [
    "ProRevenge",
    "NuclearRevenge",
    "MaliciousCompliance",
    "EntitledPeople",
    "AmITheAsshole",
    "TrueOffMyChest",
  ];

  // Combined list of all subreddits
  const allSubreddits = [...defaultSubreddits, ...subreddits.filter(s => !defaultSubreddits.includes(s))];

  // Load subreddits on mount
  useEffect(() => {
    fetchSubreddits();
  }, []);

  const fetchSubreddits = async () => {
    setLoadingSubreddits(true);
    try {
      const res = await fetch("/api/subreddits");
      const data = await res.json();
      if (data.subreddits) {
        // Extract just the names
        const names = data.subreddits.map((s: { name: string }) => s.name);
        setSubreddits(names);
      }
    } catch (error) {
      console.error("Error fetching subreddits:", error);
    } finally {
      setLoadingSubreddits(false);
    }
  };

  const handleAddSubreddit = async () => {
    if (!newSubreddit.trim()) return;

    setAddingSubreddit(true);
    try {
      const res = await fetch("/api/subreddits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubreddit }),
      });
      const data = await res.json();

      if (data.subreddit || data.error === "Subreddit already exists") {
        toast("Subreddit added", "success");
        setNewSubreddit("");
        fetchSubreddits();
      } else {
        toast(data.error || "Failed to add subreddit", "error");
      }
    } catch (error) {
      toast("Failed to add subreddit", "error");
    } finally {
      setAddingSubreddit(false);
    }
  };

  const handleDeleteSubreddit = async (name: string) => {
    setDeletingSubreddit(name);
    try {
      // First try to delete from custom_subreddits table
      const res = await fetch(`/api/subreddits?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast("Subreddit removed", "success");
        setSubreddits(prev => prev.filter(s => s !== name));
      } else if (data.error === "Not found in custom subreddits") {
        // If not in custom table, it's a default - just remove from display
        // The default subreddits are hardcoded so we can't actually delete them
        // But we can hide them from the list for this user
        toast("Subreddit removed from list", "success");
        setSubreddits(prev => prev.filter(s => s !== name));
      } else {
        toast(data.error || "Failed to delete subreddit", "error");
      }
    } catch (error) {
      toast("Failed to delete subreddit", "error");
    } finally {
      setDeletingSubreddit(null);
    }
  };

  const isDefault = (name: string) => defaultSubreddits.includes(name);
  const isCustom = (name: string) => !isDefault(name);

  // Load current API key status on mount
  useEffect(() => {
    fetch("/api/settings/keys")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCurrentApifyMasked(data.apifyToken);
          setCurrentAnthropicMasked(data.anthropicKey);
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveApiKeys = async () => {
    setSavingKeys(true);
    try {
      const res = await fetch("/api/settings/keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apifyToken: apifyToken || undefined,
          anthropicKey: anthropicKey || undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast("API keys saved successfully", "success");
        setApifyToken("");
        setAnthropicKey("");
        // Refresh masked values
        const refreshRes = await fetch("/api/settings/keys");
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setCurrentApifyMasked(refreshData.apifyToken);
          setCurrentAnthropicMasked(refreshData.anthropicKey);
        }
      } else {
        toast(data.error || "Failed to save API keys", "error");
      }
    } catch (error) {
      toast("Failed to save API keys", "error");
    } finally {
      setSavingKeys(false);
    }
  };

  const handleSavePassword = async () => {
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        toast("Password updated successfully", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast(data.error || "Failed to update password", "error");
      }
    } catch (error) {
      toast("Failed to update password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleClearStories = async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/settings/stories", {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast("All stories cleared successfully", "success");
        setShowClearModal(false);
      } else {
        toast(data.error || "Failed to clear stories", "error");
      }
    } catch (error) {
      toast("Failed to clear stories", "error");
    } finally {
      setClearing(false);
    }
  };

  const handleResetSettings = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/settings/reset", {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast("All data reset successfully", "success");
        setShowResetModal(false);
        setCurrentApifyMasked(null);
        setCurrentAnthropicMasked(null);
      } else {
        toast(data.error || "Failed to reset settings", "error");
      }
    } catch (error) {
      toast("Failed to reset settings", "error");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-2">Configure your RevengeHub preferences</p>
      </div>

      {/* API Configuration Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Key size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">API Configuration</h2>
            <p className="text-sm text-text-muted">Manage your external API keys</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-text-secondary">Apify Token</label>
              <span className="text-xs text-text-muted">
                {currentApifyMasked ? maskApiKey(currentApifyMasked) : "Not configured"}
              </span>
            </div>
            <div className="relative">
              <input
                type={showApifyToken ? "text" : "password"}
                value={apifyToken}
                onChange={(e) => setApifyToken(e.target.value)}
                placeholder="Enter new Apify token"
                className={cn(
                  "w-full px-4 py-2.5 pr-10 bg-surface border border-border rounded-lg",
                  "text-text-primary placeholder:text-text-muted",
                  "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                )}
              />
              <button
                type="button"
                onClick={() => setShowApifyToken(!showApifyToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showApifyToken ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-1.5">Get from apify.com/account</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-text-secondary">Anthropic Key</label>
              <span className="text-xs text-text-muted">
                {currentAnthropicMasked ? maskApiKey(currentAnthropicMasked) : "Not configured"}
              </span>
            </div>
            <div className="relative">
              <input
                type={showAnthropicKey ? "text" : "password"}
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="Enter new Anthropic key"
                className={cn(
                  "w-full px-4 py-2.5 pr-10 bg-surface border border-border rounded-lg",
                  "text-text-primary placeholder:text-text-muted",
                  "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                )}
              />
              <button
                type="button"
                onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showAnthropicKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-1.5">Get from console.anthropic.com</p>
          </div>

          <Button
            onClick={handleSaveApiKeys}
            loading={savingKeys}
            disabled={!apifyToken && !anthropicKey}
          >
            Save API Keys
          </Button>
        </div>
      </Card>

      {/* Change Password Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent-secondary/10 rounded-lg">
            <Shield size={20} className="text-accent-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Change Password</h2>
            <p className="text-sm text-text-muted">Update your app password</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={cn(
                  "w-full px-4 py-2.5 pr-10 bg-surface border border-border rounded-lg",
                  "text-text-primary placeholder:text-text-muted",
                  "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                )}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={cn(
                  "w-full px-4 py-2.5 pr-10 bg-surface border border-border rounded-lg",
                  "text-text-primary placeholder:text-text-muted",
                  "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                )}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(
                "w-full px-4 py-2.5 bg-surface border border-border rounded-lg",
                "text-text-primary placeholder:text-text-muted",
                "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              )}
            />
          </div>

          {passwordError && (
            <p className="text-sm text-danger">{passwordError}</p>
          )}

          <Button
            onClick={handleSavePassword}
            loading={savingPassword}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Update Password
          </Button>
        </div>
      </Card>

      {/* Subreddits Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Key size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Subreddits</h2>
            <p className="text-sm text-text-muted">Manage which subreddits to scrape</p>
          </div>
        </div>

        {/* All subreddits (defaults + custom) */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-text-secondary mb-3">Active Subreddits</h3>
          {loadingSubreddits ? (
            <div className="flex items-center gap-2 text-text-muted">
              <Loader2 size={16} className="animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allSubreddits.map((sub) => (
                <span
                  key={sub}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
                    isDefault(sub)
                      ? "bg-surface-elevated border border-border text-text-secondary"
                      : "bg-accent/10 border border-accent/20 text-accent"
                  )}
                >
                  r/{sub}
                  <button
                    onClick={() => handleDeleteSubreddit(sub)}
                    disabled={deletingSubreddit === sub}
                    className={cn(
                      "ml-1 hover:text-danger disabled:opacity-50 transition-colors",
                      isDefault(sub) && "hover:text-danger"
                    )}
                    title={isDefault(sub) ? "Remove from list" : "Delete custom subreddit"}
                  >
                    {deletingSubreddit === sub ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <X size={12} />
                    )}
                  </button>
                </span>
              ))}
              {allSubreddits.length === 0 && (
                <span className="text-sm text-text-muted italic">No subreddits configured</span>
              )}
            </div>
          )}
        </div>

        {/* Add new subreddit */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newSubreddit}
            onChange={(e) => setNewSubreddit(e.target.value)}
            placeholder="subreddit name (e.g. 'PettyRevenge')"
            className={cn(
              "flex-1 px-4 py-2 bg-surface border border-border rounded-lg",
              "text-text-primary placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            )}
            onKeyDown={(e) => e.key === "Enter" && handleAddSubreddit()}
          />
          <Button
            onClick={handleAddSubreddit}
            loading={addingSubreddit}
            disabled={!newSubreddit.trim()}
          >
            <Plus size={16} />
            <span className="ml-2">Add</span>
          </Button>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Click the X on any subreddit to remove it from the scrape list.
        </p>
      </Card>

      {/* Danger Zone Section */}
      <Card className="p-6 border-danger/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-danger/10 rounded-lg">
            <Trash2 size={20} className="text-danger" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Danger Zone</h2>
            <p className="text-sm text-text-muted">Irreversible actions</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-danger/5 border border-danger/20 rounded-lg">
            <div>
              <h3 className="font-medium text-text-primary">Clear All Stories</h3>
              <p className="text-sm text-text-muted">Permanently delete all scraped stories</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowClearModal(true)}>
              Clear Stories
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-danger/5 border border-danger/20 rounded-lg">
            <div>
              <h3 className="font-medium text-text-primary">Reset All Settings</h3>
              <p className="text-sm text-text-muted">Delete all data and reset to defaults</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowResetModal(true)}>
              Reset Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* Clear Stories Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Stories"
      >
        <p className="text-text-secondary mb-6">
          This will permanently delete all scraped stories. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClearStories} loading={clearing}>
            Clear Stories
          </Button>
        </div>
      </Modal>

      {/* Reset Settings Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Settings"
      >
        <p className="text-text-secondary mb-6">
          This will permanently delete all data including API keys, custom subreddits, and stories.
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleResetSettings} loading={resetting}>
            Reset Everything
          </Button>
        </div>
      </Modal>
    </div>
  );
}