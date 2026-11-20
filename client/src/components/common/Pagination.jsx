import Button from "./Button";

const Pagination = ({ page, totalPages, onChange }) => {
    if (totalPages <= 1) {
        return null;
    }

    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <nav className="pagination" aria-label="Phân trang">
            <Button variant="ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>
                Trước
            </Button>
            {pages.map((number) => (
                <button
                    key={number}
                    type="button"
                    className={number === page ? "page-btn active" : "page-btn"}
                    aria-current={number === page ? "page" : undefined}
                    onClick={() => onChange(number)}
                >
                    {number}
                </button>
            ))}
            <Button variant="ghost" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
                Sau
            </Button>
        </nav>
    );
};

export default Pagination;