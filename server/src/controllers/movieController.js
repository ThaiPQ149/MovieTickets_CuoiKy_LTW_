import Movie from "../models/Movie.js";
import ShowTime from "../models/ShowTime.js";
import escapeRegex from "../utils/escapeRegex.js";
import { parseDayRange } from "../utils/dateUtils.js";

const VALID_STATUSES = ["now_showing", "coming_soon"];

const normalizeGenres = (genre) => {
  if (Array.isArray(genre)) {
    return [...new Set(genre.map((item) => String(item).trim()).filter(Boolean))];
  }
  if (typeof genre === "string") {
    return [...new Set(genre.split(",").map((item) => item.trim()).filter(Boolean))];
  }
  return [];
};

const validateMoviePayload = (body) => {
  const {
    title = "",
    description = "",
    genre,
    duration,
    poster = "",
    trailer = "",
    releaseDate,
    status = "now_showing"
  } = body || {};

  const errors = {};
  const cleanTitle = typeof title === "string" ? title.trim() : "";
  const cleanDescription = typeof description === "string" ? description.trim() : "";
  const genres = normalizeGenres(genre);
  const parsedDuration = Number(duration);
  const cleanPoster = typeof poster === "string" ? poster.trim() : "";
  const cleanTrailer = typeof trailer === "string" ? trailer.trim() : "";
  const cleanStatus = typeof status === "string" ? status.trim() : "";

  if (!cleanTitle) {
    errors.title = "Vui lòng nhập tên phim";
  }

  if (
    duration === undefined ||
    duration === null ||
    duration === "" ||
    !Number.isInteger(parsedDuration) ||
    parsedDuration < 1
  ) {
    errors.duration = "Thời lượng phim phải là số nguyên lớn hơn hoặc bằng 1 phút";
  }

  if (!VALID_STATUSES.includes(cleanStatus)) {
    errors.status = "Trạng thái phim phải là 'now_showing' hoặc 'coming_soon'";
  }

  let parsedReleaseDate;
  if (releaseDate !== undefined && releaseDate !== null && String(releaseDate).trim() !== "") {
    const d = new Date(releaseDate);
    if (Number.isNaN(d.getTime())) {
      errors.releaseDate = "Ngày khởi chiếu không hợp lệ";
    } else {
      parsedReleaseDate = d;
    }
  }

  return {
    errors,
    values: {
      title: cleanTitle,
      description: cleanDescription,
      genre: genres,
      duration: parsedDuration,
      poster: cleanPoster,
      trailer: cleanTrailer,
      ...(parsedReleaseDate ? { releaseDate: parsedReleaseDate } : {}),
      status: cleanStatus
    }
  };
};

export const getMovies = async (req, res, next) => {
  try {
    const { q = "", genre = "", status = "", date = "" } = req.query;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 6, 1), 100);

    const filter = {};

    if (typeof q === "string" && q.trim()) {
      filter.title = { $regex: escapeRegex(q.trim()), $options: "i" };
    }

    if (typeof genre === "string" && genre.trim()) {
      filter.genre = genre.trim();
    }

    if (typeof status === "string" && VALID_STATUSES.includes(status.trim())) {
      filter.status = status.trim();
    }

    if (typeof date === "string" && date.trim()) {
      const range = parseDayRange(date.trim());
      if (!range) {
        return res.status(400).json({
          message: "Dữ liệu không hợp lệ",
          errors: { date: "Ngày lọc không hợp lệ, dùng định dạng YYYY-MM-DD" }
        });
      }
      const movieIds = await ShowTime.distinct("movieId", {
        startTime: { $gte: range.start, $lt: range.end }
      });
      filter._id = { $in: movieIds };
    }

    const [total, movies] = await Promise.all([
      Movie.countDocuments(filter),
      Movie.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.status(200).json({
      movies,
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    return next(error);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }
    return res.status(200).json({ movie });
  } catch (error) {
    return next(error);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const { errors, values } = validateMoviePayload(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
    }

    const movie = await Movie.create(values);
    return res.status(201).json({ movie });
  } catch (error) {
    return next(error);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const existing = await Movie.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }

    const { errors, values } = validateMoviePayload(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
    }

    const movie = await Movie.findByIdAndUpdate(existing._id, values, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({ movie });
  } catch (error) {
    return next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }

    const hasShowtimes = await ShowTime.exists({ movieId: movie._id });
    if (hasShowtimes) {
      return res.status(409).json({
        message: "Phim đang có suất chiếu, hãy xóa các suất chiếu trước"
      });
    }

    await movie.deleteOne();
    return res.status(200).json({ message: "Đã xóa phim" });
  } catch (error) {
    return next(error);
  }
};