"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  Music,
  CheckCircle,
  X,
  Activity,
  Search,
  Eye,
  Settings,
  Cpu,
  Youtube,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { api } from "@/lib/api/client";

export function AudioUploader({
  projectId,
  ensureProject,
  onUploadComplete,
}: {
  projectId?: string | null;
  ensureProject?: () => Promise<string | null>;
  onUploadComplete?: () => void;
}) {
  const [files, setFiles] = useState<
    {
      name: string;
      size: string;
      status: "completed" | "uploading";
      id?: string;
      bpm?: number;
      algo?: string;
    }[]
  >([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const onUpload = async (file: File) => {
    const activeProjectId = projectId || (await ensureProject?.());
    if (!activeProjectId) {
      throw new Error("Project initialization failed before audio upload");
    }

    const newFile = {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(1) + " MB",
      status: "uploading" as const,
      bpm: 120 + Math.floor(Math.random() * 40),
      algo: "HPSS_TRANS_ALGO",
    };

    setFiles((prev) => [newFile, ...prev]);

    try {
      const res = await api.assets.upload(file, "audio", undefined, activeProjectId);
      if (res.success) {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, status: "completed", id: res.data.id }
              : f,
          ),
        );
      }
    } catch (err) {
      console.error("AUDIO_UPLOAD_ERROR:", err);
    }
    onUploadComplete?.();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(onUpload);
  }, [projectId, ensureProject]);

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(onUpload);
    }
  };

  const handleYoutubeSync = async () => {
    if (!youtubeUrl) return;
    setLoading(true);
    const mockFile = {
      name:
        "YT_STREAM_" +
        Math.random().toString(16).slice(2, 8).toUpperCase() +
        ".mp3",
      size: "12.4 MB",
      status: "uploading" as const,
      bpm: 128,
      algo: "VIRTUAL_STREAM_LINK",
    };
    setFiles((prev) => [mockFile, ...prev]);

    await new Promise((r) => setTimeout(r, 2000));

    setFiles((prev) =>
      prev.map((f) =>
        f.name === mockFile.name ? { ...f, status: "completed" } : f,
      ),
    );
    setYoutubeUrl("");
    setLoading(false);
  };

  return (
    <div className="w-full space-y-12">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative w-full aspect-video md:aspect-[21/9] border-4 border-dashed flex flex-col items-center justify-center gap-6 p-8 transition-all group overflow-hidden cursor-pointer",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-white/10 bg-white/5 hover:border-primary hover:bg-stripes",
        )}
      >
        <div className="w-20 h-20 bg-slate-900 border-2 border-slate-700 flex items-center justify-center group-hover:scale-110 group-hover:border-primary group-hover:bg-primary transition-all duration-300">
          <Activity className="w-10 h-10 text-slate-400 group-hover:text-black" />
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            Audio Track
          </h3>
          <p className="text-slate-400 font-mono text-xs max-w-[300px] uppercase tracking-widest leading-relaxed">
            Drop WAV, FLAC, or MP3 files here.
            <br />
            <span className="text-primary opacity-70">
              Beat Sync Auto-Enabled // SYNC_LOCK_ON
            </span>
          </p>

          <div className="flex flex-col items-center gap-4 mt-6">
            <label className="w-full max-w-[200px] cursor-pointer px-6 py-2 border-2 border-slate-600 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors block text-center">
              Browse Files
              <input
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={handleManualUpload}
              />
            </label>

            <div className="flex items-center gap-4 w-full max-w-[280px]">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-[10px] text-white/20 font-black uppercase italic">
                OR
              </span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="w-full max-w-[320px] flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="YouTube URL..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="flex-1 bg-black border-2 border-white/20 px-4 py-2 font-mono text-[10px] text-white outline-none focus:border-primary"
              />
              <button
                onClick={handleYoutubeSync}
                disabled={loading || !youtubeUrl}
                className="bg-primary text-black font-black uppercase text-[10px] px-6 py-2 border-2 border-black shadow-neo-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-20"
              >
                Sync
              </button>
            </div>

            <div className="flex items-center gap-4 w-full max-w-[280px]">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-[10px] text-white/20 font-black uppercase italic">
                STRATEGIC CHOICE
              </span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <button
              onClick={async () => {
                setLoading(true);
                await new Promise((r) => setTimeout(r, 1500));
                const mockAiFile = {
                  name: "AI_CHOICE_YT_VIBE_CHECK.mp3",
                  size: "8.2 MB",
                  status: "completed" as const,
                  bpm: 142,
                  algo: "AI_YOUTUBE_DISCOVERY",
                };
                setFiles((prev) => [mockAiFile, ...prev]);
                onUploadComplete?.();
                setLoading(false);
              }}
              disabled={loading}
              className="w-full max-w-[320px] bg-secondary text-white font-black uppercase text-xs py-4 border-4 border-black shadow-neo-orange hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 group"
            >
              <Sparkles className="w-5 h-5 group-hover:animate-spin" />
              AI: Discovery from YouTube
            </button>
            <p className="text-[8px] font-mono text-white/40 uppercase tracking-[0.2em]">
              Analyzes manga chapters to find the perfect vibe
            </p>
          </div>
        </div>
      </div>

      {/* Staging Area */}
      <AnimatePresence>
        {files.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase text-white flex items-center gap-2 italic">
                <Music className="w-5 h-5 text-primary" />
                Rhythm Staging
              </h3>
              <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-widest">
                {files.length} {files.length === 1 ? "ITEM" : "ITEMS"} IN QUEUE
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {files.map((file, idx) => (
                <motion.div
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 40, opacity: 0 }}
                  key={idx}
                  className="bg-surface-dark border-4 border-black p-0 flex flex-col md:flex-row shadow-hard-sm relative overflow-hidden group hover:shadow-neo transition-all"
                >
                  <div
                    className={cn(
                      "w-full md:w-3 md:h-auto h-3 transition-colors",
                      file.status === "completed"
                        ? "bg-primary"
                        : "bg-secondary animate-pulse",
                    )}
                  ></div>

                  <div className="md:w-16 w-full flex items-center justify-center bg-black/40 border-b-4 md:border-b-0 md:border-r-4 border-black">
                    <Cpu
                      className={cn(
                        "w-8 h-8",
                        file.status === "completed"
                          ? "text-primary"
                          : "text-secondary animate-spin",
                      )}
                    />
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-between gap-6">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-2xl font-black text-white uppercase italic leading-none">
                            {file.name}
                          </h4>
                          <span className="text-primary text-[10px] font-black bg-primary/10 px-2 py-0.5 mt-2 inline-block border border-primary/20 uppercase tracking-widest italic">
                            Audio Rhythm
                          </span>
                        </div>
                        <button className="text-white/20 hover:text-red-500 transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 font-mono text-[10px] font-black uppercase border-t-2 border-white/5 pt-6 tracking-widest">
                        <div className="flex flex-col">
                          <span className="text-white/40 mb-1">Size</span>
                          <span className="text-white">{file.size}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white/40 mb-1">BPM</span>
                          <span className="text-primary">
                            {file.bpm || "---"} BPM
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white/40 mb-1">Algorithm</span>
                          <span className="text-white">{file.algo}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white/40 mb-1">Status</span>
                          <span
                            className={cn(
                              file.status === "completed"
                                ? "text-primary"
                                : "text-secondary",
                            )}
                          >
                            {file.status === "completed"
                              ? "SYNCED"
                              : "ANALYZING..."}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-6 mt-2">
                      <div className="flex-1 bg-white/5 h-2 border border-white/10 overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-500",
                            file.status === "completed"
                              ? "w-full bg-primary"
                              : "w-1/3 bg-secondary",
                          )}
                        ></div>
                      </div>
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase text-white hover:text-primary transition-colors tracking-widest italic">
                        <Settings className="w-4 h-4" />
                        Configure
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
