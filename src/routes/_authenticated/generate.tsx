import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateScript, generateScenes } from "@/lib/video-ai.functions";
import { toast } from "sonner";
import { Wand2, Loader2, Sparkles, Film, Play, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/generate")({
  head: () => ({ meta: [{ title: "New Project — Velora" }] }),
  component: GeneratePage,
});

type Script = {
  title: string;
  hook: string;
  introduction: string;
  mainExplanation: string;
  keyPoints: string[];
  summary: string;
  callToAction: string;
};

type Scene = {
  narration: string;
  visual: string;
  camera: string;
  animation: string;
  transition: string;
};

function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState<"30s" | "1m" | "3m" | "5m" | "10m">("1m");
  const [language, setLanguage] = useState("English");
  const [voice, setVoice] = useState("Aria (warm female)");
  const [style, setStyle] = useState("Explainer");
  const [aspect, setAspect] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [script, setScript] = useState<Script | null>(null);
  const [scenes, setScenes] = useState<Scene[] | null>(null);

  const scriptFn = useServerFn(generateScript);
  const scenesFn = useServerFn(generateScenes);

  const scriptMutation = useMutation({
    mutationFn: async () => scriptFn({ data: { topic, length, language, style } }) as Promise<Script>,
    onSuccess: (s) => {
      setScript(s);
      setScenes(null);
      toast.success("Script generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const scenesMutation = useMutation({
    mutationFn: async () => {
      if (!script) throw new Error("Generate a script first");
      const fullScript = [
        script.hook, script.introduction, script.mainExplanation,
        ...script.keyPoints, script.summary, script.callToAction,
      ].join("\n\n");
      return scenesFn({ data: { script: fullScript, aspectRatio: aspect } }) as Promise<{ scenes: Scene[] }>;
    },
    onSuccess: (r) => {
      setScenes(r.scenes);
      toast.success(`${r.scenes.length} scenes ready`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">New Video</h1>
        <p className="text-muted-foreground mt-1">Describe your topic. Velora writes the script, splits scenes, and prepares your video.</p>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        <div className="glass rounded-2xl p-6 space-y-4 h-fit">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Topic or script</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How black holes work, explained for beginners"
              rows={4}
              className="mt-2 w-full rounded-xl bg-input/60 border border-border px-4 py-3 outline-none focus:border-violet transition resize-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Length">
              <Select value={length} onChange={(v) => setLength(v as "30s" | "1m" | "3m" | "5m" | "10m")} options={[
                ["30s", "30 seconds"], ["1m", "1 minute"], ["3m", "3 minutes"],
                ["5m", "5 minutes"], ["10m", "10 minutes"],
              ]} />
            </Field>
            <Field label="Aspect">
              <Select value={aspect} onChange={(v) => setAspect(v as "16:9" | "9:16" | "1:1")} options={[
                ["16:9", "16:9 Landscape"], ["9:16", "9:16 Vertical"], ["1:1", "1:1 Square"],
              ]} />
            </Field>
            <Field label="Language">
              <Select value={language} onChange={setLanguage} options={[
                ["English", "English"], ["Spanish", "Spanish"], ["French", "French"],
                ["German", "German"], ["Portuguese", "Portuguese"], ["Hindi", "Hindi"],
                ["Japanese", "Japanese"], ["Mandarin", "Mandarin"],
              ]} />
            </Field>
            <Field label="Style">
              <Select value={style} onChange={setStyle} options={[
                ["Explainer", "Explainer"], ["Educational", "Educational"],
                ["Marketing", "Marketing"], ["Storytelling", "Storytelling"],
                ["News", "News"],
              ]} />
            </Field>
            <Field label="AI Voice">
              <Select value={voice} onChange={setVoice} options={[
                ["Aria (warm female)", "Aria — warm female"],
                ["Orion (deep male)", "Orion — deep male"],
                ["Luna (bright female)", "Luna — bright female"],
                ["Atlas (narrator)", "Atlas — narrator"],
              ]} />
            </Field>
            <Field label="Animation">
              <Select value="Cinematic" onChange={() => {}} options={[
                ["Cinematic", "Cinematic"], ["Whiteboard", "Whiteboard"],
                ["3D", "3D Render"], ["Anime", "Anime"],
              ]} />
            </Field>
          </div>

          <Button
            variant="hero" size="lg" className="w-full"
            disabled={!topic.trim() || scriptMutation.isPending}
            onClick={() => scriptMutation.mutate()}
          >
            {scriptMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Writing script…</>
            ) : (
              <><Wand2 className="h-4 w-4" /> Generate script</>
            )}
          </Button>
        </div>

        <div className="space-y-6 min-w-0">
          {!script && !scriptMutation.isPending && <EmptyState />}
          {scriptMutation.isPending && <SkeletonBlock />}

          {script && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan" />
                  <h2 className="font-semibold">Script</h2>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => scriptMutation.mutate()}>
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  </Button>
                  <Button variant="hero" size="sm" onClick={() => scenesMutation.mutate()} disabled={scenesMutation.isPending}>
                    {scenesMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Film className="h-3.5 w-3.5" />}
                    Build scenes
                  </Button>
                </div>
              </div>
              <h3 className="text-2xl font-display font-semibold text-gradient mb-4">{script.title}</h3>
              <ScriptBlock label="Hook" body={script.hook} />
              <ScriptBlock label="Introduction" body={script.introduction} />
              <ScriptBlock label="Main explanation" body={script.mainExplanation} />
              <div className="mt-4">
                <SectionLabel>Key points</SectionLabel>
                <ul className="mt-2 space-y-1.5">
                  {script.keyPoints.map((k, i) => (
                    <li key={i} className="flex gap-2 text-sm"><span className="text-cyan">•</span><span>{k}</span></li>
                  ))}
                </ul>
              </div>
              <ScriptBlock label="Summary" body={script.summary} />
              <ScriptBlock label="Call to action" body={script.callToAction} />
            </div>
          )}

          {scenesMutation.isPending && <SkeletonBlock />}
          {scenes && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Film className="h-4 w-4 text-cyan" />
                <h2 className="font-semibold">Scenes ({scenes.length})</h2>
              </div>
              <div className="space-y-3">
                {scenes.map((s, i) => (
                  <div key={i} className="border border-border/60 rounded-xl p-4 hover:border-violet/40 transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-widest text-cyan">Scene {i + 1}</span>
                      <Button variant="ghost" size="sm"><Play className="h-3 w-3" /> Preview</Button>
                    </div>
                    <p className="text-sm mb-3 text-foreground/90 italic">&ldquo;{s.narration}&rdquo;</p>
                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      <Meta k="Visual" v={s.visual} />
                      <Meta k="Camera" v={s.camera} />
                      <Meta k="Animation" v={s.animation} />
                      <Meta k="Transition" v={s.transition} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border/50 text-center">
                <Button variant="hero" size="lg" disabled>
                  <Sparkles className="h-4 w-4" /> Render video (coming soon)
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Image generation, voiceover, and MP4 rendering unlock in the next phase.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl bg-input/60 border border-border px-3 py-2.5 outline-none focus:border-violet transition text-sm"
    >
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs uppercase tracking-widest text-cyan">{children}</div>;
}

function ScriptBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="mt-4">
      <SectionLabel>{label}</SectionLabel>
      <p className="mt-2 text-sm text-foreground/90 leading-relaxed">{body}</p>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-input/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="text-xs mt-0.5">{v}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass rounded-2xl p-16 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-[image:var(--gradient-primary)]/20 border border-violet/40 grid place-items-center mb-4 animate-pulse-glow">
        <Wand2 className="h-6 w-6 text-cyan" />
      </div>
      <h3 className="text-lg font-semibold">Your video starts here</h3>
      <p className="text-sm text-muted-foreground mt-1">Describe a topic on the left and click generate.</p>
    </div>
  );
}

function SkeletonBlock() {
  return (
    <div className="glass rounded-2xl p-6 space-y-3">
      <div className="h-6 w-1/3 rounded bg-input/60 animate-shimmer" />
      <div className="h-3 w-full rounded bg-input/60 animate-shimmer" />
      <div className="h-3 w-11/12 rounded bg-input/60 animate-shimmer" />
      <div className="h-3 w-4/5 rounded bg-input/60 animate-shimmer" />
    </div>
  );
}