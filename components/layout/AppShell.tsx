import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ToastProvider } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto pb-16 md:pb-0">
            <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
          </main>
          <MobileNav />
        </div>
      </ErrorBoundary>
    </ToastProvider>
  );
}