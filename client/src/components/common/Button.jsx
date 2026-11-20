const Button = ({ children, variant = "primary", type = "button", loading = false, disabled = false, ...rest }) => (
    <button
        type={type}
        className={`btn btn-${variant}`}
        disabled={disabled || loading}
        {...rest}
    >
        {loading ? "Đang xử lý..." : children}
    </button>
);

export default Button;