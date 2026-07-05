// Server-only Lovable AI gateway helper.
export function getLovableApiKey(): string {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  return key;
}

export async function chatCompletion(opts: {
  model?: string;
  system?: string;
  user: string;
  json?: boolean;
}) {
  const key = getLovableApiKey();
  const body: Record<string, unknown> = {
    model: opts.model ?? "google/gemini-3-flash-preview",
    messages: [
      ...(opts.system ? [{ role: "system", content: opts.system }] : []),
      { role: "user", content: opts.user },
    ],
  };
  if (opts.json) body.response_format = { type: "json_object" };

  let res: Response | undefined;
  let lastErr = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) break;
    lastErr = await res.text().catch(() => "");
    if (res.status === 402) throw new Error("Out of AI credits. Please top up in workspace billing.");
    if (res.status !== 429 && res.status < 500) {
      throw new Error(`AI gateway error [${res.status}]: ${lastErr}`);
    }
    // Backoff: 1.2s, 2.4s, 4.8s, 8s, 12s
    await new Promise((r) => setTimeout(r, Math.min(12000, 1200 * Math.pow(2, attempt))));
  }
  if (!res || !res.ok) {
    throw new Error(`AI gateway rate-limited after retries. Please wait a moment and retry.`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content as string;
}