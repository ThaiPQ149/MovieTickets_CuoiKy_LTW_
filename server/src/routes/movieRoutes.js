import express from "express";
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} from "../controllers/movieController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getMovies);
router.get("/:id", getMovieById);

router.post("/", verifyToken, requireRole("admin"), createMovie);
router.put("/:id", verifyToken, requireRole("admin"), updateMovie);
router.patch("/:id", verifyToken, requireRole("admin"), updateMovie);
router.delete("/:id", verifyToken, requireRole("admin"), deleteMovie);

export default router;