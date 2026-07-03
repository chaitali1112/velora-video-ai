import { createFileRoute, Link } from "@tanstack/react-router";
import { Video, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/videos")({
  component: () => (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">My Videos</h1>
        <Link to="/generate"><Button variant="hero"><Plus className="h-4 w-4" /> New</Button></Link>
      </div>
      <div className="glass rounded-2xl p-16 text-center">
        <Video className="h-10 w-10 text-cyan mx-auto mb-3" />
        <h3 className="text-lg font-semibold">No videos yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Videos you create will appear here.</p>
      </div>
    </div>
  ),
});