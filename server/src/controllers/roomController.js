import Room from "../models/Room.js";
import Showtime from "../models/ShowTime.js";
import Booking from "../models/Booking.js";
import { getRowLabels } from "../utils/seatLayout.js";
import escapeRegex from "../utils/escapeRegex.js";

const validateRoom = ({ name, totalRows, seatsPerRow, vipRows }) => {
    const errors = {};
    const rows = Number(totalRows);
    const seats = Number(seatsPerRow);
    const cleanName = typeof name === "string" ? name.trim() : "";
    const vip = Array.isArray(vipRows)
        ? [...new Set(vipRows.map((row) => String(row).trim().toUpperCase()).filter(Boolean))]
        : [];

    if (!cleanName) {
        errors.name = "Vui lòng nhập tên phòng";
    }
    if (!Number.isInteger(rows) || rows < 1 || rows > 26) {
        errors.totalRows = "Số hàng phải là số nguyên từ 1 đến 26";
    }
    if (!Number.isInteger(seats) || seats < 1 || seats > 30) {
        errors.seatsPerRow = "Số ghế mỗi hàng phải là số nguyên từ 1 đến 30";
    }
    if (!errors.totalRows) {
        const labels = getRowLabels(rows);
        const invalid = vip.filter((row) => !labels.includes(row));
        if (invalid.length > 0) {
            errors.vipRows = `Hàng VIP không hợp lệ: ${invalid.join(", ")}`;
        }
    }

    return {
        errors,
        values: { name: cleanName, totalRows: rows, seatsPerRow: seats, vipRows: vip }
    };
};

const roomHasBookings = async (roomId) => {
    const showtimeIds = await Showtime.distinct("_id", { roomId });
    if (showtimeIds.length === 0) {
        return false;
    }
    return Boolean(await Booking.exists({ showtimeId: { $in: showtimeIds }, status: "confirmed" }));
};

const withTotalSeats = (room) => ({
    ...room.toObject(),
    totalSeats: room.totalRows * room.seatsPerRow
});

export const getRooms = async (req, res) => {
    const { q } = req.query;
    const filter = {};

    if (typeof q === "string" && q.trim()) {
        filter.name = { $regex: escapeRegex(q.trim()), $options: "i" };
    }

    const rooms = await Room.find(filter).sort({ name: 1 });
    res.json({ rooms: rooms.map(withTotalSeats) });
};

export const getRoomById = async (req, res) => {
    const room = await Room.findById(req.params.id);
    if (!room) {
        return res.status(404).json({ message: "Không tìm thấy phòng chiếu" });
    }
    res.json({ room: withTotalSeats(room) });
};

export const createRoom = async (req, res) => {
    const { errors, values } = validateRoom(req.body);

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
    }

    if (await Room.exists({ name: values.name })) {
        return res.status(409).json({
            message: "Tên phòng đã tồn tại",
            errors: { name: "Tên phòng đã tồn tại" }
        });
    }

    const room = await Room.create(values);
    res.status(201).json({ room: withTotalSeats(room) });
};

export const updateRoom = async (req, res) => {
    const room = await Room.findById(req.params.id);
    if (!room) {
        return res.status(404).json({ message: "Không tìm thấy phòng chiếu" });
    }

    const { errors, values } = validateRoom(req.body);
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
    }

    if (await Room.exists({ name: values.name, _id: { $ne: room._id } })) {
        return res.status(409).json({
            message: "Tên phòng đã tồn tại",
            errors: { name: "Tên phòng đã tồn tại" }
        });
    }

    const layoutChanged =
        room.totalRows !== values.totalRows ||
        room.seatsPerRow !== values.seatsPerRow ||
        [...room.vipRows].sort().join(",") !== [...values.vipRows].sort().join(",");

    if (layoutChanged && (await roomHasBookings(room._id))) {
        return res.status(409).json({
            message: "Phòng đã có vé được đặt, không thể đổi sơ đồ ghế"
        });
    }

    const updated = await Room.findByIdAndUpdate(room._id, values, {
        new: true,
        runValidators: true
    });
    res.json({ room: withTotalSeats(updated) });
};

export const deleteRoom = async (req, res) => {
    const room = await Room.findById(req.params.id);
    if (!room) {
        return res.status(404).json({ message: "Không tìm thấy phòng chiếu" });
    }

    if (await Showtime.exists({ roomId: room._id })) {
        return res.status(409).json({
            message: "Phòng đang có suất chiếu, hãy xóa các suất chiếu trước"
        });
    }

    await room.deleteOne();
    res.json({ message: "Đã xóa phòng chiếu" });
};