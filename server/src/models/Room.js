import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    totalRows: {
        type: Number,
        required: true
    },
    seatsPerRow: {
        type: Number,
        required: true
    },
    seatConfiguration: [{
        row: String,
        number: Number,
        type: {
            type: String,
            enum: ["normal", "vip"],
            default: "normal"
        }
    }]
}, {
    timestamps: true
});

const Room = mongoose.model("Room", roomSchema);

export default Room;