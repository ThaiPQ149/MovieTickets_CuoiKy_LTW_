import express from "express";
import { getShowtimeSeats } from "../controllers/bookingController.js";

const router = express.Router();

// Lấy trạng thái sơ đồ ghế theo suất chiếu (không bắt buộc đăng nhập để khách xem được ghế)
router.get("/seats/:showtimeId", getShowtimeSeats);

export default router;