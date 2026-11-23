import express from "express";
import authRoutes from "./authRoutes.js";
import movieRoutes from "./movieRoutes.js";
import roomRoutes from "./roomRoutes.js";
import showtimeRoutes from "./showtimeRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import statsRoutes from "./statsRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "MovieTickets API is running"
    });
});

router.use("/auth", authRoutes);
router.use("/movies", movieRoutes);
router.use("/rooms", roomRoutes);
router.use("/showtimes", showtimeRoutes);
router.use("/bookings", bookingRoutes);
router.use("/stats", statsRoutes);

export default router;