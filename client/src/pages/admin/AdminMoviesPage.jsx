import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

const EMPTY_FORM = {
  title: "",
  description: "",
  genreText: "",
  duration: "",
  poster: "",
  trailer: "",
  releaseDate: "",
  status: "now_showing"
};

const STATUS_LABELS = {
  now_showing: "Đang chiếu",
  coming_soon: "Sắp chiếu"
};

// Màu của nhãn trạng thái: xanh cho "Đang chiếu", cam cho "Sắp chiếu"
const STATUS_COLORS = {
  now_showing: "#22c55e",
  coming_soon: "#f59e0b"
};

const styles = {
  title: {
    margin: "0 0 16px"
  },
  addButtonWrap: {
    marginBottom: "24px"
  },

  // Lưới thẻ phim: tự chia cột, mỗi cột rộng tối thiểu 360px
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: "20px"
  },
  card: {
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden"
  },
  cardBody: {
    flex: 1,
    padding: "20px"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between", // tên phim bên trái, nhãn trạng thái bên phải
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "12px"
  },
  cardTitle: {
    fontSize: "1.25rem",
    margin: 0
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: "0.85rem",
    fontWeight: 600,
    whiteSpace: "nowrap"
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "8px 0 0"
  },
  cardFooter: {
    display: "flex",
    justifyContent: "flex-end", // đẩy nút Sửa / Xóa sang phải
    gap: "12px",
    padding: "16px 20px",
    borderTop: "1px solid var(--border)"
  }
};

const formatDateInput = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
};

// Một dòng thông tin gồm icon và nội dung
const InfoRow = ({ icon, children }) => (
  <p style={styles.infoRow}>
    <span aria-hidden="true">{icon}</span>
    <span>{children}</span>
  </p>
);

