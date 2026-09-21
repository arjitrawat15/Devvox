import { useState, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  Github,
  Loader2,
  Mic,
  Brain,
  BarChart3,
  FileText,
  Play,
  Linkedin,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";

/* ─── Animation helpers ────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ─── Glow Card ─────────────────────────────────────── */

function GlowCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setGlowPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Cursor glow */}
      <div
        className="pointer-events-none absolute -inset-px z-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${glowPos.x}px ${glowPos.y}px, rgba(139, 92, 246, 0.12), transparent 60%)`,
        }}
      />
      {/* Border glow */}
      <div
        className="pointer-events-none absolute -inset-px z-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(300px circle at ${glowPos.x}px ${glowPos.y}px, rgba(139, 92, 246, 0.25), transparent 60%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function FadeInSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Hero ─────────────────────────────────────────── */

function Hero() {
  const [github, setGithub] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  async function onSubmit() {
    if (!github.trim()) {
      toast("Please provide a valid GitHub URL");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, {
        github: github.trim(),
      });
      navigate(`/interview/${response.data.id}`);
    } catch {
      toast("Something went wrong starting your interview. Please try again.");
      setLoading(false);
    }
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
      {/* Background orbs */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute right-1/4 top-2/3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
      >
        <div className="h-[300px] w-[300px] rounded-full bg-indigo-500/8 blur-[100px]" />
      </motion.div>

      <motion.div
        className="relative z-10 flex max-w-3xl flex-col items-center text-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Badge */}
        <motion.span
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <Mic className="size-3.5 text-violet-400" />
          AI-Powered Voice Interviews
        </motion.span>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
        >
          Ace Your Next{" "}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Technical Interview
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground"
        >
          Paste your GitHub profile and jump into a real-time, voice-driven interview
          with AI — tailored to your actual projects. Get scored instantly.
        </motion.p>

        {/* Input */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          id="hero-input"
          className="mt-10 w-full max-w-xl"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl shadow-violet-500/5 backdrop-blur-sm transition-all focus-within:border-violet-500/30 focus-within:shadow-violet-500/10">
            <div className="flex items-center pl-3 text-muted-foreground">
              <Github className="size-5" />
            </div>
            <Input
              value={github}
              placeholder="https://github.com/your-username"
              onChange={(e) => setGithub(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && onSubmit()}
              disabled={loading}
              className="border-0 bg-transparent text-base shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
            />
            <Button
              disabled={loading}
              onClick={onSubmit}
              size="lg"
              className="shrink-0 gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-600 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Starting
                </>
              ) : (
                <>
                  Start Interview
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground/60">
            We'll ask for microphone access once your interview begins.
          </p>
        </motion.div>

        {/* Dashboard link for authenticated users */}
        {isAuthenticated && (
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 text-sm text-violet-400 transition-colors hover:text-violet-300"
            >
              View your dashboard &rarr;
            </button>
          </motion.div>
        )}

        {/* Scroll indicator */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 animate-bounce text-muted-foreground/40"
        >
          <ChevronRight className="size-5 rotate-90" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── How it Works ─────────────────────────────────── */

const STEPS = [
  {
    num: "01",
    title: "Paste Your GitHub",
    description: "Drop your GitHub profile URL. We analyze your repositories, languages, and contributions.",
    icon: Github,
  },
  {
    num: "02",
    title: "Voice Interview",
    description: "Have a natural, real-time conversation with our AI interviewer — tailored to your work.",
    icon: Mic,
  },
  {
    num: "03",
    title: "Get Results",
    description: "Receive an instant score, detailed feedback, and a full transcript of your interview.",
    icon: BarChart3,
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <FadeInSection>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <SectionHeader
              label="Process"
              title="How it Works"
              subtitle="Three simple steps from GitHub profile to interview feedback."
            />
          </motion.div>
        </FadeInSection>

        <FadeInSection className="mt-16 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
            >
              <GlowCard className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-colors hover:border-white/10">
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-3xl font-bold text-white/10">{step.num}</span>
                  <div className="grid size-10 place-items-center rounded-xl bg-violet-500/10 text-violet-400">
                    <step.icon className="size-5" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </GlowCard>
            </motion.div>
          ))}
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── Features ─────────────────────────────────────── */

const FEATURES = [
  {
    title: "Real-time Voice AI",
    description: "Natural, flowing conversation powered by WebRTC. No typing, no delays — just talk.",
    icon: Mic,
    gradient: "from-violet-500/20 to-violet-500/0",
  },
  {
    title: "GitHub-Aware Questions",
    description: "Questions are generated from your actual repositories, languages, and contribution patterns.",
    icon: Brain,
    gradient: "from-indigo-500/20 to-indigo-500/0",
  },
  {
    title: "Instant Scoring",
    description: "Get rated on a 10-point scale with actionable, detailed feedback on your performance.",
    icon: BarChart3,
    gradient: "from-emerald-500/20 to-emerald-500/0",
  },
  {
    title: "Full Transcript",
    description: "Review every question and answer. See exactly where you excelled and where to improve.",
    icon: FileText,
    gradient: "from-amber-500/20 to-amber-500/0",
  },
];

function Features() {
  return (
    <section id="features" className="px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <FadeInSection>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <SectionHeader
              label="Features"
              title="Everything You Need"
              subtitle="Built for developers who want honest, AI-powered interview practice."
            />
          </motion.div>
        </FadeInSection>

        <FadeInSection className="mt-16 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
            >
              <GlowCard className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-colors hover:border-white/10">
                <div className="mb-5 grid size-11 place-items-center rounded-xl border border-white/10 bg-white/5">
                  <feature.icon className="size-5 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </GlowCard>
            </motion.div>
          ))}
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── Demo Video ───────────────────────────────────── */

function Demo() {
  return (
    <section id="demo" className="px-6 py-32">
      <div className="mx-auto max-w-4xl">
        <FadeInSection>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <SectionHeader
              label="Demo"
              title="See it in Action"
              subtitle="Watch how Devvox conducts a real technical interview."
            />
          </motion.div>
        </FadeInSection>

        <FadeInSection>
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="mt-16">
            <GlowCard className="rounded-2xl border border-white/10 bg-white/[0.02]">
              {/* Video placeholder */}
              <div className="aspect-video w-full">
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-white/[0.03] to-transparent">
                  <button className="grid size-20 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:scale-105 hover:border-violet-500/30 hover:bg-violet-500/10">
                    <Play className="size-8 pl-1" fill="currentColor" />
                  </button>
                  <p className="text-sm text-muted-foreground">Demo video coming soon</p>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── Stats ────────────────────────────────────────── */

const STATS = [
  { value: "10,000+", label: "Interviews Conducted" },
  { value: "4.8", label: "Average Rating" },
  { value: "50+", label: "Technologies Covered" },
  { value: "98%", label: "Uptime" },
];

function Stats() {
  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <FadeInSection>
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            <GlowCard className="rounded-2xl border border-white/5 bg-white/[0.02] p-12">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {STATS.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </GlowCard>
          </motion.div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── Footer ───────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
          <div className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-3.5 text-white"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          Devvox
        </div>

        <div className="flex items-center gap-5">
          <a
            href="https://github.com/arjitrawat15"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="size-5" />
          </a>
          <a
            href="https://linkedin.com/in/arjitrawat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Linkedin className="size-5" />
          </a>
        </div>

        <p className="text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} Devvox. Built by Arjit Rawat.
        </p>
      </div>
    </footer>
  );
}

/* ─── Shared ───────────────────────────────────────── */

function SectionHeader({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center">
      <span className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-violet-400">
        {label}
      </span>
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-lg text-muted-foreground">{subtitle}</p>
    </div>
  );
}

/* ─── Landing Page ─────────────────────────────────── */

export function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Demo />
      <Stats />
      <Footer />
    </div>
  );
}
