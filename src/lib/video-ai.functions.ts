import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { chatCompletion, getLovableApiKey } from "./ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GenerateScriptInput = z.object({
  topic: z.string().min(3).max(500),
  length: z.enum(["30s", "1m", "3m", "5m", "10m"]),
  language: z.string().default("English"),
  style: z.string().default("Explainer"),
});

export const generateScript = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => GenerateScriptInput.parse(i))
  .handler(async ({ data }) => {
    const lengthMap = {
      "30s": "about 80 words",
      "1m": "about 160 words",
      "3m": "about 480 words",
      "5m": "about 800 words",
      "10m": "about 1600 words",
    } as const;

    const system = `You are a world-class YouTube scriptwriter. Write in ${data.language}. Style: ${data.style}. Return STRICT JSON matching the schema. No markdown, no commentary.`;

    const user = `Write a YouTube-ready video script on: "${data.topic}"
Target length: ${lengthMap[data.length]}.

Return JSON with this exact shape:
{
  "title": string,
  "hook": string,
  "introduction": string,
  "mainExplanation": string,
  "keyPoints": string[],
  "summary": string,
  "callToAction": string
}`;

    const raw = await chatCompletion({ system, user, json: true });
    try {
      return JSON.parse(raw);
    } catch {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    }
  });

const GenerateScenesInput = z.object({
  script: z.string().min(20),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
});

export const generateScenes = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => GenerateScenesInput.parse(i))
  .handler(async ({ data }) => {
    const system = `You are a video director. Split a script into 4-8 cinematic scenes. Return STRICT JSON only.`;
    const user = `Split this script into scenes for a ${data.aspectRatio} video.
Return JSON:
{
  "scenes": [
    {
      "narration": string,
      "visual": string,
      "camera": string,
      "animation": string,
      "transition": string
    }
  ]
}

SCRIPT:
${data.script}`;
    const raw = await chatCompletion({ system, user, json: true });
    try { return JSON.parse(raw); }
    catch { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  });

// ---------- Voiceover (TTS) ----------
const GenerateAudioInput = z.object({
  text: z.string().min(1).max(4000),
  voice: z.string().default("alloy"),
});

export const generateSceneAudio = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => GenerateAudioInput.parse(i))
  .handler(async ({ data }) => {
    const key = getLovableApiKey();
    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: data.text,
        voice: data.voice,
        response_format: "mp3",
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      if (res.status === 402) throw new Error("Out of AI credits. Please top up in workspace billing.");
      if (res.status === 429) throw new Error("Rate limited. Please retry shortly.");
      throw new Error(`TTS error [${res.status}]: ${t}`);
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
    const b64 = typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(buf).toString("base64");
    return { audio: `data:audio/mpeg;base64,${b64}` };
  });

// ---------- Project persistence ----------
const SceneShape = z.object({
  narration: z.string(),
  visual: z.string(),
  camera: z.string().optional().default(""),
  animation: z.string().optional().default(""),
  transition: z.string().optional().default(""),
});

const SaveProjectInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  topic: z.string().min(1).max(1000),
  length: z.string(),
  language: z.string(),
  style: z.string(),
  voice: z.string(),
  aspect: z.string(),
  script: z.record(z.any()).nullable().optional(),
  scenes: z.array(SceneShape).nullable().optional(),
});

export const saveProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => SaveProjectInput.parse(i))
  .handler(async ({ data, context }) => {
    const payload = {
      user_id: context.userId,
      title: data.title,
      topic: data.topic,
      length: data.length,
      language: data.language,
      style: data.style,
      voice: data.voice,
      aspect: data.aspect,
      script: data.script ?? null,
      scenes: data.scenes ?? null,
    };
    if (data.id) {
      const { data: row, error } = await context.supabase
        .from("video_projects")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await context.supabase
      .from("video_projects")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("video_projects")
      .select("id,title,topic,aspect,length,created_at,updated_at,scenes")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("video_projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });