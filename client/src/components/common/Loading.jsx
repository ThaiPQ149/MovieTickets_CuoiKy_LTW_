const Loading = ({ text = "Đang tải..." }) => (
    <div className="loading" role="status">
        <span className="spinner" aria-hidden="true" />
        {text}
    </div>
);

export default Loading;