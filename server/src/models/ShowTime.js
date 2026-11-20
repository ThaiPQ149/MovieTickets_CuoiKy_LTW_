import mongoose from "mongoose";

const showtimeSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    normalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    vipPrice: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

showtimeSchema.index({ roomId: 1, startTime: 1, endTime: 1 });
showtimeSchema.index({ movieId: 1, startTime: 1 });

const Showtime = mongoose.model("Showtime", showtimeSchema);

export default Showtime;