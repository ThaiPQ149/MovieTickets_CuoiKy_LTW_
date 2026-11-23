import Booking from "../models/Booking.js";
import { parseDayRange } from "../utils/dateUtils.js";

export const getRevenue = async (req, res) => {
    const { from, to } = req.query;
    const match = { status: "confirmed" };

    if (from || to) {
        match.createdAt = {};

        if (from) {
            const range = parseDayRange(from);
            if (!range) {
                return res.status(400).json({ message: "Ngày bắt đầu không hợp lệ, dùng YYYY-MM-DD" });
            }
            match.createdAt.$gte = range.start;
        }

        if (to) {
            const range = parseDayRange(to);
            if (!range) {
                return res.status(400).json({ message: "Ngày kết thúc không hợp lệ, dùng YYYY-MM-DD" });
            }
            match.createdAt.$lt = range.end;
        }
    }

    const [byMovie, byDate] = await Promise.all([
        Booking.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "showtimes",
                    localField: "showtimeId",
                    foreignField: "_id",
                    as: "showtime"
                }
            },
            { $unwind: "$showtime" },
            {
                $group: {
                    _id: "$showtime.movieId",
                    revenue: { $sum: "$totalPrice" },
                    tickets: { $sum: { $size: "$seats" } },
                    bookings: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "movies",
                    localField: "_id",
                    foreignField: "_id",
                    as: "movie"
                }
            },
            { $unwind: "$movie" },
            {
                $project: {
                    _id: 0,
                    movieId: "$_id",
                    title: "$movie.title",
                    revenue: 1,
                    tickets: 1,
                    bookings: 1
                }
            },
            { $sort: { revenue: -1 } }
        ]),
        Booking.aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                    revenue: { $sum: "$totalPrice" },
                    tickets: { $sum: { $size: "$seats" } },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    revenue: 1,
                    tickets: 1,
                    bookings: 1
                }
            }
        ])
    ]);

    const totals = byDate.reduce(
        (sum, { revenue, tickets, bookings }) => ({
            revenue: sum.revenue + revenue,
            tickets: sum.tickets + tickets,
            bookings: sum.bookings + bookings
        }),
        { revenue: 0, tickets: 0, bookings: 0 }
    );

    res.json({ byMovie, byDate, totals });
};