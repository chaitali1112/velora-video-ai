import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Wand2, Video, Sparkles, TrendingUp, Clock, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Velora" }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl font-semibold">Welcome back 👋</h1>
          <p className="text-muted-foreground mt-1">Let's create something amazing today.</p>
        </div>
        <Link to="/generate">
          <Button variant="hero" size="lg"><Plus className="h-4 w-4" /> New Project</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <StatCard icon={Video} label="Videos created" value="0" tint="violet" />
        <StatCard icon={Clock} label="Minutes rendered" value="0" tint="cyan" />
        <StatCard icon={TrendingUp} label="Credits used" value="0" tint="violet" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/generate" className="glass rounded-2xl p-8 hover:border-violet/40 transition group">
          <div className="h-12 w-12 rounded-xl bg-[image:var(--gradient-primary)]/20 border border-violet/30 grid place-items-center mb-4 group-hover:glow-violet transition">
            <Wand2 className="h-5 w-5 text-cyan" />
          </div>
          <h3 className="text-xl font-semibold mb-1">Start with a topic</h3>
          <p className="text-muted-foreground text-sm">Give Velora a subject and watch it build the full video from scratch.</p>
        </Link>
        <div className="glass rounded-2xl p-8">
          <div className="h-12 w-12 rounded-xl bg-cyan/20 border border-cyan/30 grid place-items-center mb-4">
            <Sparkles className="h-5 w-5 text-cyan" />
          </div>
          <h3 className="text-xl font-semibold mb-1">No videos yet</h3>
          <p className="text-muted-foreground text-sm">Your recent projects will appear here.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tint }: { icon: any; label: string; value: string; tint: "violet" | "cyan" }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className={`h-9 w-9 rounded-lg grid place-items-center mb-3 ${tint === "violet" ? "bg-violet/20 text-violet-glow" : "bg-cyan/20 text-cyan"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-3xl font-semibold font-display">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}