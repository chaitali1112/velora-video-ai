// Client-side slideshow → WebM renderer using canvas.captureStream() + MediaRecorder.
// Each scene draws its image to a canvas while its narration audio plays through
// a shared AudioContext; the resulting audio+video MediaStream is recorded.

export type RenderScene = { imageUrl?: string; audioUrl?: string; narration: string };

function aspectDims(aspect: string): { w: number; h: number } {
  if (aspect === "9:16") return { w: 720, h: 1280 };
  if (aspect === "1:1") return { w: 1024, h: 1024 };
  return { w: 1280, h: 720 };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function fetchAudioBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return await ctx.decodeAudioData(buf);
}

function drawCover(
  c: CanvasRenderingContext2D,
  img: HTMLImageElement,
  W: number,
  H: number,
  zoom: number,
) {
  const ir = img.width / img.height;
  const cr = W / H;
  let dw: number, dh: number;
  if (ir > cr) { dh = H * zoom; dw = dh * ir; }
  else { dw = W * zoom; dh = dw / ir; }
  const dx = (W - dw) / 2;
  const dy = (H - dh) / 2;
  c.drawImage(img, dx, dy, dw, dh);
}

function drawCaption(c: CanvasRenderingContext2D, W: number, H: number, text: string, sceneNum: number, total: number) {
  const pad = Math.round(W * 0.04);
  const barH = Math.round(H * 0.28);
  const grad = c.createLinearGradient(0, H - barH, 0, H);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.92)");
  c.fillStyle = grad;
  c.fillRect(0, H - barH, W, barH);

  c.fillStyle = "#22d3ee";
  c.font = `600 ${Math.round(H * 0.022)}px system-ui, sans-serif`;
  c.fillText(`SCENE ${sceneNum} / ${total}`, pad, H - barH + pad + Math.round(H * 0.022));

  c.fillStyle = "#ffffff";
  const fontSize = Math.round(H * 0.035);
  c.font = `500 ${fontSize}px system-ui, sans-serif`;
  const maxWidth = W - pad * 2;
  const lineH = Math.round(fontSize * 1.25);
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (c.measureText(test).width > maxWidth) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = test;
    if (lines.length >= 3) break;
  }
  if (cur && lines.length < 3) lines.push(cur);
  const startY = H - pad - lineH * (lines.length - 1);
  lines.forEach((ln, i) => c.fillText(ln, pad, startY + i * lineH));
}

export async function renderSlideshowToWebM(
  scenes: RenderScene[],
  aspect: string,
  onProgress?: (msg: string) => void,
): Promise<Blob> {
  const { w: W, h: H } = aspectDims(aspect);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#000";
  c.fillRect(0, 0, W, H);

  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AC();
  const dest = audioCtx.createMediaStreamDestination();

  // Preload audio buffers
  const buffers: (AudioBuffer | null)[] = [];
  for (let i = 0; i < scenes.length; i++) {
    const u = scenes[i].audioUrl;
    if (!u) { buffers.push(null); continue; }
    try {
      onProgress?.(`Decoding audio ${i + 1}/${scenes.length}`);
      buffers.push(await fetchAudioBuffer(audioCtx, u));
    } catch { buffers.push(null); }
  }

  // Preload images
  const images: (HTMLImageElement | null)[] = [];
  for (let i = 0; i < scenes.length; i++) {
    const u = scenes[i].imageUrl;
    if (!u) { images.push(null); continue; }
    try {
      onProgress?.(`Loading image ${i + 1}/${scenes.length}`);
      images.push(await loadImage(u));
    } catch { images.push(null); }
  }

  const videoStream = canvas.captureStream(30);
  const stream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);

  const mimeCandidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? "video/webm";
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });
  recorder.start(100);

  const FALLBACK_SECONDS = 3.5;
  const startedAt = performance.now();
  let elapsedTotal = 0;

  for (let i = 0; i < scenes.length; i++) {
    const img = images[i];
    const buf = buffers[i];
    const duration = buf ? buf.duration : FALLBACK_SECONDS;
    onProgress?.(`Rendering scene ${i + 1}/${scenes.length}`);

    // Start audio
    if (buf) {
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      src.connect(dest);
      src.start();
    }

    // Animate frames for this scene
    const sceneStart = performance.now();
    const sceneEnd = sceneStart + duration * 1000;
    while (performance.now() < sceneEnd) {
      const t = (performance.now() - sceneStart) / (duration * 1000);
      const zoom = 1.05 + t * 0.08; // subtle Ken Burns
      c.fillStyle = "#000";
      c.fillRect(0, 0, W, H);
      if (img) drawCover(c, img, W, H, zoom);
      else {
        c.fillStyle = "#0f172a";
        c.fillRect(0, 0, W, H);
        c.fillStyle = "#64748b";
        c.font = `500 ${Math.round(H * 0.03)}px system-ui, sans-serif`;
        c.fillText(`Scene ${i + 1}`, Math.round(W * 0.04), Math.round(H * 0.08));
      }
      drawCaption(c, W, H, scenes[i].narration, i + 1, scenes.length);
      await new Promise((r) => setTimeout(r, 1000 / 30));
    }
    elapsedTotal = (performance.now() - startedAt) / 1000;
    void elapsedTotal;
  }

  recorder.stop();
  await stopped;
  try { await audioCtx.close(); } catch { /* noop */ }
  return new Blob(chunks, { type: mimeType });
}