import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Showtime from "../models/ShowTime.js";

// GET /api/bookings/seats/:showtimeId
export const getShowtimeSeats = async (req, res) => {
    try {
        const { showtimeId } = req.params;

        // 1. Kiểm tra ID suất chiếu hợp lệ
        if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
            return res.status(400).json({ message: "Mã suất chiếu không hợp lệ" });
        }

        // 2. Lấy thông tin suất chiếu kèm thông tin phòng chiếu và phim
        const showtime = await Showtime.findById(showtimeId)
            .populate("roomId", "name totalRows seatsPerRow vipRows")
            .populate("movieId", "title poster duration");

        if (!showtime) {
            return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
        }

        const room = showtime.roomId;
        if (!room) {
            return res.status(404).json({ message: "Không tìm thấy phòng chiếu của suất chiếu này" });
        }

        // 3. Lấy danh sách các ghế đã được đặt (status === "confirmed") của suất chiếu này
        const confirmedBookings = await Booking.find({
            showtimeId,
            status: "confirmed"
        }).select("seatKeys");

        // Gom tất cả seatKeys đã bán vào một Set để tra cứu O(1)
        const bookedSeatSet = new Set();
        confirmedBookings.forEach((booking) => {
            booking.seatKeys.forEach((key) => bookedSeatSet.add(key));
        });

        // 4. Tạo sơ đồ ghế dựa trên totalRows (A, B, C...) và seatsPerRow (1, 2, 3...)
        const seats = [];
        for (let r = 0; r < room.totalRows; r++) {
            const rowLetter = String.fromCharCode(65 + r); // 0 -> 'A', 1 -> 'B'...
            const isVipRow = room.vipRows.includes(rowLetter);

            for (let num = 1; num <= room.seatsPerRow; num++) {
                const seatKey = `${rowLetter}${num}`;
                seats.push({
                    seatKey,
                    row: rowLetter,
                    number: num,
                    type: isVipRow ? "vip" : "normal",
                    price: isVipRow ? showtime.vipPrice : showtime.normalPrice,
                    isBooked: bookedSeatSet.has(seatKey)
                });
            }
        }

        // 5. Trả về kết quả chuẩn quy ước
        return res.status(200).json({
            showtime: {
                _id: showtime._id,
                movie: showtime.movieId,
                room: {
                    _id: room._id,
                    name: room.name,
                    totalRows: room.totalRows,
                    seatsPerRow: room.seatsPerRow,
                    vipRows: room.vipRows
                },
                startTime: showtime.startTime,
                endTime: showtime.endTime,
                normalPrice: showtime.normalPrice,
                vipPrice: showtime.vipPrice
            },
            seats
        });
    } catch (error) {
        console.error("Lỗi getShowtimeSeats:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi tải sơ đồ ghế" });
    }
};