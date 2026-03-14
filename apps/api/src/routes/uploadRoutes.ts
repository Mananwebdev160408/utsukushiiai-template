import { Router } from "express";
import { uploadController } from "../controllers";
import { validate, auth } from "../middleware";
import { checkFileSize } from "../middleware/fileSize";
import { directUploadSchema, confirmUploadSchema } from "../utils/validators";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(auth);

router.post(
  "/file/:type",
  upload.single("file"),
  checkFileSize,
  uploadController.uploadFile,
);

router.post(
  "/direct",
  validate(directUploadSchema),
  checkFileSize,
  uploadController.getDirectUploadUrl,
);
router.post(
  "/complete",
  validate(confirmUploadSchema),
  checkFileSize,
  uploadController.confirmUpload,
);

export default router;
