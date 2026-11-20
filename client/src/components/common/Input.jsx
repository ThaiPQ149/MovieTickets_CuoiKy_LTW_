import { useId } from "react";

const Input = ({ label, error, id, ...rest }) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
        <div className="field">
            <label htmlFor={inputId}>{label}</label>
            <input
                id={inputId}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${inputId}-error` : undefined}
                {...rest}
            />
            {error && (
                <p id={`${inputId}-error`} className="field-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;