import { Router } from "express";
import { webhookController } from "../controllers";

const router = Router();

// Worker callback endpoint, intentionally unauthenticated for local development.
router.post("/render", webhookController.handleRenderWebhook);

export default router;
