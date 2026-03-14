import { Router } from "express";
import authRoutes from "./authRoutes";
import projectRoutes from "./projectRoutes";
import panelRoutes from "./panelRoutes";
import renderRoutes from "./renderRoutes";
import uploadRoutes from "./uploadRoutes";
import youtubeRoutes from "./youtubeRoutes";
import webhookRoutes from "./webhookRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/projects", panelRoutes); // Nested routes
router.use("/render", renderRoutes);
router.use("/upload", uploadRoutes);
router.use("/youtube", youtubeRoutes);
router.use("/webhooks", webhookRoutes);

export default router;
