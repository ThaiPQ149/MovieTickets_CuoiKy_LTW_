import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Button from "../common/Button";
import ThemeToggle from "../common/ThemeToggle";

const navClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="site-header">
            <div className="container header-inner">
                <Link to="/" className="brand">
                    MovieTickets
                </Link>
                <nav className="nav" aria-label="Điều hướng chính">
                    <NavLink to="/" end className={navClass}>
                        Phim
                    </NavLink>
                    {user && (
                        <NavLink to="/my-tickets" className={navClass}>
                            Vé của tôi
                        </NavLink>
                    )}
                    {user?.role === "admin" && (
                        <NavLink to="/admin" className={navClass}>
                            Quản trị
                        </NavLink>
                    )}
                </nav>
                <div className="header-actions">
                    <ThemeToggle />
                    {user ? (
                        <>
                            <NavLink to="/profile" className={navClass}>
                                {user.name}
                            </NavLink>
                            <Button variant="ghost" onClick={handleLogout}>
                                Đăng xuất
                            </Button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={navClass}>
                                Đăng nhập
                            </NavLink>
                            <NavLink to="/register" className="btn btn-primary">
                                Đăng ký
                            </NavLink>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;