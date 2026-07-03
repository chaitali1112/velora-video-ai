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

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    if (res.status === 402) throw new Error("Out of AI credits. Please top up in workspace billing.");
    if (res.status === 429) throw new Error("Rate limited by AI gateway. Please retry shortly.");
    throw new Error(`AI gateway error [${res.status}]: ${t}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content as string;
}