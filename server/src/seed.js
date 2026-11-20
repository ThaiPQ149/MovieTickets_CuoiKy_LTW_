import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Movie from "./models/Movie.js";
import Room from "./models/Room.js";
import Showtime from "./models/ShowTime.js";
import Booking from "./models/Booking.js";

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    await Promise.all([
        User.deleteMany(),
        Movie.deleteMany(),
        Room.deleteMany(),
        Showtime.deleteMany(),
        Booking.deleteMany()
    ]);
    await Booking.syncIndexes();

    const password = await bcrypt.hash("123456", 10);
    await User.create([
        { name: "Admin", email: "admin@example.com", password, role: "admin" },
        { name: "Thành viên A", email: "user@example.com", password, role: "user" }
    ]);

    const movies = await Movie.create([
        { title: "Hành Tinh Cuối Cùng", genre: ["Khoa học viễn tưởng", "Phiêu lưu"], duration: 120, status: "now_showing", releaseDate: new Date("2026-10-01"), description: "Phim mẫu 1", poster: "", trailer: "" },
        { title: "Mùa Hè Năm Ấy", genre: ["Tình cảm", "Chính kịch"], duration: 105, status: "now_showing", releaseDate: new Date("2026-10-15"), description: "Phim mẫu 2", poster: "", trailer: "" },
        { title: "Đêm Không Ngủ", genre: ["Kinh dị"], duration: 95, status: "now_showing", releaseDate: new Date("2026-11-01"), description: "Phim mẫu 3", poster: "", trailer: "" },
        { title: "Siêu Nhân Nhí", genre: ["Hoạt hình", "Gia đình"], duration: 90, status: "coming_soon", releaseDate: new Date("2026-12-20"), description: "Phim mẫu 4", poster: "", trailer: "" }
    ]);

    const rooms = await Room.create([
        { name: "Phòng 1", totalRows: 8, seatsPerRow: 10, vipRows: ["E", "F"] },
        { name: "Phòng 2", totalRows: 6, seatsPerRow: 8, vipRows: ["D"] }
    ]);

    const nowShowing = movies.filter(({ status }) => status === "now_showing");
    const hours = [10, 14, 18, 21];
    const showtimes = [];

    for (let day = 1; day <= 3; day += 1) {
        hours.forEach((hour, index) => {
            const movie = nowShowing[(day + index) % nowShowing.length];
            const room = rooms[index % rooms.length];
            const startTime = new Date();
            startTime.setDate(startTime.getDate() + day);
            startTime.setHours(hour, 0, 0, 0);

            showtimes.push({
                movieId: movie._id,
                roomId: room._id,
                startTime,
                endTime: new Date(startTime.getTime() + movie.duration * 60000),
                normalPrice: 80000,
                vipPrice: 120000
            });
        });
    }
    await Showtime.create(showtimes);

    console.log("Seed xong. Tài khoản: admin@example.com / user@example.com, mật khẩu 123456");
    await mongoose.disconnect();
};

seed().catch((error) => {
    console.error(error);
    process.exit(1);
});