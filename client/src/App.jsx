import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import MovieListPage from "./pages/movies/MovieListPage";
import MovieDetailPage from "./pages/movies/MovieDetailPage";
import SeatSelectionPage from "./pages/booking/SeatSelectionPage";
import MyTicketsPage from "./pages/booking/MyTicketsPage";
import ProfilePage from "./pages/account/ProfilePage";
import AdminMoviesPage from "./pages/admin/AdminMoviesPage";
import AdminRoomsPage from "./pages/admin/AdminRoomsPage";
import AdminShowtimesPage from "./pages/admin/AdminShowtimesPage";
import AdminRevenuePage from "./pages/admin/AdminRevenuePage";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => (
    <Routes>
        <Route element={<MainLayout />}>
            <Route index element={<MovieListPage />} />
            <Route path="movies/:id" element={<MovieDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
                <Route path="booking/:showtimeId" element={<SeatSelectionPage />} />
                <Route path="my-tickets" element={<MyTicketsPage />} />
                <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="admin" element={<ProtectedRoute roles={["admin"]} />}>
            <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="movies" replace />} />
                <Route path="movies" element={<AdminMoviesPage />} />
                <Route path="rooms" element={<AdminRoomsPage />} />
                <Route path="showtimes" element={<AdminShowtimesPage />} />
                <Route path="revenue" element={<AdminRevenuePage />} />
            </Route>
        </Route>
    </Routes>
);

export default App;