// Một thẻ phim trong danh sách quản lý
const MovieCard = ({ movie, onEdit, onDelete }) => {
  const color = STATUS_COLORS[movie.status] || "#9ca3af";
  const genreText = Array.isArray(movie.genre) ? movie.genre.join(", ") : "";

  return (
    <article style={styles.card}>
      <div style={styles.cardBody}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>{movie.title}</h2>

          {/* Nhãn trạng thái: nền là màu nhạt (thêm "26" vào mã màu = độ mờ 15%) */}
          <span
            style={{
              ...styles.badge,
              color,
              background: `${color}26`,
              border: `1px solid ${color}`
            }}
          >
            {STATUS_LABELS[movie.status] || movie.status}
          </span>
        </div>

        <InfoRow icon="🎭">
          <span className="muted">Thể loại:</span> {genreText || "Chưa cập nhật"}
        </InfoRow>
        <InfoRow icon="🕒">
          <span className="muted">Thời lượng:</span> {movie.duration} phút
        </InfoRow>
      </div>

      <div style={styles.cardFooter}>
        <Button variant="ghost" onClick={() => onEdit(movie)}>
          Sửa
        </Button>
        <Button variant="danger" onClick={() => onDelete(movie)}>
          Xóa
        </Button>
      </div>
    </article>
  );
};

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const { data } = await api.get("/movies", { params: { page: 1, limit: 100 } });
      setMovies(Array.isArray(data.movies) ? data.movies : []);
    } catch (err) {
      setPageError(err.response?.data?.message || "Không tải được danh sách phim");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const openCreateModal = () => {
    setEditingMovie(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setForm({
      title: movie.title || "",
      description: movie.description || "",
      genreText: Array.isArray(movie.genre) ? movie.genre.join(", ") : "",
      duration: movie.duration ? String(movie.duration) : "",
      poster: movie.poster || "",
      trailer: movie.trailer || "",
      releaseDate: formatDateInput(movie.releaseDate),
      status: movie.status || "now_showing"
    });
    setFieldErrors({});
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }
    setModalOpen(false);
  };

  const handleFieldChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validateClient = () => {
    const errors = {};
    if (!form.title.trim()) {
      errors.title = "Vui lòng nhập tên phim";
    }
    const durationNum = Number(form.duration);
    if (!form.duration || !Number.isInteger(durationNum) || durationNum < 1) {
      errors.duration = "Thời lượng phải là số nguyên lớn hơn hoặc bằng 1";
    }
    return errors;
  };

  const handleSaveMovie = async (event) => {
    event.preventDefault();
    setFormError("");
    setActionNotice("");

    const errors = validateClient();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      genre: form.genreText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      duration: Number(form.duration),
      poster: form.poster.trim(),
      trailer: form.trailer.trim(),
      status: form.status
    };

    if (form.releaseDate) {
      payload.releaseDate = form.releaseDate;
    }

    setSubmitting(true);
    try {
      if (editingMovie) {
        await api.put(`/movies/${editingMovie._id}`, payload);
        setActionNotice("Đã cập nhật phim thành công.");
      } else {
        await api.post("/movies", payload);
        setActionNotice("Đã thêm phim mới thành công.");
      }
      setModalOpen(false);
      await loadMovies();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && typeof data.errors === "object") {
        setFieldErrors(data.errors);
      }
      setFormError(data?.message || "Lưu phim thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMovie = async (movie) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa phim "${movie.title}"?`);
    if (!confirmed) {
      return;
    }

    setActionNotice("");
    setActionError("");

    try {
      await api.delete(`/movies/${movie._id}`);
      setActionNotice(`Đã xóa phim "${movie.title}".`);
      await loadMovies();
    } catch (err) {
      setActionError(err.response?.data?.message || "Xóa phim thất bại");
    }
  };

  return (
    <section>
      <h1 className="page-title" style={styles.title}>
        Quản lý phim
      </h1>

      <div style={styles.addButtonWrap}>
        <Button onClick={openCreateModal}>Thêm phim +</Button>
      </div>

      {actionNotice && <p className="notice-success">{actionNotice}</p>}
      {actionError && <ErrorMessage message={actionError} />}

      {loading && <Loading text="Đang tải danh sách phim..." />}

      {!loading && pageError && <ErrorMessage message={pageError} onRetry={loadMovies} />}

      {!loading && !pageError && movies.length === 0 && (
        <p className="muted">Chưa có phim nào.</p>
      )}

      {!loading && !pageError && movies.length > 0 && (
        <div style={styles.grid}>
          {movies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onEdit={openEditModal}
              onDelete={handleDeleteMovie}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editingMovie ? "Chỉnh sửa phim" : "Thêm phim mới"}
        onClose={closeModal}
      >
        <form onSubmit={handleSaveMovie} className="modal-form" noValidate>
          {formError && <ErrorMessage message={formError} />}

          <Input
            label="Tên phim"
            type="text"
            value={form.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            error={fieldErrors.title}
          />

          <Input
            label="Thời lượng (phút)"
            type="number"
            min={1}
            value={form.duration}
            onChange={(e) => handleFieldChange("duration", e.target.value)}
            error={fieldErrors.duration}
          />

          <Input
            label="Thể loại (phân cách bằng dấu phẩy)"
            type="text"
            placeholder="Hành động, Phiêu lưu"
            value={form.genreText}
            onChange={(e) => handleFieldChange("genreText", e.target.value)}
            error={fieldErrors.genre}
          />

          <div className="field">
            <label htmlFor="admin-movie-status">Trạng thái</label>
            <select
              id="admin-movie-status"
              value={form.status}
              onChange={(e) => handleFieldChange("status", e.target.value)}
            >
              <option value="now_showing">Đang chiếu</option>
              <option value="coming_soon">Sắp chiếu</option>
            </select>
            {fieldErrors.status && <span className="field-error">{fieldErrors.status}</span>}
          </div>

          <Input
            label="Ngày khởi chiếu"
            type="date"
            value={form.releaseDate}
            onChange={(e) => handleFieldChange("releaseDate", e.target.value)}
            error={fieldErrors.releaseDate}
          />

          <Input
            label="Link poster"
            type="url"
            value={form.poster}
            onChange={(e) => handleFieldChange("poster", e.target.value)}
            error={fieldErrors.poster}
          />

          <Input
            label="Link trailer"
            type="url"
            value={form.trailer}
            onChange={(e) => handleFieldChange("trailer", e.target.value)}
            error={fieldErrors.trailer}
          />

          <Input
            label="Mô tả"
            type="text"
            value={form.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            error={fieldErrors.description}
          />

          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" loading={submitting}>
              {editingMovie ? "Lưu thay đổi" : "Tạo phim"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default AdminMoviesPage;
