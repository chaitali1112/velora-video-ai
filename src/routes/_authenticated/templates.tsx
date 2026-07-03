import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

const templates = [
  { name: "Product Explainer", desc: "60-second product intro with hook, features, CTA." },
  { name: "TikTok Short", desc: "Punchy 30-second vertical for social." },
  { name: "YouTube Tutorial", desc: "Step-by-step educational format, 3-5 min." },
  { name: "News Recap", desc: "Fast-paced daily news roundup." },
  { name: "Case Study", desc: "Customer story arc for B2B marketing." },
  { name: "Course Lesson", desc: "10-min educational lecture with chapters." },
];

export const Route = createFileRoute("/_authenticated/templates")({
  component: () => (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold mb-2">Templates</h1>
      <p className="text-muted-foreground mb-8">Kickstart your next video with a preset.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {templates.map((t) => (
          <div key={t.name} className="glass rounded-2xl p-6 hover:border-violet/40 transition cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-violet/20 border border-violet/30 grid place-items-center mb-3">
              <FileText className="h-4 w-4 text-cyan" />
            </div>
            <h3 className="font-semibold">{t.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  ),
});