import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Plus, Trash2, Loader2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listProjects, deleteProject } from "@/lib/video-ai.functions";
import { toast } from "sonner";

type ProjectRow = {
  id: string;
  title: string;
  topic: string;
  aspect: string;
  length: string;
  created_at: string;
  scenes: unknown[] | null;
};

export const Route = createFileRoute("/_authenticated/videos")({
  head: () => ({ meta: [{ title: "My Videos — Velora" }] }),
  component: VideosPage,
});

function VideosPage() {
  const listFn = useServerFn(listProjects);
  const delFn = useServerFn(deleteProject);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["video_projects"],
    queryFn: async () => (await listFn()) as ProjectRow[],
  });

  const del = useMutation({
    mutationFn: async (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["video_projects"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">My Videos</h1>
        <Link to="/generate"><Button variant="hero"><Plus className="h-4 w-4" /> New</Button></Link>
      </div>

      {isLoading ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-cyan" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Video className="h-10 w-10 text-cyan mx-auto mb-3" />
          <h3 className="text-lg font-semibold">No videos yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Create your first AI video to see it here.</p>
          <Link to="/generate" className="inline-block mt-4"><Button variant="hero"><Plus className="h-4 w-4" /> New video</Button></Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((p) => (
            <div key={p.id} className="glass rounded-2xl p-5 hover:border-violet/40 transition">
              <div className="flex items-start justify-between gap-2 mb-3">
                <Film className="h-5 w-5 text-cyan shrink-0 mt-1" />
                <button
                  onClick={() => del.mutate(p.id)}
                  className="text-muted-foreground hover:text-destructive transition"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="font-semibold line-clamp-2">{p.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.topic}</p>
              <div className="mt-3 flex gap-2 text-[10px] uppercase tracking-widest text-cyan">
                <span>{p.aspect}</span>
                <span>·</span>
                <span>{p.length}</span>
                <span>·</span>
                <span>{Array.isArray(p.scenes) ? p.scenes.length : 0} scenes</span>
              </div>
              <div className="mt-3 text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}