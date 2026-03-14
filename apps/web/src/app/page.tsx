"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export default function LandingPage() {
  return (
    <div className="bg-dark text-white font-body overflow-x-hidden selection:bg-secondary selection:text-white min-h-screen">
      <Navigation />

      <Hero />

      <MarqueeSection />

      <StyleComparison />

      <StaticToKinetic />

      <ChaosEngine />

      <VibeCheck />

      <ProcessSteps />

      <SystemOverride />

      <EarlyAccess />

      <Footer />
    </div>
  );
}

function Navigation() {
  return (
    <nav className="border-b-4 border-primary bg-dark sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <img
              src="/images/logo-Photoroom.png"
              alt="Logo"
              className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
            />
            <span className="font-display text-2xl tracking-tighter text-white ml-2 uppercase">
              Utsukushii<span className="text-primary">.AI</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              className="font-mono text-sm font-bold hover:text-primary hover:underline decoration-2 underline-offset-4 decoration-primary uppercase"
              href="#features"
            >
              Features
            </Link>
            <Link
              className="font-mono text-sm font-bold hover:text-primary hover:underline decoration-2 underline-offset-4 decoration-primary uppercase"
              href="#manga"
            >
              Manga
            </Link>
            <Link
              className="font-mono text-sm font-bold hover:text-primary hover:underline decoration-2 underline-offset-4 decoration-primary uppercase"
              href="#waitlist"
            >
              Waitlist
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="font-mono font-bold text-sm px-6 py-2 border-2 border-white hover:bg-white hover:text-black transition-colors"
            >
              LOGIN
            </Link>
            <Link
              href="/register"
              className="font-mono font-bold text-sm px-6 py-2 bg-primary text-black border-2 border-primary shadow-[4px_4px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#fff] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
            >
              START CREATING
            </Link>
          </div>
          <div className="md:hidden flex items-center">
            <button className="text-white hover:text-primary">
              <span className="material-symbols-outlined text-4xl">menu</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-16 pb-24 border-b border-white/10 overflow-hidden">
      <div className="absolute top-20 left-10 w-32 h-32 border-4 border-secondary opacity-20 rotate-12"></div>
      <div className="absolute bottom-40 right-10 w-64 h-64 border-4 border-primary rounded-full opacity-10"></div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-block bg-secondary text-black font-mono font-bold px-3 py-1 mb-6 border-2 border-white shadow-[4px_4px_0px_#fff] transform -rotate-2">
              V 2.0 BETA LIVE
            </div>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter mb-8 text-white uppercase">
              Animate <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-white">
                Manga
              </span>{" "}
              <br />
              Instantly
            </h1>
            <p className="font-mono text-gray-400 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 mb-10 border-l-4 border-primary pl-6">
              Turn static panels into high-energy MMVs. No editing skills
              required. Just upload, sync, and destroy the timeline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/register"
                className="font-display text-xl px-8 py-4 bg-primary text-black border-4 border-black shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase rounded-none text-center"
              >
                Start Creating
              </Link>
              <button className="font-display text-xl px-8 py-4 bg-transparent text-white border-4 border-white hover:bg-white hover:text-black transition-colors uppercase flex items-center gap-2 justify-center rounded-none">
                <span className="material-symbols-outlined">play_circle</span>{" "}
                Watch Demo
              </button>
            </div>
          </div>
          <div className="flex-1 relative w-full max-w-md mx-auto lg:mx-0">
            <div className="relative aspect-9/16 bg-surface-dark border-6 border-black shadow-neo group">
              <div
                className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                style={{ backgroundImage: "url('/images/hero.png')" }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/40"></div>
              </div>
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
                <div className="px-2 py-1 bg-black/80 text-primary font-mono text-xs border border-primary">
                  REC ●
                </div>
              </div>
              <div className="absolute bottom-8 left-4 right-4 z-20">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    alt="User avatar"
                    className="w-10 h-10 object-contain"
                    src="/images/logo-Photoroom.png"
                  />
                  <div>
                    <div className="font-display text-sm text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                      @KIRA_EDITZ
                    </div>
                    <div className="font-mono text-xs text-primary">
                      Song: Override - KSLV
                    </div>
                  </div>
                </div>
                <div className="h-2 w-full bg-white/20 overflow-hidden">
                  <div className="h-full w-2/3 bg-primary"></div>
                </div>
              </div>
              <div className="absolute -right-6 top-20 bg-secondary text-white font-display text-lg px-4 py-2 border-4 border-black rotate-3 shadow-[4px_4px_0px_#000]">
                AI GENERATED
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarqueeSection() {
  const items = [
    { user: "@MANGA_LORD", song: "TOKYO DRIFT", color: "#FF4500" },
    { user: "@NEON_SOUL", song: "PHONK KILLER", color: "#CCFF00" },
    { user: "@VIBE_CHECK", song: "OVERRIDE", color: "#FF4500" },
    { user: "@GHOST_SHELL", song: "DEADWEIGHT", color: "#CCFF00" },
    { user: "@AKIRA_REBORN", song: "NIGHT CITY", color: "#FF4500" },
    { user: "@ZENITH_EDITS", song: "CYBER FLOW", color: "#CCFF00" },
  ];

  return (
    <div className="bg-black py-10 border-b-4 border-primary overflow-hidden">
      <div className="marquee-container">
        <div className="marquee-content items-center">
          {items.map((item, i) => (
            <span
              key={i}
              className="font-mono text-4xl md:text-5xl font-bold text-white px-8 whitespace-nowrap"
              style={{
                filter: `drop-shadow(4px 4px 0px ${item.color})`,
              }}
            >
              {item.user}{" "}
              <span className="text-primary mx-4 font-bold">//</span>{" "}
              {item.song}
            </span>
          ))}
        </div>
        <div aria-hidden="true" className="marquee-content items-center">
          {items.map((item, i) => (
            <span
              key={i}
              className="font-mono text-4xl md:text-5xl font-bold text-white px-8 whitespace-nowrap"
              style={{
                filter: `drop-shadow(4px 4px 0px ${item.color})`,
              }}
            >
              {item.user}{" "}
              <span className="text-primary mx-4 font-bold">//</span>{" "}
              {item.song}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StyleComparison() {
  const [activeStyle, setActiveStyle] = useState("CYBERPUNK");
  const styles = ["GLITCH NOIR", "CYBERPUNK NEON", "CLASSIC SHONEN"];

  return (
    <section className="py-24 bg-dark relative manga-dots overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl text-white mb-12 uppercase text-center">
            STYLE <span className="text-secondary">COMPARISON</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-0 border-4 border-black shadow-neo-orange">
            {styles.map((style) => (
              <button
                key={style}
                onClick={() =>
                  setActiveStyle(style.split(" ")[0].toUpperCase())
                }
                className={cn(
                  "font-display text-xl md:text-2xl px-12 py-4 border-b-4 md:border-b-0 md:border-r-4 border-black transition-colors last:border-0",
                  activeStyle === style.split(" ")[0].toUpperCase()
                    ? "bg-secondary text-white"
                    : "bg-primary text-black hover:bg-white",
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-3 space-y-8 order-2 lg:order-1">
            <div className="bg-dark border-4 border-primary p-6 shadow-neo-sm">
              <h4 className="font-display text-primary text-xl mb-4 uppercase">
                Style Stats
              </h4>
              <ul className="space-y-4 font-mono font-bold text-lg">
                <li className="flex flex-col border-b border-white/20 pb-2">
                  <span className="text-gray-400 text-xs uppercase mb-1">
                    Motion Intensity
                  </span>
                  <span className="text-white">MAX</span>
                </li>
                <li className="flex flex-col border-b border-white/20 pb-2">
                  <span className="text-gray-400 text-xs uppercase mb-1">
                    Color Saturation
                  </span>
                  <span className="text-white">+200%</span>
                </li>
                <li className="flex flex-col border-b border-white/20 pb-2">
                  <span className="text-gray-400 text-xs uppercase mb-1">
                    Artifact Density
                  </span>
                  <span className="text-white">EXTREME</span>
                </li>
                <li className="flex flex-col border-b border-white/20 pb-2">
                  <span className="text-gray-400 text-xs uppercase mb-1">
                    Frame Rate
                  </span>
                  <span className="text-white">60 FPS</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-[400px] aspect-9/16 bg-surface-dark border-6 border-black shadow-[8px_8px_0px_0px_#FF4500]">
              <img
                alt="Style Preview"
                className="w-full h-full object-cover grayscale brightness-50"
                src="/images/hero.png"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/80 border-2 border-primary px-4 py-2 text-primary font-mono text-xl animate-pulse text-center">
                  PREVIEWING: <br /> {activeStyle}
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 flex flex-col gap-6 order-3">
            <div className="bg-white p-6 border-4 border-black shadow-neo-orange">
              <h3 className="font-display text-black text-2xl uppercase mb-3 leading-tight">
                THE {activeStyle} <br /> ADVANTAGE
              </h3>
              <p className="font-mono text-black font-bold text-sm">
                Automated neon glows, chromatic aberration, and volumetric
                smoke. Designed for futuristic world-building.
              </p>
            </div>
            <button className="bg-secondary text-white font-display text-xl py-6 border-4 border-black shadow-neo-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-none uppercase px-4">
              Apply This Style
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StaticToKinetic() {
  return (
    <section className="py-24 bg-primary relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-4 border-black pb-6">
          <div>
            <h2 className="font-display text-4xl md:text-5xl text-black uppercase mb-2">
              Static to Kinetic
            </h2>
            <p className="font-mono text-black font-bold text-lg">
              Drag the slider to unleash chaos.
            </p>
          </div>
        </div>
        <ComparisonSlider />
      </div>
    </section>
  );
}

function ComparisonSlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  };

  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) =>
    handleMove(e.touches[0].clientX);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video border-6 border-black bg-black shadow-neo-white group overflow-hidden cursor-ew-resize select-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero.png')",
          filter: "contrast(1.2) saturate(1.5)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h3 className="font-display text-[10vw] text-white opacity-20 uppercase tracking-widest rotate-12">
            After
          </h3>
        </div>
      </div>

      {/* Before Image */}
      <div
        className="absolute inset-0 bg-cover bg-center grayscale border-r-4 border-primary"
        style={{
          backgroundImage: "url('/images/hero.png')",
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h3 className="font-display text-[10vw] text-black opacity-20 uppercase tracking-widest -rotate-12">
            Before
          </h3>
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute inset-y-0 z-10 w-12 flex items-center justify-center pointer-events-none"
        style={{ left: `calc(${sliderPos}% - 1.5rem)` }}
      >
        <div className="w-12 h-12 bg-primary border-4 border-black rounded-none flex items-center justify-center shadow-[4px_4px_0px_#000]">
          <span className="material-symbols-outlined text-black font-bold">
            drag_indicator
          </span>
        </div>
      </div>
    </div>
  );
}

function ChaosEngine() {
  return (
    <section className="py-24 bg-dark relative overflow-hidden" id="features">
      <div className="absolute inset-0 bg-[linear-gradient(#1a1a1a_1px,transparent_1px),linear-gradient(90deg,#1a1a1a_1px,transparent_1px)] bg-size-[40px_40px]"></div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl text-white mb-4 uppercase">
            Powered by <span className="text-secondary">Chaos</span> Engine
          </h2>
          <div className="h-1 w-32 bg-primary mx-auto mb-2"></div>
          <div className="h-1 w-16 bg-primary mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="layers"
            title="Auto-Layer Separation"
            description="Our AI rips characters from backgrounds with pixel-perfect violence. Isolate elements instantly for independent animation."
            variant="default"
          />
          <FeatureCard
            icon="equalizer"
            title="Beat Sync Injection"
            description="Drop your track. The engine analyzes BPM and transients, locking animation keyframes to the kick drum automatically."
            variant="primary"
          />
          <FeatureCard
            icon="bug_report"
            title="Glitch & VHS Artifacts"
            description="Apply procedural chromatic aberration, grain, and scanlines. Make it look like a cursed tape from 1998."
            variant="secondary"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  variant,
}: {
  icon: string;
  title: string;
  description: string;
  variant: "default" | "primary" | "secondary";
}) {
  return (
    <div
      className={cn(
        "bg-surface-dark p-6 relative group hover:-translate-y-2 transition-transform duration-300 rounded-none",
        variant === "default" &&
          "border-4 border-white shadow-neo-sm hover:shadow-neo",
        variant === "primary" &&
          "border-4 border-primary shadow-neo hover:shadow-neo-orange",
        variant === "secondary" &&
          "border-4 border-secondary shadow-neo-orange hover:shadow-neo",
      )}
    >
      <div
        className={cn(
          "absolute -top-6 left-1/2 -translate-x-1/2 border-2 px-3 py-1 z-10",
          variant === "default" && "bg-black border-white text-primary",
          variant === "primary" && "bg-primary border-black text-black",
          variant === "secondary" && "bg-secondary border-black text-black",
        )}
      >
        <span className="material-symbols-outlined text-3xl font-bold">
          {icon}
        </span>
      </div>
      <div className="mt-4 text-center">
        <h3
          className={cn(
            "font-display text-2xl mb-3 uppercase",
            variant === "primary"
              ? "text-primary"
              : variant === "secondary"
                ? "text-secondary"
                : "text-white",
          )}
        >
          {title}
        </h3>
        <p className="font-mono text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function VibeCheck() {
  return (
    <section className="py-24 bg-dark overflow-hidden border-t-4 border-b-4 border-primary">
      <div className="mb-12 px-8">
        <h2 className="font-display text-4xl md:text-6xl text-primary uppercase">
          Vibe Check
        </h2>
        <p className="font-mono text-white text-xl">
          THE LATEST FROM THE COMMUNITY // STYLES TO STEAL
        </p>
      </div>
      <div className="marquee-container">
        <div className="marquee-content-slow">
          {[1, 2, 3, 4].map((i) => (
            <VibeCard key={i} />
          ))}
        </div>
        <div aria-hidden="true" className="marquee-content-slow">
          {[1, 2, 3, 4].map((i) => (
            <VibeCard key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function VibeCard() {
  return (
    <div className="shrink-0 w-[300px] aspect-9/16 bg-surface-dark border-4 border-white relative group shadow-neo-sm">
      <img
        alt="Gallery item"
        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
        src="/images/hero.png"
      />
      <div className="absolute bottom-6 left-0 right-0 px-4">
        <button className="w-full py-3 bg-primary text-black font-display text-sm border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-none uppercase">
          REMIX THIS
        </button>
      </div>
    </div>
  );
}

function ProcessSteps() {
  const steps = [
    {
      num: "01",
      title: "IMPORT",
      desc: "Drag and drop your manga panels. CBR, PDF, or raw JPG. We don't care about file names, just the art.",
      color: "bg-secondary",
      shadow: "shadow-neo-black",
      rotate: "-rotate-1",
    },
    {
      num: "02",
      title: "AI CHAOS",
      desc: "Our engine isolates characters, creates depth, and generates the fluid motion only a high-end studio could replicate.",
      color: "bg-white",
      shadow: "shadow-neo-orange",
      rotate: "rotate-1",
      textColor: "text-black",
      numColor: "text-secondary",
    },
    {
      num: "03",
      title: "SYNC & SHIP",
      desc: "Lock it to your audio transients. Export in 4K, 60fps. Ready for TikTok, Reels, or the big screen.",
      color: "bg-primary",
      shadow: "shadow-neo-black",
      rotate: "-rotate-1",
      textColor: "text-black",
    },
  ];

  return (
    <section className="py-32 bg-dark relative px-4">
      <div className="max-w-4xl mx-auto space-y-24 relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-40 w-12 h-[calc(100%-80px)] zigzag-connector opacity-30 pointer-events-none"></div>
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              "relative z-10 border-6 border-black p-8 md:p-12 transition-transform hover:rotate-0",
              step.color,
              step.shadow,
              step.rotate,
            )}
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div
                className={cn(
                  "font-display text-8xl md:text-9xl leading-none",
                  step.numColor || "text-black/20",
                )}
              >
                {step.num}
              </div>
              <div className={step.textColor || "text-white"}>
                <h3 className="font-display text-5xl md:text-6xl uppercase mb-4">
                  {step.title}
                </h3>
                <p className="font-mono font-bold text-lg leading-tight">
                  {step.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SystemOverride() {
  return (
    <section className="py-24 bg-dark relative overflow-hidden border-t-8 border-white">
      <div className="absolute inset-0 font-mono text-xs text-gray-800 leading-tight select-none pointer-events-none code-bg-overlay overflow-hidden whitespace-pre p-4">
        {`{
  "infrastructure": {
    "compute": "NVIDIA_H100_FARM",
    "nodes": 4096,
    "interconnect": "INFINIBAND_NDR",
    "vram_total": "320TB"
  },
  "processing": {
    "engine": "KINETIC_FLOW_V4",
    "latency": "0.04ms",
    "concurrency": "UNLIMITED"
  },
  "output": {
    "encoding": "LOSSLESS_AV1",
    "resolution": "4096x2304",
    "bitrate": "VAR_ULTRA"
  }
}
import torch
from chaos_engine import KineticProcessor
def override_system():
    farm = NVIDIA_H100_FARM.connect()
    pipeline = KineticProcessor(mode='VIOLENCE')
    for frame in source.frames:
        processed = pipeline.inject_motion(frame, sync=audio.transients)
        farm.distribute(processed)
    return farm.export(quality='LOSSLESS_4K')`}
      </div>
      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center mb-16">
          <div className="bg-secondary text-white font-mono font-bold px-4 py-1 mb-4 border-2 border-white animate-pulse">
            CRITICAL SYSTEM UPDATE
          </div>
          <h2 className="font-display text-6xl md:text-8xl text-center text-white mb-4 uppercase tracking-tighter">
            SYSTEM <span className="text-primary italic">OVERRIDE</span>
          </h2>
          <p className="font-mono text-gray-400 text-lg max-w-2xl text-center border-y-2 border-primary/30 py-4">
            High-performance AI clusters forged for absolute visual domination.
            Zero bottlenecks. Maximum kinetic output.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <OverrideCard
            icon="memory"
            core="01"
            title="NVIDIA H100 GPU FARM"
            desc="4,096 H100 nodes running in parallel. Instant rendering that makes traditional studios look like stop-motion."
            stat="STABILITY: 99.9%"
            statIcon="bolt"
            variant="primary"
          />
          <OverrideCard
            icon="speed"
            core="02"
            title="REAL-TIME KINETIC PROCESSING"
            desc="Our Chaos Engine predicts motion vectors in real-time, syncing frame interpolation to sub-millisecond audio transients."
            stat="LATENCY: 0.04MS"
            statIcon="cyclone"
            variant="secondary"
          />
          <OverrideCard
            icon="high_quality"
            core="03"
            title="LOSSLESS 4K EXPORT"
            desc="Uncompressed AV1 pipelines at 60fps. Retain every grain, every glitch, and every pixel of your original art style."
            stat="OUTPUT: 4K/60FPS"
            statIcon="download"
            variant="primary"
          />
        </div>
      </div>
    </section>
  );
}

function OverrideCard({
  icon,
  core,
  title,
  desc,
  stat,
  statIcon,
  variant,
}: {
  icon: string;
  core: string;
  title: string;
  desc: string;
  stat: string;
  statIcon: string;
  variant: "primary" | "secondary";
}) {
  return (
    <div
      className={cn(
        "p-8 border-6 border-black transform hover:-translate-y-2 transition-transform cursor-crosshair group",
        variant === "primary"
          ? "bg-primary shadow-[12px_12px_0px_0px_#000]"
          : "bg-secondary shadow-[12px_12px_0px_0px_#CCFF00]",
      )}
    >
      <div className="flex justify-between items-start mb-12">
        <div
          className={cn(
            "w-12 h-12 border-4 flex items-center justify-center",
            variant === "primary" ? "border-black" : "border-white",
          )}
        >
          <span
            className={cn(
              "material-symbols-outlined font-bold",
              variant === "primary" ? "text-black" : "text-white",
            )}
          >
            {icon}
          </span>
        </div>
        <div
          className={cn(
            "font-mono font-bold text-xs px-2 py-1 border-2",
            variant === "primary"
              ? "bg-white text-black border-black"
              : "bg-black text-white border-white",
          )}
        >
          CORE_{core}
        </div>
      </div>
      <h3
        className={cn(
          "font-display text-4xl mb-4 leading-none",
          variant === "primary" ? "text-black" : "text-white",
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "font-mono font-bold text-sm mb-6",
          variant === "primary" ? "text-black" : "text-white",
        )}
      >
        {desc}
      </p>
      <div
        className={cn(
          "pt-6 border-t-4 flex items-center justify-between",
          variant === "primary" ? "border-black/20" : "border-white/20",
        )}
      >
        <span
          className={cn(
            "font-mono text-xs font-bold",
            variant === "primary" ? "text-black" : "text-white",
          )}
        >
          {stat}
        </span>
        <span
          className={cn(
            "material-symbols-outlined group-hover:translate-x-2 transition-transform",
            variant === "primary" ? "text-black" : "text-white",
          )}
        >
          {statIcon}
        </span>
      </div>
    </div>
  );
}

function EarlyAccess() {
  return (
    <section
      className="py-24 bg-white text-black border-t-8 border-black"
      id="pricing"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-4 border-black bg-primary p-8 md:p-12 shadow-neo-orange relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full halftone-bg pointer-events-none opacity-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="font-display text-5xl md:text-6xl mb-4 leading-none uppercase">
                Join the Movement
              </h2>
              <p className="font-mono text-lg font-bold mb-6 border-l-4 border-black pl-4">
                UtsukushiiAI is now Open Source. Join the waitlist for early access to our cloud-hosted chaos clusters.
              </p>
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-1 bg-white border-4 border-black p-4 font-mono text-sm placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-shadow rounded-none"
                  placeholder="ENTER YOUR EMAIL"
                  type="email"
                />
                <button
                  className="bg-black text-white border-4 border-black px-8 py-4 font-display text-lg uppercase hover:bg-secondary hover:text-black transition-colors rounded-none"
                  type="button"
                >
                  Join Now
                </button>
              </form>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-black flex items-center justify-center rotate-12 border-4 border-white shadow-[8px_8px_0px_rgba(0,0,0,0.2)]">
                <span className="font-display text-white text-center text-xl leading-tight">
                  LIMITED
                  <br />
                  SPOTS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-dark border-t border-white/20 pt-16 pb-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img
                src="/images/logo-Photoroom.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-display text-xl tracking-tighter text-white uppercase">
                Utsukushii.AI
              </span>
            </div>
            <p className="font-mono text-gray-500 text-sm max-w-sm mb-6">
              The world's first chaos-engine for manga animation. Built for
              editors, by editors who hate keyframing.
            </p>
          </div>
          <div>
            <h4 className="font-display text-lg text-white mb-4">PRODUCT</h4>
            <ul className="space-y-3 font-mono text-sm text-gray-400">
              <li>
                <Link className="hover:text-primary transition-colors" href="#">
                  Features
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="https://github.com/Mananwebdev160408/utsukushiiai-template">
                  Github
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg text-white mb-4">LEGAL</h4>
            <ul className="space-y-3 font-mono text-sm text-gray-400">
              <li>
                <Link className="hover:text-primary transition-colors" href="#">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="#">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs text-gray-600">
            © 2026 UTSUKUSHII AI INC. TOKYO, JAPAN.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-mono text-xs text-gray-400">
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
