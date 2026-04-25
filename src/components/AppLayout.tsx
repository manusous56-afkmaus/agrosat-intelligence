import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, Globe2 } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  fullBleed?: boolean;
}

export function AppLayout({ children, title, subtitle, actions, fullBleed }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-canvas">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-surface/80 backdrop-blur-sm px-4 sticky top-0 z-30">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="h-5 w-px bg-border" />
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <div className="flex items-baseline gap-2 min-w-0">
                <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
                {subtitle && (
                  <span className="text-xs text-muted-foreground truncate hidden md:inline">
                    · {subtitle}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="hidden sm:flex h-8 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
                <Search className="h-3.5 w-3.5" />
                <span>Search regions, parcels…</span>
                <kbd className="ml-2 hidden md:inline font-mono text-[10px] text-muted-foreground/70">⌘K</kbd>
              </button>
              <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Globe2 className="h-4 w-4" />
              </button>
              <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-risk" />
              </button>
              <div className="ml-1 h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                MK
              </div>
            </div>
          </header>

          <main className={`flex-1 min-w-0 ${fullBleed ? "" : "p-6 lg:p-8"}`}>
            {!fullBleed && (
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
                  {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
