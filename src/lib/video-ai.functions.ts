import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { chatCompletion } from "./ai-gateway.server";

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