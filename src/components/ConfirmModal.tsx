type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  isDanger = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
        </div>

        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-actions">
          {cancelText ? (
            <button
              type="button"
              className="modal-button modal-button-secondary"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          ) : null}

          <button
            type="button"
            className={
              isDanger
                ? "modal-button modal-button-danger"
                : "modal-button modal-button-primary"
            }
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}