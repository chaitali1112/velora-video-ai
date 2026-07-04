import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { generateScript, generateScenes, generateSceneAudio, saveProject } from "@/lib/video-ai.functions";
import { streamImage } from "@/lib/streamImage";
import { toast } from "sonner";
import { Wand2, Loader2, Sparkles, Film, Play, RefreshCw, Image as ImageIcon, Volume2, Pause, Save } from "lucide-react";

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
  imageUrl?: string;
  imageLoading?: boolean;
  audioUrl?: string;
  audioLoading?: boolean;
};

function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState<"30s" | "1m" | "3m" | "5m" | "10m">("1m");
  const [language, setLanguage] = useState("English");
  const [voice, setVoice] = useState("alloy");
  const [style, setStyle] = useState("Explainer");
  const [aspect, setAspect] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [script, setScript] = useState<Script | null>(null);
  const [scenes, setScenes] = useState<Scene[] | null>(null);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [playing, setPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scriptFn = useServerFn(generateScript);
  const scenesFn = useServerFn(generateScenes);
  const audioFn = useServerFn(generateSceneAudio);
  const saveFn = useServerFn(saveProject);

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

  const updateScene = (i: number, patch: Partial<Scene>) =>
    setScenes((prev) => (prev ? prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) : prev));

  async function genImage(i: number) {
    if (!scenes) return;
    updateScene(i, { imageLoading: true, imageUrl: undefined });
    const prompt = scenes[i].visual;
    let lastErr: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await streamImage(
          "/api/generate-scene-image",
          { prompt, aspect },
          (dataUrl, isFinal) => {
            updateScene(i, { imageUrl: dataUrl, imageLoading: !isFinal });
          },
        );
        return;
      } catch (e) {
        lastErr = e;
        const msg = (e as Error).message || "";
        const retriable = /429|rate|timeout|network|fetch|5\d\d/i.test(msg);
        if (!retriable) break;
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    updateScene(i, { imageLoading: false });
    toast.error(`Scene ${i + 1} image: ${(lastErr as Error)?.message ?? "failed"}`);
  }

  async function genAudio(i: number) {
    if (!scenes) return;
    updateScene(i, { audioLoading: true, audioUrl: undefined });
    const text = scenes[i].narration;
    let lastErr: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const r = (await audioFn({ data: { text, voice } })) as { audio: string };
        updateScene(i, { audioUrl: r.audio, audioLoading: false });
        return;
      } catch (e) {
        lastErr = e;
        const msg = (e as Error).message || "";
        const retriable = /429|rate|timeout|network|fetch|5\d\d/i.test(msg);
        if (!retriable) break;
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    updateScene(i, { audioLoading: false });
    toast.error(`Scene ${i + 1} voice: ${(lastErr as Error)?.message ?? "failed"}`);
  }

  async function genAllAssets() {
    if (!scenes) return;
    toast.info("Generating images & voiceover for all scenes…");
    for (let i = 0; i < scenes.length; i++) {
      // Serialise image then audio per scene to avoid tripping per-workspace rate limits.
      if (!scenes[i].imageUrl) await genImage(i);
      if (!scenes[i].audioUrl) await genAudio(i);
      // Small breather between scenes.
      await new Promise((r) => setTimeout(r, 400));
    }
    toast.success("All assets ready");
  }

  // Slideshow playback
  useEffect(() => {
    if (!playing || !scenes) return;
    const scene = scenes[playIndex];
    if (!scene) { setPlaying(false); return; }
    const advance = () => {
      if (playIndex + 1 >= scenes.length) { setPlaying(false); return; }
      setPlayIndex((n) => n + 1);
    };
    if (scene.audioUrl) {
      const a = new Audio(scene.audioUrl);
      audioRef.current = a;
      a.onended = advance;
      a.onerror = advance;
      a.play().catch(() => advance());
      return () => { a.pause(); a.onended = null; };
    } else {
      const t = setTimeout(advance, 3500);
      return () => clearTimeout(t);
    }
  }, [playing, playIndex, scenes]);

  function startPlayback() {
    if (!scenes || scenes.length === 0) return;
    setPlayIndex(0);
    setPlaying(true);
  }
  function stopPlayback() {
    setPlaying(false);
    audioRef.current?.pause();
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!script) throw new Error("Generate a script first");
      const persistScenes = scenes?.map(({ narration, visual, camera, animation, transition }) => ({
        narration, visual, camera, animation, transition,
      })) ?? null;
      const r = await saveFn({
        data: {
          id: projectId,
          title: script.title || topic.slice(0, 80),
          topic, length, language, style, voice, aspect,
          script, scenes: persistScenes,
        },
      }) as { id: string };
      return r;
    },
    onSuccess: (r) => { setProjectId(r.id); toast.success("Project saved"); },
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
                ["alloy", "Alloy — neutral"],
                ["echo", "Echo — deep male"],
                ["fable", "Fable — expressive"],
                ["nova", "Nova — warm female"],
                ["shimmer", "Shimmer — bright female"],
                ["onyx", "Onyx — narrator"],
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
              <div className="flex flex-wrap items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-cyan" />
                  <h2 className="font-semibold">Scenes ({scenes.length})</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="glass" size="sm" onClick={genAllAssets}>
                    <Sparkles className="h-3.5 w-3.5" /> Generate all
                  </Button>
                  {playing ? (
                    <Button variant="glass" size="sm" onClick={stopPlayback}>
                      <Pause className="h-3.5 w-3.5" /> Stop
                    </Button>
                  ) : (
                    <Button variant="hero" size="sm" onClick={startPlayback}>
                      <Play className="h-3.5 w-3.5" /> Play slideshow
                    </Button>
                  )}
                  <Button variant="glass" size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    {projectId ? "Update" : "Save"}
                  </Button>
                </div>
              </div>

              {playing && (
                <SlideshowStage scene={scenes[playIndex]} index={playIndex} total={scenes.length} aspect={aspect} />
              )}

              <div className="space-y-3">
                {scenes.map((s, i) => (
                  <SceneCard
                    key={i}
                    scene={s}
                    index={i}
                    aspect={aspect}
                    onGenImage={() => genImage(i)}
                    onGenAudio={() => genAudio(i)}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-6 text-center">
                Full MP4 export coming next — for now, preview your video with the slideshow above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function aspectRatio(a: string) {
  return a === "9:16" ? "9 / 16" : a === "1:1" ? "1 / 1" : "16 / 9";
}

function SlideshowStage({ scene, index, total, aspect }: { scene: Scene; index: number; total: number; aspect: string }) {
  return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-violet/40 bg-black relative" style={{ aspectRatio: aspectRatio(aspect) }}>
      {scene.imageUrl ? (
        <img src={scene.imageUrl} alt={scene.visual} className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700" />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No image yet for this scene
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 to-transparent">
        <div className="text-[10px] uppercase tracking-widest text-cyan mb-1">Scene {index + 1} / {total}</div>
        <p className="text-white text-base sm:text-lg leading-snug drop-shadow-lg line-clamp-3">{scene.narration}</p>
      </div>
    </div>
  );
}

function SceneCard({ scene, index, aspect, onGenImage, onGenAudio }: {
  scene: Scene; index: number; aspect: string; onGenImage: () => void; onGenAudio: () => void;
}) {
  return (
    <div className="border border-border/60 rounded-xl p-4 hover:border-violet/40 transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest text-cyan">Scene {index + 1}</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onGenImage} disabled={scene.imageLoading}>
            {scene.imageLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />}
            {scene.imageUrl ? "Regenerate" : "Image"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onGenAudio} disabled={scene.audioLoading}>
            {scene.audioLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />}
            {scene.audioUrl ? "Redo voice" : "Voice"}
          </Button>
        </div>
      </div>
      <div className="grid sm:grid-cols-[160px_1fr] gap-4">
        <div className="rounded-lg overflow-hidden bg-input/40 border border-border/40" style={{ aspectRatio: aspectRatio(aspect) }}>
          {scene.imageUrl ? (
            <img
              src={scene.imageUrl}
              alt={scene.visual}
              className={`w-full h-full object-cover transition-[filter] duration-500 ${scene.imageLoading ? "blur-xl" : "blur-0"}`}
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">
              {scene.imageLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "No image"}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm mb-2 text-foreground/90 italic">&ldquo;{scene.narration}&rdquo;</p>
          {scene.audioUrl && (
            <audio controls src={scene.audioUrl} className="w-full h-8 mb-2" />
          )}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Meta k="Visual" v={scene.visual} />
            <Meta k="Camera" v={scene.camera} />
            <Meta k="Animation" v={scene.animation} />
            <Meta k="Transition" v={scene.transition} />
          </div>
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