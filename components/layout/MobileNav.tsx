"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  Download,
  PenTool,
  Package,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/stories", label: "Stories", icon: FileText },
  { href: "/scrape", label: "Scrape", icon: Download },
  { href: "/scripts", label: "Scripts", icon: PenTool },
  { href: "/package", label: "Package", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
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
    /* Mobile Bottom Navigation (<768px) */
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 safe-area-bottom">
      <ul className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                  isActive
                    ? "text-accent"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                <item.icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] text-text-muted hover:text-danger"
          >
            <LogOut size={20} />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
