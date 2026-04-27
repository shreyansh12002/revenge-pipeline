"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  Download,
  PenTool,
  Package,
  Settings,
  HelpCircle,
  Menu,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/stories", label: "Stories", icon: FileText },
  { href: "/scrape", label: "Scrape", icon: Download },
  { href: "/scripts", label: "Scripts", icon: PenTool },
  { href: "/package", label: "YT Package", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Desktop Sidebar (1024px and above) */}
      <aside className="hidden lg:flex w-60 min-h-screen bg-surface border-r border-border flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">R</span>
            </div>
            <div>
              <h1 className="text-text-primary font-semibold text-lg">RevengeHub</h1>
              <p className="text-text-muted text-xs">Content Pipeline</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                    )}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-surface-elevated hover:text-danger transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
          <p className="text-text-muted text-xs text-center">
            Powered by Apify + Claude
          </p>
        </div>
      </aside>

      {/* Tablet Sidebar (768px - 1023px) - Icon only */}
      <aside className="hidden md:flex lg:hidden fixed left-0 top-0 w-16 min-h-screen bg-surface border-r border-border flex-col z-40">
        {/* Logo */}
        <div className="p-3 border-b border-border">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white text-xl font-bold">R</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                    )}
                    title={item.label}
                  >
                    <item.icon size={20} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-3 rounded-lg text-text-secondary hover:bg-surface-elevated hover:text-danger transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>
    </>
  );
}
