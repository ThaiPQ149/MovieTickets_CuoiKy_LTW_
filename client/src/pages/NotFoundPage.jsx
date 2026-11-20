import { Link } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";

const NotFoundPage = () => (
    <EmptyState
        title="Không tìm thấy trang"
        description="Đường dẫn bạn mở không tồn tại hoặc đã được chuyển đi."
    >
        <Link to="/" className="btn btn-primary">
            Về trang phim
        </Link>
    </EmptyState>
);

export default NotFoundPage;