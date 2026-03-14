import { Request, Response, NextFunction } from "express";

const UPLOAD_LIMITS = {
  manga: 100 * 1024 * 1024, // 100MB
  audio: 50 * 1024 * 1024, // 50MB
  images: 10 * 1024 * 1024, // 10MB
  other: 5 * 1024 * 1024, // 5MB default
};

export const checkFileSize = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // If we're handling direct uploads where the client sends the size
  const declaredSize = req.body?.size || req.query?.size;
  const fileType = req.body?.type || req.query?.type || req.params?.type || "other";

  // Check declared size for direct uploads (e.g. presigned URLs)
  if (declaredSize) {
    const size = parseInt(declaredSize as string, 10);
    const limit: number =
      UPLOAD_LIMITS[fileType as keyof typeof UPLOAD_LIMITS] ||
      UPLOAD_LIMITS.other;

    if (size > limit) {
      return res.status(413).json({
        status: "error",
        code: "FILE_TOO_LARGE",
        message: `File exceeds maximum allowed size of ${limit / (1024 * 1024)}MB for type: ${fileType}`,
      });
    }
  }

  // Check actual multer file if present
  if (req.file) {
    // Assuming type could come from request body or fieldname
    const type =
      req.body.type ||
      req.params?.type ||
      (req.file.fieldname.includes("audio") ? "audio" : "manga");
    const limit =
      UPLOAD_LIMITS[type as keyof typeof UPLOAD_LIMITS] || UPLOAD_LIMITS.other;

    if (req.file.size > limit) {
      return res.status(413).json({
        status: "error",
        code: "FILE_TOO_LARGE",
        message: `File exceeds maximum allowed size of ${limit / (1024 * 1024)}MB`,
      });
    }
  }

  next();
};
