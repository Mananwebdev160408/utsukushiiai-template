"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  CheckCircle,
  X,
  Layers,
  FileText,
  Search,
  Eye,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { api } from "@/lib/api/client";

export function MangaUploader({
  projectId,
  ensureProject,
  onUploadComplete,
}: {
  projectId?: string | null;
  ensureProject?: () => Promise<string | null>;
  onUploadComplete?: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<
    {
      name: string;
      size: string;
      status: "completed" | "uploading";
      id?: string;
      pages?: number;
      res?: string;
    }[]
  >([]);

  const onUpload = async (file: File) => {
    const activeProjectId = projectId || (await ensureProject?.());
    if (!activeProjectId) {
      throw new Error("Project initialization failed before manga upload");
    }

    // Determine next chapter number
    const nextChapterNumber = files.length + 1;

    const newFile = {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(1) + " MB",
      status: "uploading" as const,
      pages: Math.floor(Math.random() * 200) + 50,
      res: "2048px Width",
      chapterNumber: nextChapterNumber,
      chapterTitle: `Chapter ${nextChapterNumber}`,
    };

    setFiles((prev) => [newFile, ...prev]);

    try {
      const res = await api.assets.upload(file, "manga", {
        number: nextChapterNumber,
        title: newFile.chapterTitle,
      }, activeProjectId);
      if (res.success) {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? {
                  ...f,
                  status: "completed",
                  id: res.data.id,
                  chapterNumber: res.data.chapterNumber,
                }
              : f,
          ),
        );
        onUploadComplete?.();
      }
    } catch (err) {
      console.error("UPLOAD_ERROR:", err);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(onUpload);
  }, [files.length, projectId, ensureProject]);

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(onUpload);
    }
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
            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-stripes",
        )}
      >
        <div className="w-20 h-20 bg-slate-900 border-2 border-slate-700 flex items-center justify-center group-hover:scale-110 group-hover:border-primary group-hover:bg-primary transition-all duration-300">
          <FileText className="w-10 h-10 text-slate-400 group-hover:text-black" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            Manga Source
          </h3>
          <p className="text-slate-400 font-mono text-xs max-w-[300px] uppercase tracking-widest leading-relaxed">
            Drop PDF, ZIP, or CBZ files here.
            <br />
            <span className="text-primary opacity-70">
              Supports High-Res Scans // AUTO_LAYER_ENABLED
            </span>
          </p>
        </div>

        <label className="cursor-pointer px-6 py-2 border-2 border-slate-600 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
          Browse Mission Files
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleManualUpload}
          />
        </label>
      </div>

      {/* Staging Area */}
      <AnimatePresence>
        {files.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase text-white flex items-center gap-2 italic">
                <Layers className="w-5 h-5 text-primary" />
                Staging Area
              </h3>
              <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-widest">
                {files.length} {files.length === 1 ? "ITEM" : "ITEMS"} QUEUED
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

                  <div
                    className="md:w-48 w-full aspect-video md:aspect-auto bg-cover bg-center border-b-4 md:border-b-0 md:border-r-4 border-black relative"
                    style={{ backgroundImage: "url('/images/hero.png')" }}
                  >
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="bg-white text-black p-2 hover:bg-primary transition-colors border-2 border-black shadow-[3px_3px_0px_#000]">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-between gap-6">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-2xl font-black text-white uppercase italic leading-none">
                            {(file as any).chapterTitle || file.name}
                          </h4>
                          <span className="text-primary text-[10px] font-black bg-primary/10 px-2 py-0.5 mt-2 inline-block border border-primary/20 uppercase tracking-widest italic">
                            Chapter {(file as any).chapterNumber} // Source
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
                          <span className="text-white/40 mb-1">Pages</span>
                          <span className="text-white">{file.pages}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white/40 mb-1">Res</span>
                          <span className="text-white">{file.res}</span>
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
                              ? "READY"
                              : "UPLOADING..."}
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
                              : "w-1/2 bg-secondary",
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
