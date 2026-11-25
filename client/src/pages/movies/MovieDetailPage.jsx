import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";

const STATUS_LABELS = {
  now_showing: "Đang chiếu",
  coming_soon: "Sắp chiếu"
};

const styles = {
  backLink: {
    display: "inline-block",
    marginBottom: "12px",
    textDecoration: "underline"
  },
  title: {
    margin: "0 0 16px"
  },

  // Danh sách các dòng thông tin (thời lượng, thể loại, ngày chiếu)
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "32px"
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: 0
  },
  description: {
    margin: 0,
    maxWidth: "70ch",
    lineHeight: 1.6
  },

  // Khối có tiêu đề (Trailer, Suất chiếu)
  section: {
    marginBottom: "32px"
  },
  sectionTitle: {
    margin: "0 0 16px"
  },

  // Khung trailer: giữ tỉ lệ 16:9
  trailerFrame: {
    width: "100%",
    maxWidth: "800px",
    aspectRatio: "16 / 9",
    borderRadius: "var(--radius)",
    overflow: "hidden",
    border: "1px solid var(--border)"
  },
  trailerIframe: {
    width: "100%",
    height: "100%",
    border: 0
  },

  // Lưới suất chiếu: tự chia cột, mỗi cột rộng tối thiểu 320px
  showtimeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "16px"
  },
  showtimeCard: {
    display: "flex",
    justifyContent: "space-between", // giờ bên trái, nút bên phải
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)"
  }
};

// Đổi link YouTube (dạng watch?v=..., youtu.be/..., embed/...) thành link nhúng
const getYoutubeEmbedUrl = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
};

// Đổi chuỗi ngày giờ thành dạng "10:00:00 24/11/2026"
const formatShowtime = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleString("vi-VN");
};

// Một dòng thông tin gồm icon và nội dung
const InfoRow = ({ icon, children }) => (
  <p style={styles.infoRow}>
    <span aria-hidden="true">{icon}</span>
    <span>{children}</span>
  </p>
);

// Một thẻ suất chiếu: giờ chiếu bên trái, nút "Chọn ghế" bên phải
const ShowtimeCard = ({ showtime }) => (
  <div style={styles.showtimeCard}>
    <div>
      <strong>{formatShowtime(showtime.startTime)}</strong>
      {showtime.roomId?.name && (
        <span className="muted"> · {showtime.roomId.name}</span>
      )}
      {typeof showtime.price === "number" && (
        <span className="muted">
          {" "}
          · {showtime.price.toLocaleString("vi-VN")}đ
        </span>
      )}
    </div>

    <Link to={`/booking/${showtime._id}`} className="btn btn-primary">
      Chọn ghế
    </Link>
  </div>
);

const MovieDetailPage = () => {
  const { id } = useParams(); // lấy id phim từ đường dẫn /movies/:id

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0); // đổi số này để tải lại

  // Tải thông tin phim và suất chiếu khi vào trang
  useEffect(() => {
    if (!id) {
      return undefined;
    }

    const controller = new AbortController(); // dùng để hủy request khi rời trang

    const fetchDetail = async () => {
      setLoading(true);
      setError("");

      try {
        // Gọi 2 API cùng lúc cho nhanh.
        // Nếu API suất chiếu lỗi thì coi như chưa có suất nào (trang vẫn hiển thị).
        const [movieRes, showtimeRes] = await Promise.all([
          api.get(`/movies/${id}`, { signal: controller.signal }),
          api
            .get("/showtimes", {
              params: { movieId: id, onlyUpcoming: true },
              signal: controller.signal
            })
            .catch(() => ({ data: { showtimes: [] } }))
        ]);

        setMovie(movieRes.data.movie || null);
        setShowtimes(
          Array.isArray(showtimeRes.data?.showtimes) ? showtimeRes.data.showtimes : []
        );
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.message || "Không tải được chi tiết phim");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => controller.abort();
  }, [id, reloadKey]);

  // Đang tải / bị lỗi / không có phim: hiển thị rồi dừng tại đây
  if (loading) {
    return <Loading text="Đang tải chi tiết phim..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => setReloadKey((prev) => prev + 1)}
      />
    );
  }

  if (!movie) {
    return (
      <EmptyState
        title="Không tìm thấy phim"
        description="Phim này không tồn tại hoặc đã bị xóa."
      >
        <Link to="/" className="btn btn-primary">
          Về danh sách phim
        </Link>
      </EmptyState>
    );
  }

  // Từ đây trở xuống là trường hợp đã có dữ liệu phim
  const embedUrl = getYoutubeEmbedUrl(movie.trailer);
  const hasGenre = Array.isArray(movie.genre) && movie.genre.length > 0;

  return (
    <section>
      <Link to="/" className="muted" style={styles.backLink}>
        ← Quay lại danh sách phim
      </Link>

      <h1 className="page-title" style={styles.title}>
        {movie.title}
      </h1>

      {/* Thông tin phim */}
      <div style={styles.infoList}>
        <InfoRow icon="🕒">
          <span className="muted">
            {STATUS_LABELS[movie.status] || movie.status} · {movie.duration} phút
          </span>
        </InfoRow>

        {hasGenre && (
          <InfoRow icon="🎬">
            <strong>Thể loại:</strong> {movie.genre.join(", ")}
          </InfoRow>
        )}

        {movie.releaseDate && (
          <InfoRow icon="📅">
            <strong>Ngày khởi chiếu:</strong>{" "}
            {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
          </InfoRow>
        )}

        <p style={styles.description}>
          {movie.description || "Chưa có mô tả cho phim này."}
        </p>
      </div>

      {/* Trailer: chỉ hiện khi phim có link trailer hợp lệ */}
      {embedUrl && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Trailer</h2>
          <div style={styles.trailerFrame}>
            <iframe
              src={embedUrl}
              title={`Trailer ${movie.title}`}
              style={styles.trailerIframe}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Suất chiếu */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Suất chiếu</h2>

        {showtimes.length === 0 ? (
          <p className="muted">Hiện chưa có suất chiếu sắp tới cho phim này.</p>
        ) : (
          <div style={styles.showtimeGrid}>
            {showtimes.map((showtime) => (
              <ShowtimeCard key={showtime._id} showtime={showtime} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MovieDetailPage;
