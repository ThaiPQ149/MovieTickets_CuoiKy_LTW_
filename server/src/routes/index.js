import express from "express";
import movieRoutes from "./movieRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "MovieTickets API is running"
    });
});

router.use("/movies", movieRoutes);

export default router;