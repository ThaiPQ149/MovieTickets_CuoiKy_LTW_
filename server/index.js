
import dotenv from "dotenv";
dotenv.config();

import app from "./src/App.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server chạy tại http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Không thể khởi chạy Server:", error.message);
        process.exit(1);
    }
};

startServer();