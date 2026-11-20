const EmptyState = ({ title, description, children }) => (
    <div className="empty-state">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {children}
    </div>
);

export default EmptyState;