import Button from "./Button";

const ErrorMessage = ({ message, onRetry }) => (
    <div className="error-message" role="alert">
        <p>{message}</p>
        {onRetry && (
            <Button variant="ghost" onClick={onRetry}>
                Thử lại
            </Button>
        )}
    </div>
);

export default ErrorMessage;