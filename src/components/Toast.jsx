import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import "./Toast.css";

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <FaCheckCircle className="toast-icon success" />;
      case "error":
        return <FaExclamationCircle className="toast-icon error" />;
      case "warning":
        return <FaExclamationTriangle className="toast-icon warning" />;
      case "info":
      default:
        return <FaInfoCircle className="toast-icon info" />;
    }
  };

  return (
    <div className={`toast-item toast-${toast.type || "info"}`}>
      <div className="toast-content-wrapper">
        <div className="toast-icon-box">{getIcon()}</div>
        <div className="toast-message">{toast.message}</div>
      </div>
      <button 
        className="toast-close-btn" 
        onClick={() => onDismiss(toast.id)}
        aria-label="Close notification"
      >
        <FaTimes size={12} />
      </button>
      <div 
        className={`toast-progress toast-progress-${toast.type || "info"}`}
        style={{ animationDuration: `${toast.duration || 3500}ms` }}
      />
    </div>
  );
}

function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return createPortal(
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}

export default Toast;
