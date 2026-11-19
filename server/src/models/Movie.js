import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    genre: [String],
    duration: Number,
    poster: String,
    trailer: String,
    releaseDate: Date
}, {
    timestamps: true
});

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;