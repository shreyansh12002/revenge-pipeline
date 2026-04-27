"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    bg: "bg-accent-secondary/10",
    border: "border-accent-secondary/30",
    iconColor: "text-accent-secondary",
  },
  error: {
    icon: XCircle,
    bg: "bg-danger/10",
    border: "border-danger/30",
    iconColor: "text-danger",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning/10",
    border: "border-warning/30",
    iconColor: "text-warning",
  },
  info: {
    icon: Info,
    bg: "bg-accent/10",
    border: "border-accent/30",
    iconColor: "text-accent",
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg",
        "transform transition-all duration-300 ease-out",
        "animate-slide-in",
        config.bg,
        config.border
      )}
    >
      <Icon size={20} className={config.iconColor} />
      <p className="text-text-primary flex-1 text-sm">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-text-muted hover:text-text-primary transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, variant }]);

    const timeoutId = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timeoutIdsRef.current = timeoutIdsRef.current.filter((tid) => tid !== timeoutId);
    }, 4000);

    timeoutIdsRef.current.push(timeoutId);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

