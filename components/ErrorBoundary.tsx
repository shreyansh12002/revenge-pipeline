"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 rounded-lg bg-danger/10 border border-danger/30">
          <div className="flex items-center gap-2 text-danger font-semibold">
            <AlertTriangle className="w-5 h-5" />
            Something went wrong
          </div>
          <p className="text-text-secondary text-sm mt-2">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 flex items-center gap-2 text-sm text-accent hover:underline"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
