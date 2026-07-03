import { createFileRoute, Outlet, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard, Video, Wand2, FileText, CreditCard, Settings,
  Sparkles, LogOut, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate({ to: "/auth" });
      else setUser(s.user);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/generate", label: "New Project", icon: Wand2 },
    { to: "/videos", label: "My Videos", icon: Video },
    { to: "/templates", label: "Templates", icon: FileText },
    { to: "/billing", label: "Billing", icon: CreditCard },
    { to: "/settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-sidebar">
        <Link to="/dashboard" className="flex items-center gap-2 px-6 h-16 border-b border-border/50 font-display font-semibold">
          <div className="h-8 w-8 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center glow-violet">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          Velora
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition"
              activeProps={{ className: "bg-sidebar-accent text-foreground" }}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border/50">
          <div className="glass rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Zap className="h-3 w-3 text-cyan" /> AI Credits
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold font-display">10</span>
              <span className="text-xs text-muted-foreground">/ 10</span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-input overflow-hidden">
              <div className="h-full w-full bg-[image:var(--gradient-primary)]" />
            </div>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 text-sm">
            <div className="h-8 w-8 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-xs font-semibold text-white">
              {user?.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}