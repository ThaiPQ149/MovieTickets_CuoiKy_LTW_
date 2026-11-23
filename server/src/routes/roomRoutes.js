import express from "express";

import {
    getRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
} from "../controllers/roomController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, requireRole("admin"), getRooms);
router.get("/:id", verifyToken, getRoomById);
router.post("/", verifyToken, requireRole("admin"), createRoom);
router.put("/:id", verifyToken, requireRole("admin"), updateRoom);
router.delete("/:id", verifyToken, requireRole("admin"), deleteRoom);

export default router;