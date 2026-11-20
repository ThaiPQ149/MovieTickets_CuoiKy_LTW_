import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    showtimeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Showtime",
        required: true
    },
    seats: {
        type: [{
            _id: false,
            row: { type: String, required: true },
            number: { type: Number, required: true },
            type: { type: String, enum: ["normal", "vip"], required: true },
            price: { type: Number, required: true }
        }],
        validate: {
            validator: (arr) => arr.length >= 1 && arr.length <= 8,
            message: "Mỗi lần đặt từ 1 đến 8 ghế"
        }
    },
    seatKeys: [String],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["confirmed", "cancelled"],
        default: "confirmed"
    }
}, {
    timestamps: true
});

bookingSchema.pre("validate", function () {
    this.seatKeys = this.seats.map(({ row, number }) => `${row}${number}`);
});

bookingSchema.index(
    { showtimeId: 1, seatKeys: 1 },
    { unique: true, partialFilterExpression: { status: "confirmed" } }
);
bookingSchema.index({ userId: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;