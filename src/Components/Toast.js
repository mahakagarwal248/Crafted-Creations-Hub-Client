import { useEffect } from 'react';
import './Toast.css';

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast.duration) return undefined;
    const id = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(id);
  }, [toast.id, toast.duration, onDismiss]);

  const variantClass = `cch-toast cch-toast--${toast.variant || 'success'}`;
  return (
    <div role="status" aria-live="polite" className={variantClass}>
      <span className="cch-toast-icon" aria-hidden>
        {toast.variant === 'error' ? '!' : '✓'}
      </span>
      <span className="cch-toast-message">{toast.message}</span>
      <button
        type="button"
        className="cch-toast-close"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        ×
      </button>
    </div>
  );
}

function ToastStack({ toasts, onDismiss }) {
  if (!toasts?.length) return null;
  return (
    <div className="cch-toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default ToastStack;
