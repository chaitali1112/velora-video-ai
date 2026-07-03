import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Account settings</h1>
      <div className="glass rounded-2xl p-6 space-y-5">
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
          <input value={email} readOnly className="mt-2 w-full rounded-xl bg-input/60 border border-border px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Display name</label>
          <input placeholder="Your name" className="mt-2 w-full rounded-xl bg-input/60 border border-border px-4 py-3 text-sm" />
        </div>
        <Button variant="hero">Save changes</Button>
      </div>
    </div>
  );
}