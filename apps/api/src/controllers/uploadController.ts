import { Request, Response, NextFunction } from "express";
import { storageService, projectService } from "../services";
import { generateId } from "../utils";

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const type = req.params.type as "manga" | "audio" | "images";
    const { projectId, chapterNumber, chapterTitle } = req.body;

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "file is required",
      });
    }

    await projectService.getProject(userId, projectId);

    const fileUrl = await storageService.saveFile(
      type,
      req.file.originalname,
      req.file.buffer,
    );

    if (type === "manga") {
      await projectService.updateProject(userId, projectId, {
        $push: {
          mangaChapters: {
            id: generateId("file"),
            chapterNumber: chapterNumber ? parseInt(chapterNumber, 10) : 1,
            title: chapterTitle || `Chapter ${chapterNumber || 1}`,
            fileUrl,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
          },
        },
        $set: {
          status: "processing",
        },
      });
    } else if (type === "audio") {
      await projectService.updateProject(userId, projectId, {
        audioInfo: {
          fileUrl,
          originalName: req.file.originalname,
        },
      });
    }

    res.status(201).json({
      status: "success",
      data: {
        id: generateId("file"),
        fileUrl,
        originalName: req.file.originalname,
        chapterNumber: chapterNumber ? parseInt(chapterNumber, 10) : undefined,
        chapterTitle,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDirectUploadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { folder, filename } = req.body;
    const result = await storageService.getDirectUploadUrl(folder, filename);
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const confirmUpload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const {
      projectId,
      fileUrl,
      type,
      chapterNumber,
      chapterTitle,
      mimeType,
      size,
    } = req.body;

    if (type === "manga") {
      const chapter = {
        id: `chap_${Date.now()}`,
        chapterNumber: chapterNumber || 1,
        title: chapterTitle || `Chapter ${chapterNumber || 1}`,
        fileUrl,
        originalName: fileUrl.split("/").pop() || "unknown",
        mimeType: mimeType || "application/pdf",
        size: size || 0,
      };

      await projectService.updateProject(userId, projectId, {
        $push: { mangaChapters: chapter },
        $set: { status: "processing" }, // Auto-trigger processing on new chapter
      });
    } else if (type === "audio") {
      await projectService.updateProject(userId, projectId, {
        audioInfo: {
          fileUrl,
          originalName: fileUrl.split("/").pop() || "unknown",
        },
      });
    }

    res.status(200).json({ status: "success", message: "Upload confirmed" });
  } catch (error) {
    next(error);
  }
};
