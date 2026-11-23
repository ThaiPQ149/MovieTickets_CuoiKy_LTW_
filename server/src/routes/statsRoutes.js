import express from "express";
import { getRevenue } from "../controllers/statsController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/revenue", verifyToken, requireRole("admin"), getRevenue);

export default router;