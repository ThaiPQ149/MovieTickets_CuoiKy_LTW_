import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    genre: [String],
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    poster: String,
    trailer: String,
    releaseDate: Date,
    status: {
        type: String,
        enum: ["now_showing", "coming_soon"],
        default: "now_showing"
    }
}, {
    timestamps: true
});

movieSchema.index({ title: 1 });
movieSchema.index({ genre: 1 });

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;