import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate-scene-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { prompt, aspect } = (await request.json()) as { prompt: string; aspect?: string };
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        if (!prompt || typeof prompt !== "string") return new Response("Missing prompt", { status: 400 });

        const size = aspect === "9:16" ? "1024x1536" : aspect === "1:1" ? "1024x1024" : "1536x1024";

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "openai/gpt-image-2",
            prompt: `Cinematic, high-quality still frame for an explainer video scene. ${prompt}`,
            size,
            quality: "low",
            n: 1,
            stream: true,
            partial_images: 1,
          }),
        });
        if (!upstream.ok || !upstream.body) {
          return new Response(await upstream.text(), { status: upstream.status });
        }
        return new Response(upstream.body, {
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      },
    },
  },
});