"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid password");
        setIsLoading(false);
        return;
      }

      // Success - refresh and redirect
      router.push("/stories");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
            <span className="text-3xl font-bold text-accent">R</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            RevengeHub
          </h1>
          <p className="text-text-secondary">Content Pipeline</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-border rounded-xl p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
            Access Dashboard
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-surface-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  placeholder="Enter password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-danger flex-shrink-0" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3 px-4 bg-accent hover:bg-accent/90 disabled:bg-accent/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-sm mt-6">
          RevengeHub Content Pipeline v1.0
        </p>
      </div>
    </div>
  );
}