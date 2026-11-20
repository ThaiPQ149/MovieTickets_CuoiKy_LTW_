import { Link, NavLink, Outlet } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";

const navClass = ({ isActive }) => (isActive ? "admin-link active" : "admin-link");

const AdminLayout = () => (
    <div className="admin-shell">
        <aside className="admin-sidebar">
            <Link to="/admin" className="brand">
                Quản trị
            </Link>
            <nav aria-label="Menu quản trị" className="admin-nav">
                <NavLink to="/admin/movies" className={navClass}>
                    Phim
                </NavLink>
                <NavLink to="/admin/rooms" className={navClass}>
                    Phòng chiếu
                </NavLink>
                <NavLink to="/admin/showtimes" className={navClass}>
                    Suất chiếu
                </NavLink>
                <NavLink to="/admin/revenue" className={navClass}>
                    Doanh thu
                </NavLink>
            </nav>
            <div className="admin-sidebar-foot">
                <Link to="/" className="admin-link">
                    Về trang chủ
                </Link>
                <ThemeToggle />
            </div>
        </aside>
        <main className="admin-main">
            <Outlet />
        </main>
    </div>
);

export default AdminLayout;