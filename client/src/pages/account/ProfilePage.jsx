import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/common/Button";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!user) {
    return null;
  }

  return (
    <section className="profile-page">
      <h1 className="page-title">Thông tin tài khoản</h1>

      <div className="profile-card">
        <p>
          <strong>Họ tên:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Số điện thoại:</strong> {user.phone || "Chưa cập nhật"}
        </p>
        <p>
          <strong>Vai trò:</strong> {user.role}
        </p>
      </div>

      <div className="profile-actions">
        <Link to="/my-tickets" className="btn">
          Vé của tôi
        </Link>
        <Button variant="ghost" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </div>
    </section>
  );
};

export default ProfilePage;