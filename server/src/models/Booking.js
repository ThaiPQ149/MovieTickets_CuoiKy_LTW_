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
    seats: [{
        row: String,
        number: Number,
        type: String,
        price: Number
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "expired"],
        default: "pending"
    },
    bookingDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;