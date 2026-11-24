import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import useDebounce from "../../hooks/useDebounce";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";

const STATUS_LABELS = {
  now_showing: "Đang chiếu",
  coming_soon: "Sắp chiếu"
};

// Chiều cao chung cho ô "Trạng thái" và nút "Xóa bộ lọc".
// Muốn chỉnh to nhỏ, chỉ cần đổi số này.
const CONTROL_HEIGHT = "46px";

const styles = {
  // ----- Tiêu đề -----
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "16px"
  },

  // ----- Thanh bộ lọc -----
  filterBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    alignItems: "start",
    marginBottom: "24px"
  },
  // Dùng chung cho mỗi cột có "nhãn trên, ô bên dưới"
  column: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  label: {
    fontWeight: 600
  },
  select: {
    boxSizing: "border-box",
    width: "100%",
    height: CONTROL_HEIGHT,
    padding: "9px 12px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    font: "inherit"
  },
  // Nhãn ẩn, chỉ để đẩy nút "Xóa bộ lọc" xuống ngang hàng với các ô khác
  hiddenLabel: {
    visibility: "hidden",
    fontWeight: 600
  },
  resetButton: {
    height: CONTROL_HEIGHT,
    width: "100%"
  },

  // ----- Danh sách phim -----
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "24px"
  },
  card: {
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden"
  },
  poster: {
    width: "100%",
    height: "320px",
    objectFit: "cover",
    display: "block"
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    padding: "16px",
    gap: "8px"
  },
  cardTitle: {
    fontSize: "1.15rem",
    margin: 0
  },
  cardButton: {
    marginTop: "auto",
    textAlign: "center"
  }
};

// Một thẻ phim (tách riêng cho dễ đọc)
const MovieCard = ({ movie }) => (
  <article style={styles.card}>
    {movie.poster && (
      <img src={movie.poster} alt={movie.title} style={styles.poster} />
    )}

    <div style={styles.cardBody}>
      <h2 style={styles.cardTitle}>{movie.title}</h2>

      <p className="muted">
        {STATUS_LABELS[movie.status] || movie.status} · {movie.duration} phút
      </p>

      {Array.isArray(movie.genre) && movie.genre.length > 0 && (
        <p>{movie.genre.join(", ")}</p>
      )}

      <Link
        to={`/movies/${movie._id}`}
        className="btn btn-primary"
        style={styles.cardButton}
      >
        Xem chi tiết & suất chiếu
      </Link>
    </div>
  </article>
);

const MovieListPage = () => {
  // Giá trị các ô bộ lọc
  const [searchText, setSearchText] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  // Dữ liệu từ server
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Trạng thái tải
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0); // đổi số này để tải lại

  // Chờ 400ms sau khi người dùng ngừng gõ mới gọi API
  const debouncedQ = useDebounce(searchText, 400);

  // Gọi API mỗi khi bộ lọc hoặc trang thay đổi
  useEffect(() => {
    const controller = new AbortController(); // dùng để hủy request cũ

    const fetchMovies = async () => {
      setLoading(true);
      setError("");

      try {
        // Chỉ gửi những bộ lọc có giá trị
        const params = { page, limit: 6 };
        if (debouncedQ.trim()) params.q = debouncedQ.trim();
        if (genre.trim()) params.genre = genre.trim();
        if (status) params.status = status;
        if (date) params.date = date;

        const { data } = await api.get("/movies", {
          params,
          signal: controller.signal
        });

        setMovies(Array.isArray(data.movies) ? data.movies : []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.message || "Không tải được danh sách phim");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchMovies();

    // Khi bộ lọc đổi tiếp, hủy request đang chạy
    return () => controller.abort();
  }, [debouncedQ, genre, status, date, page, reloadKey]);

  // Tạo hàm xử lý cho một ô bộ lọc: lưu giá trị mới và quay về trang 1
  const handleFilterChange = (setValue) => (e) => {
    setValue(e.target.value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setGenre("");
    setStatus("");
    setDate("");
    setPage(1);
  };

  return (
    <section>
      <div style={styles.header}>
        <h1 className="page-title">Danh sách phim</h1>
        <p className="muted">Tổng số phim: {total}</p>
      </div>

      {/* Thanh bộ lọc */}
      <div style={styles.filterBar}>
        <Input
          label="Tìm theo tên phim"
          type="search"
          placeholder="Nhập tên phim..."
          value={searchText}
          onChange={handleFilterChange(setSearchText)}
        />

        <Input
          label="Thể loại"
          type="text"
          placeholder="VD: Hành động"
          value={genre}
          onChange={handleFilterChange(setGenre)}
        />

        <div style={styles.column}>
          <label htmlFor="movie-status-filter" style={styles.label}>
            Trạng thái
          </label>
          <select
            id="movie-status-filter"
            style={styles.select}
            value={status}
            onChange={handleFilterChange(setStatus)}
          >
            <option value="">Tất cả</option>
            <option value="now_showing">Đang chiếu</option>
            <option value="coming_soon">Sắp chiếu</option>
          </select>
        </div>

        <Input
          label="Ngày chiếu"
          type="date"
          value={date}
          onChange={handleFilterChange(setDate)}
        />

        <div style={styles.column}>
          <span style={styles.hiddenLabel} aria-hidden="true">
            &nbsp;
          </span>
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            style={styles.resetButton}
          >
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {/* Các trạng thái hiển thị */}
      {loading && <Loading text="Đang tải danh sách phim..." />}

      {!loading && error && (
        <ErrorMessage
          message={error}
          onRetry={() => setReloadKey((prev) => prev + 1)}
        />
      )}

      {!loading && !error && movies.length === 0 && (
        <EmptyState
          title="Không tìm thấy phim phù hợp"
          description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."
        >
          <Button variant="ghost" onClick={handleResetFilters}>
            Đặt lại bộ lọc
          </Button>
        </EmptyState>
      )}

      {!loading && !error && movies.length > 0 && (
        <>
          <div style={styles.grid}>
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        </>
      )}
    </section>
  );
};

export default MovieListPage;
