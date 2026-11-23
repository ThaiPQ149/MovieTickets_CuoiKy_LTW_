import Showtime from "../models/ShowTime.js";
import Movie from "../models/Movie.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import { parseDayRange, formatTimeVN } from "../utils/dateUtils.js";

const formatShowtime = ({ _id, movieId, roomId, startTime, endTime, normalPrice, vipPrice }) => ({
    id: _id,
    movie: movieId,
    room: roomId,
    startTime,
    endTime,
    normalPrice,
    vipPrice
});

const isBlank = (value) => value === undefined || value === null || value === "";

const buildShowtimeData = async ({ movieId, roomId, startTime, normalPrice, vipPrice }) => {
    const errors = {};
    const start = new Date(startTime);
    const normal = Number(normalPrice);
    const vip = Number(vipPrice);

    if (!movieId) errors.movieId = "Vui lòng chọn phim";
    if (!roomId) errors.roomId = "Vui lòng chọn phòng";
    if (!startTime || Number.isNaN(start.getTime())) errors.startTime = "Giờ bắt đầu không hợp lệ";
    if (isBlank(normalPrice) || !Number.isFinite(normal) || normal < 0) {
        errors.normalPrice = "Giá ghế thường không hợp lệ";
    }
    if (isBlank(vipPrice) || !Number.isFinite(vip) || vip < 0) {
        errors.vipPrice = "Giá ghế VIP không hợp lệ";
    }

    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    const [movie, roomExists] = await Promise.all([
        Movie.findById(movieId),
        Room.exists({ _id: roomId })
    ]);

    if (!movie) errors.movieId = "Phim không tồn tại";
    if (!roomExists) errors.roomId = "Phòng không tồn tại";

    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    return {
        values: {
            movieId,
            roomId,
            startTime: start,
            endTime: new Date(start.getTime() + movie.duration * 60000),
            normalPrice: normal,
            vipPrice: vip
        }
    };
};

const findOverlap = (roomId, start, end, excludeId) =>
    Showtime.findOne({
        roomId,
        startTime: { $lt: end },
        endTime: { $gt: start },
        ...(excludeId && { _id: { $ne: excludeId } })
    }).populate("movieId", "title");

const overlapMessage = ({ movieId, startTime, endTime }) =>
    `Phòng đã có suất "${movieId?.title ?? "khác"}" từ ${formatTimeVN(startTime)} đến ${formatTimeVN(endTime)}`;

const fullPopulate = (query) => query.populate("movieId").populate("roomId");

export const getShowtimes = async (req, res) => {
    const { movieId, roomId, date, upcoming } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const filter = {};

    if (movieId) filter.movieId = movieId;
    if (roomId) filter.roomId = roomId;

    const onlyUpcoming = upcoming === "true";
    const now = new Date();

    if (date) {
        const range = parseDayRange(date);
        if (!range) {
            return res.status(400).json({ message: "Ngày không hợp lệ, dùng định dạng YYYY-MM-DD" });
        }
        filter.startTime = {
            $gte: onlyUpcoming && now > range.start ? now : range.start,
            $lt: range.end
        };
    } else if (onlyUpcoming) {
        filter.startTime = { $gte: now };
    }

    const [total, showtimes] = await Promise.all([
        Showtime.countDocuments(filter),
        Showtime.find(filter)
            .sort({ startTime: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("movieId", "title duration poster")
            .populate("roomId", "name")
    ]);

    res.json({
        showtimes: showtimes.map(formatShowtime),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    });
};

export const getShowtimeById = async (req, res) => {
    const showtime = await fullPopulate(Showtime.findById(req.params.id));
    if (!showtime) {
        return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    }
    res.json({ showtime: formatShowtime(showtime) });
};

export const createShowtime = async (req, res) => {
    const { errors, values } = await buildShowtimeData(req.body);

    if (errors) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
    }

    if (values.startTime <= new Date()) {
        return res.status(400).json({
            message: "Dữ liệu không hợp lệ",
            errors: { startTime: "Giờ bắt đầu phải ở tương lai" }
        });
    }

    const overlap = await findOverlap(values.roomId, values.startTime, values.endTime);
    if (overlap) {
        return res.status(409).json({
            message: overlapMessage(overlap),
            errors: { startTime: overlapMessage(overlap) }
        });
    }

    const created = await Showtime.create(values);
    const showtime = await fullPopulate(Showtime.findById(created._id));
    res.status(201).json({ showtime: formatShowtime(showtime) });
};

export const updateShowtime = async (req, res) => {
    const existing = await Showtime.findById(req.params.id);
    if (!existing) {
        return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    }

    if (await Booking.exists({ showtimeId: existing._id })) {
        return res.status(409).json({ message: "Suất chiếu đã có vé, không thể sửa" });
    }

    const { errors, values } = await buildShowtimeData(req.body);
    if (errors) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
    }

    const overlap = await findOverlap(values.roomId, values.startTime, values.endTime, existing._id);
    if (overlap) {
        return res.status(409).json({
            message: overlapMessage(overlap),
            errors: { startTime: overlapMessage(overlap) }
        });
    }

    await Showtime.findByIdAndUpdate(existing._id, values, { runValidators: true });
    const showtime = await fullPopulate(Showtime.findById(existing._id));
    res.json({ showtime: formatShowtime(showtime) });
};

export const deleteShowtime = async (req, res) => {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
        return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    }

    if (await Booking.exists({ showtimeId: showtime._id })) {
        return res.status(409).json({ message: "Suất chiếu đã có vé, không thể xóa" });
    }

    await showtime.deleteOne();
    res.json({ message: "Đã xóa suất chiếu" });
};