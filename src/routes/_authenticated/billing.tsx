import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/billing")({
  component: () => (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold mb-2">Billing & credits</h1>
      <p className="text-muted-foreground mb-8">You're on the <span className="text-cyan">Free</span> plan.</p>

      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-2">
          <Zap className="h-3.5 w-3.5 text-cyan" /> AI credits this month
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-display font-semibold">10</span>
          <span className="text-muted-foreground">/ 10 remaining</span>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-input overflow-hidden">
          <div className="h-full w-full bg-[image:var(--gradient-primary)]" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { name: "Pro", price: "$29/mo", feats: ["500 credits/mo", "1080p & 4K", "No watermark", "YouTube publishing"] },
          { name: "Business", price: "$99/mo", feats: ["Unlimited credits", "5 team seats", "API access", "Custom voices"] },
        ].map((p) => (
          <div key={p.name} className="glass rounded-2xl p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <span className="font-display font-semibold text-gradient text-xl">{p.price}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {p.feats.map((f) => (
                <li key={f} className="flex gap-2 text-sm"><Check className="h-4 w-4 text-cyan" />{f}</li>
              ))}
            </ul>
            <Button variant="hero" size="lg" className="w-full">Upgrade to {p.name}</Button>
          </div>
        ))}
      </div>
    </div>
  ),
});