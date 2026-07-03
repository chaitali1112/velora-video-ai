import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Sparkles, Wand2, Film, Mic, Type, Youtube, Zap, Play, Check,
  ArrowRight, Star, Video, Layers, Languages, Palette,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SiteNav />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Contact />
      <SiteFooter />
    </div>
  );
}

function SiteNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="glass rounded-2xl px-5 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-semibold">
            <LogoMark />
            <span className="text-lg tracking-tight">Velora</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition">FAQ</a>
            <a href="#contact" className="hover:text-foreground transition">Contact</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/auth"><Button variant="hero" size="sm">Start free</Button></Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <div className="relative h-8 w-8 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center glow-violet">
      <Sparkles className="h-4 w-4 text-white" />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative pt-40 pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-hero pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-70" />
      {/* floating orbs */}
      <div className="absolute -left-20 top-32 h-72 w-72 rounded-full bg-violet/30 blur-3xl animate-float" />
      <div className="absolute right-0 top-52 h-80 w-80 rounded-full bg-cyan/20 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground mb-8">
          <span className="h-2 w-2 rounded-full bg-cyan animate-pulse-glow" />
          Powered by next-gen AI video models
        </div>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold leading-[1.02] tracking-tight">
          Create AI Videos<br />
          <span className="text-gradient">in Minutes</span>
        </h1>
        <p className="mt-8 mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          Turn a topic into a fully animated explainer video — script, scenes,
          voiceover, and subtitles generated automatically. Ready to publish to YouTube.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link to="/auth">
            <Button variant="hero" size="xl" className="group">
              Start creating free
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button variant="glass" size="xl">
            <Play className="h-4 w-4" /> Watch demo
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No credit card required · 10 free credits</p>

        {/* Fake demo player */}
        <div className="mt-20 relative mx-auto max-w-4xl">
          <div className="absolute -inset-4 bg-[image:var(--gradient-primary)] rounded-3xl opacity-30 blur-2xl" />
          <div className="relative glass rounded-2xl overflow-hidden aspect-video border border-white/10">
            <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
            <div className="absolute inset-0 grid place-items-center">
              <button className="h-20 w-20 rounded-full bg-white/10 backdrop-blur border border-white/30 grid place-items-center hover:scale-105 transition">
                <Play className="h-8 w-8 text-white translate-x-0.5" fill="currentColor" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-xs">
              <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-1/3 bg-[image:var(--gradient-primary)]" />
              </div>
              <span className="text-white/70">0:38 / 2:14</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  const logos = ["ACME", "NIMBUS", "ORBITAL", "LUMEN", "VERTEX", "PHOTON"];
  return (
    <section className="py-12 border-y border-border/50">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">
          Trusted by creators at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-60">
          {logos.map((l) => (
            <span key={l} className="font-display font-semibold tracking-widest text-sm text-muted-foreground">{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Wand2, title: "AI Script Generator", desc: "YouTube-ready scripts with hook, intro, key points, and CTA." },
  { icon: Layers, title: "Scene Splitting", desc: "Every script auto-split into scenes with narration and visuals." },
  { icon: Palette, title: "AI Illustrations", desc: "Custom images generated per scene, on-brand and cinematic." },
  { icon: Mic, title: "Natural Voiceover", desc: "40+ AI voices across 30 languages, tuned per style." },
  { icon: Type, title: "Auto Subtitles", desc: "Word-by-word captions with custom fonts, colors and effects." },
  { icon: Youtube, title: "YouTube Publishing", desc: "Publish, schedule, or draft — with AI titles & thumbnails." },
  { icon: Film, title: "Full Editor", desc: "Swap images, tweak timing, change music — preview instantly." },
  { icon: Languages, title: "30+ Languages", desc: "Create globally — one script, translated & voiced." },
];

function Features() {
  return (
    <section id="features" className="py-32 relative">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-widest text-cyan">Everything you need</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold">One tool. <span className="text-gradient">End-to-end video.</span></h2>
          <p className="mt-4 text-muted-foreground text-lg">Skip the tab-switching. Velora handles script, visuals, voice, edit, and publish in one place.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:border-violet/40 transition group">
              <div className="h-11 w-11 rounded-xl bg-[image:var(--gradient-primary)]/20 border border-violet/30 grid place-items-center mb-4 group-hover:glow-violet transition">
                <f.icon className="h-5 w-5 text-cyan" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: "01", title: "Enter your topic", desc: "Type an idea or paste a full script — pick length, language & voice." },
  { n: "02", title: "AI builds your video", desc: "We generate scenes, illustrations, narration, and subtitles automatically." },
  { n: "03", title: "Refine & publish", desc: "Tweak in the editor, then export MP4 or publish straight to YouTube." },
];

function HowItWorks() {
  return (
    <section className="py-32 bg-card/30 border-y border-border/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-20">
          <span className="text-xs uppercase tracking-widest text-cyan">How it works</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold">From idea to video<br /><span className="text-gradient">in three moves.</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          {steps.map((s, i) => (
            <div key={s.n} className="relative glass rounded-2xl p-8">
              <div className="text-6xl font-display font-semibold text-gradient opacity-60 mb-4">{s.n}</div>
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-muted-foreground">{s.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-cyan opacity-60" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Free", price: "$0", period: "forever",
    desc: "For trying it out.",
    features: ["10 AI credits/mo", "Up to 1 min videos", "720p export", "Watermark", "5 AI voices"],
    cta: "Start free", highlight: false,
  },
  {
    name: "Pro", price: "$29", period: "/month",
    desc: "For serious creators.",
    features: ["500 AI credits/mo", "Up to 10 min videos", "1080p & 4K export", "No watermark", "40+ AI voices", "YouTube publishing", "Priority rendering"],
    cta: "Go Pro", highlight: true,
  },
  {
    name: "Business", price: "$99", period: "/month",
    desc: "For teams & agencies.",
    features: ["Unlimited credits", "Team seats (5)", "Brand kit & templates", "API access", "Custom voices", "Priority support"],
    cta: "Contact sales", highlight: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-cyan">Pricing</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold">Simple, <span className="text-gradient">scale-friendly</span> plans.</h2>
          <p className="mt-4 text-muted-foreground text-lg">Start free. Upgrade when your channel takes off.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-3xl p-8 ${p.highlight ? "bg-[image:var(--gradient-primary)]/10 border-2 border-violet/60 glow-violet" : "glass"}`}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs bg-[image:var(--gradient-primary)] text-white font-medium">
                  Most popular
                </div>
              )}
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-semibold font-display">{p.price}</span>
                <span className="text-muted-foreground">{p.period}</span>
              </div>
              <Link to="/auth" className="block mt-6">
                <Button variant={p.highlight ? "hero" : "glass"} size="lg" className="w-full">{p.cta}</Button>
              </Link>
              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <Check className="h-4 w-4 text-cyan flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  { name: "Maya Chen", role: "YouTube creator, 240k subs", quote: "I went from one video a week to four. Velora writes the script, builds the scenes — I just review and publish." },
  { name: "Diego Alvarez", role: "Marketing lead, Nimbus", quote: "We ship product explainers the same day features launch. It used to take a full sprint with an agency." },
  { name: "Priya Rao", role: "Course creator", quote: "The multi-language voiceovers are unreal. I doubled my audience by shipping every lesson in EN, ES, and HI." },
];

function Testimonials() {
  return (
    <section className="py-32 bg-card/30 border-y border-border/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest text-cyan">Loved by creators</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold">Real teams, <span className="text-gradient">real output.</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-6">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-cyan text-cyan" />)}
              </div>
              <p className="text-foreground/90 leading-relaxed">"{t.quote}"</p>
              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="font-medium">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  { q: "How does Velora generate videos?", a: "You give us a topic or script. Our AI writes the narrative, splits it into scenes, generates matching illustrations, records a voiceover, and adds animated subtitles — all in one pipeline." },
  { q: "Can I edit the output?", a: "Yes. The editor lets you swap any image, rewrite narration, change voices, adjust timing, and add background music before you export." },
  { q: "What languages are supported?", a: "30+ languages including English, Spanish, French, German, Portuguese, Hindi, Mandarin, Japanese, Arabic, and more." },
  { q: "Can I publish directly to YouTube?", a: "On Pro and Business plans, yes — connect your channel and publish, schedule, or save as draft with AI-generated titles, descriptions, and hashtags." },
  { q: "What's an AI credit?", a: "One credit ≈ one minute of finished video. Complex scenes with heavy image generation may use slightly more." },
  { q: "Do you offer refunds?", a: "Yes — full refund within 14 days on any paid plan, no questions asked." },
];

function FAQ() {
  return (
    <section id="faq" className="py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-cyan">FAQ</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold">Questions, <span className="text-gradient">answered.</span></h2>
        </div>
        <Accordion type="single" collapsible className="glass rounded-2xl px-6">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/50">
              <AccordionTrigger className="text-left hover:no-underline font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative glass rounded-3xl p-10 md:p-14 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-violet/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan/20 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-cyan">Get in touch</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold">Talk to our team</h2>
              <p className="mt-3 text-muted-foreground">
                Building at scale? Need custom voices or an API? We'll get back within one business day.
              </p>
            </div>
            <form
              className="space-y-3"
              onSubmit={(e) => { e.preventDefault(); alert("Thanks! We'll be in touch."); }}
            >
              <input required placeholder="Your name" className="w-full rounded-xl bg-input/60 border border-border px-4 py-3 outline-none focus:border-violet transition" />
              <input required type="email" placeholder="Email" className="w-full rounded-xl bg-input/60 border border-border px-4 py-3 outline-none focus:border-violet transition" />
              <textarea required rows={3} placeholder="How can we help?" className="w-full rounded-xl bg-input/60 border border-border px-4 py-3 outline-none focus:border-violet transition resize-none" />
              <Button variant="hero" size="lg" className="w-full">Send message</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold">
          <LogoMark />
          <span>Velora Video AI</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
          <span>© {new Date().getFullYear()} Velora</span>
        </div>
      </div>
    </footer>
  );
}
