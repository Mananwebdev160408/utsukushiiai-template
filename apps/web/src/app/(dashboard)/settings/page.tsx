"use client";

import { useState } from "react";
import {
  User,
  Cpu,
  Share2,
  CreditCard,
  Lock,
  Settings as SettingsIcon,
  Save,
  Database,
  Key,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

export default function SettingsHubPage() {
  const [activeTab, setActiveTab] = useState("Identity & Profile");
  const { user, fetchMe, isLoading } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const tabs = [
    { id: "personal", name: "Identity & Profile", icon: User },
    { id: "ai", name: "Compute Node (AI)", icon: Cpu },
  ];

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 font-body">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="border-4 border-black dark:border-white bg-[#0a0a0a] p-8 shadow-hard hover:shadow-neo transition-all sticky top-32">
            <div className="flex items-center gap-6 mb-10 border-b-4 border-black dark:border-white pb-6">
              <div
                className="w-20 h-20 border-4 border-black dark:border-white bg-cover bg-center grayscale hover:grayscale-0 transition-all shadow-hard-xs"
                style={{ backgroundImage: `url('${user?.avatar || '/images/avatar.png'}')` }}
              ></div>
              <div>
                <h2 className="font-display font-black text-xl uppercase italic leading-none text-white">
                  {user?.name || "Utsukushii User"}
                </h2>
              </div>
            </div>

            <nav className="flex flex-col gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 font-black font-mono text-[11px] uppercase italic transition-all border-4 text-left group",
                    activeTab === tab.name
                      ? "bg-primary text-black border-black shadow-hard-xs translate-x-2"
                      : "bg-transparent text-white/40 border-transparent hover:border-white/10 hover:text-white",
                  )}
                >
                  <tab.icon
                    className={cn(
                      "w-5 h-5 transition-transform",
                      activeTab === tab.name
                        ? "rotate-12"
                        : "group-hover:rotate-12",
                    )}
                  />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 space-y-12">
          {/* Header Banner */}
          <div className="bg-black border-4 border-black dark:border-white p-8 relative overflow-hidden shadow-[8px_8px_0px_#ff4500]">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <div className="relative z-10">
              <h1 className="font-display font-black text-6xl md:text-8xl text-white uppercase italic tracking-tighter leading-none mb-4 drop-shadow-[4px_4px_0px_#ccff00]">
                Terminal Settings
              </h1>
              <div className="max-w-2xl">
                <p className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] leading-relaxed">
                  Adjust your identity parameters and local neural-node
                  infrastructure.
                </p>
              </div>
            </div>
            {/* Background Decorative Text */}
            <span className="absolute -bottom-10 -right-10 text-[120px] font-black text-white/3 uppercase italic select-none pointer-events-none">
              MATRIX
            </span>
          </div>

          {/* Tab Content Rendering */}
          <div className="min-h-[600px] transition-all duration-300">
            {activeTab === "Identity & Profile" && (
              <section className="bg-surface-dark border-4 border-black p-8 md:p-12 shadow-hard space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center border-b-4 border-white/10 pb-6">
                  <div>
                    <h2 className="font-display font-black text-3xl md:text-4xl uppercase italic text-white tracking-widest">
                      Identity Core
                    </h2>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mt-2">
                      UNIQUE_ID: {user?.id || "N/A"} // NODE: ACTIVE
                    </p>
                  </div>
                  <User className="w-10 h-10 text-primary" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <InputGroup
                    label="System Handle"
                    value={user?.name || ""}
                  />
                  <InputGroup
                    label="Network Interface (Email)"
                    value={user?.email || ""}
                    type="email"
                  />
                  <div className="md:col-span-2">
                    <InputGroup
                      label="Portfolio URL"
                      value="https://portfolio.utsukushii.ai"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block">
                      <span className="font-mono font-black text-[10px] uppercase text-white/40 tracking-[0.4em] mb-4 block italic">
                        Artist Manifesto
                      </span>
                      <textarea
                        className="w-full bg-black border-4 border-white/5 p-6 font-mono text-sm text-white focus:border-primary outline-none focus:bg-primary/5 h-40 resize-none transition-all shadow-inner"
                        defaultValue="Digital artist specializing in cyberpunk aesthetics and AI-generated manga music videos."
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-10 border-t-2 border-white/5">
                  <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest text-center sm:text-left">
                    LAST_LOGIN: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} // {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}_UTC
                  </p>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <button className="flex-1 bg-black text-white border-2 border-white/10 px-6 py-4 font-mono font-bold uppercase text-[10px] tracking-widest hover:border-white/40 transition-all">
                      Reset Profile
                    </button>
                    <button className="flex-2 bg-primary text-black border-4 border-black px-12 py-4 font-display font-black uppercase text-xl italic shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95">
                      Update Identity
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "Compute Node (AI)" && (
              <section className="bg-surface-dark border-4 border-black p-8 md:p-12 shadow-hard space-y-10 border-l-16 border-l-secondary animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center border-b-4 border-white/10 pb-6">
                  <div>
                    <h2 className="font-display font-black text-3xl md:text-4xl uppercase italic text-white tracking-widest">
                      Compute Cluster
                    </h2>
                    <p className="text-[10px] font-mono text-secondary uppercase tracking-widest mt-2">
                      HARDWARE: NVIDIA_RTX_4090 // CUDA: 12.4_READY
                    </p>
                  </div>
                  <Cpu className="w-10 h-10 text-secondary" />
                </div>

                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SettingCard
                      title="GPU Acceleration"
                      description="Utilize local CUDA cores for Stage 1-5 (SAM2, SVD, MiDaS)."
                      enabled={true}
                    />
                    <SettingCard
                      title="Cold Storage Node"
                      description="Automatic mirroring of FFmpeg outputs to local disk volumes."
                      enabled={true}
                    />
                  </div>

                  {/* Model Registry Status */}
                  <div className="bg-black border-4 border-white/5 p-8 space-y-6 shadow-inner">
                    <h3 className="font-display font-black text-xl italic text-white uppercase tracking-tighter flex items-center gap-3">
                      <Database className="w-5 h-5 text-secondary" />{" "}
                      Model_Registry_Active
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          name: "YOLOv12-Manga",
                          status: "READY",
                          size: "1.2 GB",
                        },
                        {
                          name: "SAM2-Hiera-Base",
                          status: "READY",
                          size: "2.4 GB",
                        },
                        {
                          name: "MiDaS-v3-DPT",
                          status: "READY",
                          size: "0.8 GB",
                        },
                        {
                          name: "SVD-Video-Diffusion",
                          status: "READY",
                          size: "5.1 GB",
                        },
                      ].map((model) => (
                        <div
                          key={model.name}
                          className="flex justify-between items-center border-b border-white/10 pb-3"
                        >
                          <div>
                            <p className="font-mono text-[10px] text-white font-bold">
                              {model.name}
                            </p>
                            <p className="font-mono text-[8px] text-white/30 uppercase">
                              {model.size}
                            </p>
                          </div>
                          <span className="bg-green-500/10 text-green-500 text-[8px] px-2 py-0.5 font-black border border-green-500/20">
                            {model.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end mb-4">
                      <label className="font-mono font-black text-[10px] uppercase text-white/40 tracking-[0.4em]">
                        Local_VRAM_Budget
                      </label>
                      <span className="text-2xl font-display font-black text-secondary italic">
                        16 GB
                      </span>
                    </div>
                    <div className="h-6 bg-black border-4 border-white/10 p-1 relative">
                      <div className="h-full bg-secondary w-[66%]" />
                      <input
                        type="range"
                        className="absolute inset-0 w-full h-full bg-transparent accent-white appearance-none cursor-pointer opacity-0"
                        defaultValue={66}
                      />
                    </div>
                  </div>

                  <InputGroup
                    label="Local Project Data Volume (Path)"
                    value="C:/Users/Utsukushii/Projects/Videos"
                  />
                </div>

                <div className="flex justify-end pt-6">
                  <button className="bg-secondary text-black border-4 border-black px-10 py-4 font-display font-black uppercase text-xl italic shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    Re-Init Node
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="font-mono text-[10px] text-white/10 uppercase tracking-[0.5em]">
          ID: USER_ADDR_0x8829_XJA // BUILD_2.4.0_STABLE
        </p>
      </div>
    </main>
  );
}

function InputGroup({
  label,
  value,
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
}) {
  return (
    <label className="block w-full">
      <span className="font-mono font-black text-[10px] uppercase text-white/40 tracking-[0.3em] mb-3 block">
        {label}
      </span>
      <input
        type={type}
        defaultValue={value}
        className="w-full bg-black border-4 border-white/10 p-5 font-mono text-sm text-white focus:border-primary outline-none focus:shadow-neo-sm transition-all uppercase"
      />
    </label>
  );
}

function SettingCard({
  title,
  description,
  enabled,
}: {
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div
      className={cn(
        "p-6 border-4 transition-all group cursor-pointer bg-black/40",
        enabled ? "border-secondary shadow-hard-xs" : "border-white/10",
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-display font-black text-xl italic text-white uppercase leading-none">
          {title}
        </h3>
        <div
          className={cn(
            "w-12 h-7 border-4 relative transition-all",
            enabled
              ? "bg-secondary border-secondary"
              : "bg-zinc-800 border-zinc-700",
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 w-4 h-4 transition-all",
              enabled ? "right-0.5 bg-black" : "left-0.5 bg-zinc-600",
            )}
          ></div>
        </div>
      </div>
      <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
        {description}
      </p>
    </div>
  );
}
