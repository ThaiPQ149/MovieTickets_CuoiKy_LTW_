import express from "express";
import Movie from "../models/Movie.js";

const router = express.Router();

// Lấy danh sách phim
router.get("/", async (req, res, next) => {
    try {
        const movies = await Movie.find();

        res.status(200).json({
            success: true,
            data: movies
        });
    } catch (error) {
        next(error);
    }
});

export default router;