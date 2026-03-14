"use client";

import { useCallback, useState } from "react";
import {
  Zap,
  ArrowLeft,
  Terminal,
  Hammer,
  Rocket,
  Save,
  Music,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { MangaUploader } from "@/components/forge/MangaUploader/MangaUploader";
import { AudioUploader } from "@/components/forge/AudioUploader/AudioUploader";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

export default function NewProjectPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("CYBERPUNK_MISSION_01");
  const [mangaUploaded, setMangaUploaded] = useState(false);
  const [audioUploaded, setAudioUploaded] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [aiStep, setAiStep] = useState(0);
  const [aiProgress, setAiProgress] = useState(0);

  const aiPhases = [
    "Analyzing Manga Composition...",
    "Extracting Character Layers...",
    "Injecting Beat Sync Transients...",
    "Synthesizing Kinetic Motion...",
    "Finalizing Project Database...",
  ];

  const ensureProject = useCallback(async () => {
    if (projectId) return projectId;

    const res = await api.projects.create({
      title: projectName,
      aspectRatio: "9:16",
    });

    if (!res.success || !res.data) {
      throw new Error("Failed to initialize project");
    }

    setProjectId(res.data.id);
    return res.data.id;
  }, [projectId, projectName]);

  const handleStartForge = async () => {
    setLoading(true);
    setStep(5);

    // Phase-based artificial delay for cinematic effect
    for (let i = 0; i < aiPhases.length; i++) {
      setAiStep(i);
      for (let p = 0; p <= 100; p += 5) {
        setAiProgress(p);
        await new Promise((r) => setTimeout(r, 40));
      }
    }

    try {
      const id = await ensureProject();
      const res = await api.projects.update(id, {
        title: projectName,
      });
      if (res.success) {
        window.location.href = `/projects/${id}`;
      }
    } catch (err) {
      console.error("CREATE_PROJECT_ERROR:", err);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { n: 1, label: "MANGA_SOURCE", icon: <Layers className="w-4 h-4" /> },
    { n: 2, label: "AUDIO_RHYTHM", icon: <Music className="w-4 h-4" /> },
    { n: 3, label: "STYLE_MATRIXX", icon: <Zap className="w-4 h-4" /> },
    { n: 4, label: "IGNITION", icon: <Rocket className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-background-dark min-h-screen text-slate-100 font-display flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12 flex flex-col gap-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-black dark:border-white pb-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary">
              <Terminal className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-widest font-bold">
                System Ready // v2.4.0
              </span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-[0.85]">
              The Forge <br />
              <span
                className="text-transparent"
                style={{
                  WebkitTextStroke: "1px white",
                  textShadow: "4px 4px 0 #ccff00",
                }}
              >
                Studio
              </span>
            </h1>
          </div>

          {/* Stepper UI */}
          <div className="flex items-center gap-4 bg-black border-4 border-white/10 p-2 shadow-hard-xs">
            {steps.map((s) => (
              <div
                key={s.n}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 transition-all",
                  step === s.n
                    ? "bg-primary text-black font-black"
                    : "text-white/40 font-bold",
                )}
              >
                <span className="font-mono text-[10px]">
                  {s.n.toString().padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase tracking-widest hidden sm:block">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="hidden lg:block relative p-4 max-w-xs transform -rotate-1 bg-white border-4 border-black text-black shadow-neo-sm">
            <p className="font-bold text-[10px] uppercase leading-tight italic">
              {step === 1 && "Step 1: Feed the machine your manga files."}
              {step === 2 && "Step 2: Sync the rhythm to the panels."}
              {step === 3 && "Step 3: Select a visual paradigm."}
              {step === 4 && "Step 4: Confirm parameters and ignite."}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black uppercase italic text-white flex items-center gap-3">
                    <Layers className="text-primary w-8 h-8" />
                    Manga Input
                  </h2>
                  <div className="bg-white/5 border border-white/10 px-4 py-1 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-mono text-white/40 uppercase font-black">
                      Waiting for assets
                    </span>
                  </div>
                </div>
                <div className="border-6 border-dashed border-white/10 p-8 md:p-12 hover:border-primary transition-all">
                  <MangaUploader
                    projectId={projectId}
                    ensureProject={ensureProject}
                    onUploadComplete={() => setMangaUploaded(true)}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black uppercase italic text-white flex items-center gap-3">
                    <Music className="text-secondary w-8 h-8" />
                    Audio Selection
                  </h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors flex items-center gap-2 underline underline-offset-4"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to Manga
                  </button>
                </div>
                <div className="border-6 border-dashed border-white/10 p-8 md:p-12 hover:border-secondary transition-all">
                  <AudioUploader
                    projectId={projectId}
                    ensureProject={ensureProject}
                    onUploadComplete={() => setAudioUploaded(true)}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black uppercase italic text-white flex items-center gap-3">
                    <Zap className="text-primary w-8 h-8" />
                    Style Selection
                  </h2>
                  <button
                    onClick={() => setStep(2)}
                    className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors flex items-center gap-2 underline underline-offset-4"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to Audio
                  </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Decide Option */}
                    <button
                      onClick={() => setSelectedPreset("AI_DECIDE")}
                      className={cn(
                        "p-8 border-4 transition-all flex flex-col items-center justify-center gap-4 text-center group",
                        selectedPreset === "AI_DECIDE"
                          ? "bg-primary border-black text-black shadow-hard"
                          : "bg-white/5 border-white/10 text-white hover:border-primary",
                      )}
                    >
                      <Sparkles className="w-12 h-12 animate-pulse" />
                      <div>
                        <h4 className="font-black uppercase italic text-xl">
                          Let AI Decide
                        </h4>
                        <p className="text-[10px] font-mono opacity-60 uppercase mt-2">
                          Analyzes assets for optimal sync
                        </p>
                      </div>
                    </button>

                    {/* Sample Presets */}
                    {[
                      "Glitch Noir",
                      "Cyberpunk Neon",
                      "Retro 90s Anime",
                      "Sketch Lineart",
                      "Oil Painting",
                    ].map((p) => (
                      <button
                        key={p}
                        onClick={() => setSelectedPreset(p)}
                        className={cn(
                          "p-8 border-4 transition-all flex flex-col items-start text-left gap-4 group",
                          selectedPreset === p
                            ? "bg-white border-black text-black shadow-hard"
                            : "bg-surface-dark border-white/10 text-white hover:border-white",
                        )}
                      >
                        <Layers className="w-8 h-8 opacity-40 group-hover:text-primary transition-colors" />
                        <div>
                          <h4 className="font-black uppercase italic text-lg">
                            {p}
                          </h4>
                          <p className="text-[10px] font-mono opacity-40 uppercase mt-1">
                            Preset_XJ_{p.slice(0, 3).toUpperCase()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Preset Preview Area */}
                  <div className="w-full lg:w-80 space-y-4">
                    <div className="bg-black border-4 border-black shadow-hard aspect-[9/16] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-stripes opacity-10"></div>
                      {selectedPreset ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-full aspect-square bg-white/5 border-2 border-white/10 mb-6 flex items-center justify-center relative overflow-hidden">
                            <img
                              src="/images/hero.png"
                              alt="Preview"
                              className={cn(
                                "w-full h-full object-cover transition-all duration-500",
                                selectedPreset === "Glitch Noir" &&
                                  "grayscale contrast-150",
                                selectedPreset === "Cyberpunk Neon" &&
                                  "hue-rotate-90 saturate-200",
                                selectedPreset === "Retro 90s Anime" &&
                                  "sepia-[.5] contrast-125",
                                selectedPreset === "Sketch Lineart" &&
                                  "grayscale invert opacity-50",
                                selectedPreset === "Oil Painting" &&
                                  "blur-sm saturate-150",
                              )}
                            />
                            <div className="absolute inset-0 border-4 border-black/20 pointer-events-none"></div>
                          </div>
                          <h4 className="font-black uppercase italic text-primary text-xl tracking-tighter">
                            {selectedPreset}
                          </h4>
                          <p className="text-[10px] font-mono text-white/40 uppercase mt-2 leading-relaxed">
                            Visual paradigm sync active. Neural filters
                            initialized for{" "}
                            {selectedPreset === "AI_DECIDE"
                              ? "Optimal Match"
                              : selectedPreset}
                            .
                          </p>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center opacity-20">
                          <Zap className="w-16 h-16 mb-4" />
                          <p className="font-black uppercase italic text-sm">
                            Select A Style To Preview Output
                          </p>
                        </div>
                      )}

                      {/* Decorative elements */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary/20"></div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20"></div>
                    </div>
                    <div className="bg-white text-black p-4 border-4 border-black font-mono text-[10px] font-bold uppercase italic">
                      "Each style rewrites the visual DNA of your story."
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-between border-b-2 border-white/5 pb-6">
                  <h2 className="text-3xl font-black uppercase italic text-white flex items-center gap-3">
                    <Hammer className="text-primary w-8 h-8" />
                    Final Calibration
                  </h2>
                  <button
                    onClick={() => setStep(3)}
                    className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors flex items-center gap-2 underline underline-offset-4"
                  >
                    <ArrowLeft className="w-3 h-3" /> Re-select Style
                  </button>
                </div>

                <div className="bg-white border-4 border-black p-8 md:p-12 shadow-neo relative overflow-hidden group max-w-4xl mx-auto">
                  <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10 text-black">
                    <div className="flex-1 space-y-6 w-full">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                          Mission_Identifier
                        </label>
                        <input
                          type="text"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          className="w-full bg-transparent border-b-6 border-black text-4xl md:text-5xl font-black uppercase italic outline-none focus:border-primary transition-colors py-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6 font-mono font-bold text-xs uppercase opacity-60">
                        <div className="flex flex-col gap-1">
                          <span>Style_Queued</span>
                          <span className="text-black text-xl font-black">
                            {selectedPreset || "NONE"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span>Compute_Cost</span>
                          <span className="text-secondary text-xl font-black">
                            150_CR
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block">
                      <div className="w-32 h-32 bg-black flex items-center justify-center rotate-12 border-4 border-white shadow-neo">
                        <span className="font-display text-white text-center text-xl leading-tight font-black uppercase italic">
                          READY
                          <br />
                          TO
                          <br />
                          BURN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-[500px] flex flex-col items-center justify-center text-center space-y-12 relative overflow-hidden"
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full animate-pulse" />

                <div className="relative">
                  <div className="w-32 h-32 bg-black border-4 border-primary flex items-center justify-center rotate-45 animate-spin-slow">
                    <Zap className="w-12 h-12 text-primary -rotate-45" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 border-t-4 border-secondary rounded-full animate-spin" />
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                    AI_SYNTHESIS_IN_PROGRESS
                  </h2>
                  <p className="text-primary font-mono text-sm uppercase tracking-[0.3em] h-6">
                    {aiPhases[aiStep]}
                  </p>
                </div>

                <div className="w-full max-w-xl space-y-2 relative z-10">
                  <div className="flex justify-between font-mono text-[10px] text-white/40 uppercase font-black">
                    <span>Cluster_Compute_Load</span>
                    <span>{aiProgress}%</span>
                  </div>
                  <div className="h-4 bg-black border-2 border-white/20 p-1">
                    <div
                      className="h-full bg-primary transition-all duration-100 ease-out"
                      style={{ width: `${aiProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-8 opacity-20 grayscale">
                  <div className="flex flex-col items-center gap-2">
                    <Layers className="w-6 h-6" />
                    <span className="text-[8px] font-mono">PANEL_DECON</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Music className="w-6 h-6" />
                    <span className="text-[8px] font-mono">BEAT_SYNC</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Rocket className="w-6 h-6" />
                    <span className="text-[8px] font-mono">RENDER_ENV</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Controls */}
      <footer
        className={cn(
          "sticky bottom-0 w-full border-t-6 border-black bg-background-dark/95 backdrop-blur-sm p-6 z-40 transition-all duration-500",
          step === 5
            ? "translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100",
        )}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-6">
          <div className="hidden md:flex gap-8 text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  mangaUploaded
                    ? "bg-primary shadow-[0_0_8px_#ccff00]"
                    : "bg-white/20",
                )}
              />
              Manga
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  audioUploaded
                    ? "bg-secondary shadow-[0_0_8px_#ff00ff]"
                    : "bg-white/20",
                )}
              />
              Audio
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  selectedPreset
                    ? "bg-primary shadow-[0_0_8px_#ccff00]"
                    : "bg-white/20",
                )}
              />
              Style
            </div>
          </div>

          <div className="flex gap-6 w-full md:w-auto">
            {step < 4 ? (
              <button
                disabled={
                  step === 1
                    ? !mangaUploaded
                    : step === 2
                      ? !audioUploaded
                      : !selectedPreset
                }
                onClick={() => setStep(step + 1)}
                className="flex-1 md:flex-none h-14 bg-primary text-black font-black uppercase px-12 shadow-hard hover:translate-y-1 hover:shadow-none border-4 border-black flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
              >
                Next Step <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleStartForge}
                disabled={loading}
                className="flex-1 md:flex-none h-14 bg-primary text-black font-black uppercase px-12 shadow-hard hover:translate-y-1 hover:shadow-none border-4 border-black flex items-center justify-center gap-3 active:scale-95"
              >
                <Rocket
                  className={cn("w-6 h-6", loading && "animate-bounce")}
                />
                {loading ? "IGNITING..." : "Ignite Forge"}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
