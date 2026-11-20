export const notFound = (req, res) => {
    res.status(404).json({ message: `Không tìm thấy ${req.method} ${req.originalUrl}` });
};

const errorMiddleware = (err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message || "Lỗi máy chủ";
    let errors;

    if (err.name === "ValidationError" && err.errors) {
        status = 400;
        message = "Dữ liệu không hợp lệ";
        errors = Object.fromEntries(
            Object.entries(err.errors).map(([field, e]) => [field, e.message])
        );
    } else if (err.name === "CastError") {
        status = 400;
        message = "ID hoặc giá trị không hợp lệ";
    } else if (err.code === 11000) {
        status = 409;
        message = "Dữ liệu bị trùng";
    } else if (err.name === "TokenExpiredError") {
        status = 401;
        message = "Phiên đăng nhập đã hết hạn";
    } else if (err.name === "JsonWebTokenError") {
        status = 401;
        message = "Token không hợp lệ";
    }

    if (status === 500) {
        console.error(err);
        message = "Lỗi máy chủ";
    }

    res.status(status).json({ message, ...(errors && { errors }) });
};

export default errorMiddleware;