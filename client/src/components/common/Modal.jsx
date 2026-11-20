import { useEffect } from "react";
import Button from "./Button";

const Modal = ({ open, title, onClose, children }) => {
    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const handleKey = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2>{title}</h2>
                    <Button variant="ghost" onClick={onClose} aria-label="Đóng">
                        Đóng
                    </Button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

export default Modal;