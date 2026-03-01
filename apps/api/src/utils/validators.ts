import { z } from "zod";

// Auth
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric"),
  displayName: z.string().min(1).max(50),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Projects
export const createProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  settings: z
    .object({
      resolution: z.enum(["720x1280", "1080x1920", "1440x2560"]).optional(),
      fps: z.enum([24, 30, 60] as const).optional(),
      quality: z.enum(["draft", "standard", "high", "ultra"]).optional(),
    })
    .optional(),
});

// Panels
export const bboxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
});

export const createPanelSchema = z.object({
  pageIndex: z.number().int().min(0),
  order: z.number().int().min(0),
  bbox: bboxSchema,
});

export const updatePanelSchema = z.object({
  bbox: bboxSchema.optional(),
  order: z.number().int().min(0).optional(),
  effects: z
    .object({
      parallax: z.number().min(0).max(1).optional(),
      glow: z.boolean().optional(),
      glitch: z.boolean().optional(),
      blur: z.number().min(0).max(20).optional(),
    })
    .optional(),
  transitions: z
    .array(
      z.object({
        type: z.enum([
          "none",
          "fade",
          "slide-left",
          "slide-right",
          "slide-up",
          "slide-down",
          "zoom",
          "glitch",
        ]),
        duration: z.number().min(0.1).max(5),
        beatId: z.string().optional(),
        easing: z
          .enum(["linear", "ease-in", "ease-out", "ease-in-out"])
          .default("ease-in-out"),
      }),
    )
    .optional(),
});

// Render
export const startRenderSchema = z.object({
  projectId: z.string().min(1),
  settings: z
    .object({
      quality: z.enum(["draft", "standard", "high", "ultra"]).default("high"),
      resolution: z.string().default("1080x1920"),
      fps: z.number().default(30),
      format: z.enum(["mp4", "webm"]).default("mp4"),
      effects: z
        .object({
          glow: z.boolean().default(true),
          glitch: z.boolean().default(false),
          parallax: z.boolean().default(true),
        })
        .optional(),
    })
    .optional(),
});

// Upload
export const directUploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.enum(["manga", "audio", "images"]),
  projectId: z.string().min(1),
});

export const confirmUploadSchema = z.object({
  fileUrl: z.string().min(1),
  projectId: z.string().min(1),
  type: z.enum(["manga", "audio"]),
});

// YouTube
export const youtubeDownloadSchema = z.object({
  url: z.string().url("Invalid YouTube URL"),
  projectId: z.string().min(1),
});
