import express from "express";

import {
    getShowtimes,
    getShowtimeById,
    createShowtime,
    updateShowtime,
    deleteShowtime
} from "../controllers/showtimeController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getShowtimes);
router.get("/:id", getShowtimeById);
router.post("/", verifyToken, requireRole("admin"), createShowtime);
router.put("/:id", verifyToken, requireRole("admin"), updateShowtime);
router.delete("/:id", verifyToken, requireRole("admin"), deleteShowtime);

export default router;