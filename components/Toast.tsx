
import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Toast as ToastType } from '../types';

const Toast: React.FC<{ toast: ToastType; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      const removeTimer = setTimeout(() => onRemove(toast.id), 500);
      return () => clearTimeout(removeTimer);
    }, 4000);

    return () => clearTimeout(exitTimer);
  }, [toast.id, onRemove]);

  const themeClasses = {
    success: 'bg-[var(--dl-green)] border-[var(--dl-green-shadow)]',
    info: 'bg-[var(--dl-blue)] border-[var(--dl-blue-shadow)]',
    error: 'bg-[var(--dl-red)] border-[var(--dl-red-shadow)]',
  }[toast.type];

  return (
    <div
      className={`p-4 rounded-lg shadow-lg text-white font-semibold border-b-4 ${themeClasses} ${isExiting ? 'animate-slideOut' : 'animate-slideIn'}`}
      role="alert"
      aria-live="assertive"
    >
      {toast.message}
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const toasts = useStore(state => state.toasts);
  const removeToast = useStore(state => state.removeToast);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;