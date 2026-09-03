import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTrashAlt, FaExclamationTriangle, FaQuestionCircle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import './ConfirmModal.css';

/**
 * Reusable Confirmation Modal
 * 
 * Props:
 *   - show (bool)        : Whether modal is visible
 *   - title (string)     : Modal heading
 *   - message (string|node): Description / question text
 *   - confirmText (string): Submit / confirm button text (default: "Confirm")
 *   - cancelText (string) : Cancel button text (default: "Cancel")
 *   - onConfirm (fn)     : Called when user confirms
 *   - onCancel (fn)      : Called when user cancels / clicks backdrop
 *   - loading (bool)     : Shows loading state on confirm button
 *   - variant (string)   : "danger" | "warning" | "primary" | "default" (default: "danger")
 *   - icon (node)        : Optional custom icon / emoji
 */
function ConfirmModal({
  show,
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  variant = "danger",
  icon = null
}) {
  // Lock background scroll and handle Escape key when modal is open
  useEffect(() => {
    if (show) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !loading && onCancel) {
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [show, loading, onCancel]);

  if (!show) return null;

  const renderIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case "danger":
        return <FaTrashAlt size={22} color="#e74c3c" />;
      case "warning":
        return <FaExclamationTriangle size={22} color="#f39c12" />;
      case "primary":
      case "teal":
        return <FaCheckCircle size={22} color="#0d6b6d" />;
      default:
        return <FaQuestionCircle size={22} color="#C5A059" />;
    }
  };

  return createPortal(
    <div className="confirm-modal-overlay" onClick={!loading ? onCancel : undefined}>
      <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-modal-icon ${variant}`}>
          {renderIcon()}
        </div>

        <h3 className="confirm-modal-title">{title}</h3>
        
        {message && <div className="confirm-modal-message">{message}</div>}

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-btn cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirm-modal-btn confirm ${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="confirm-modal-spinner-wrapper">
                <span className="confirm-modal-spinner"></span>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmModal;
