
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

  const bgColor = {
    success: 'bg-green-500',
    info: 'bg-cyan-500',
    error: 'bg-red-500',
  }[toast.type];

  return (
    <div
      className={`p-4 rounded-lg shadow-lg text-white font-semibold ${bgColor} ${isExiting ? 'animate-slideOut' : 'animate-slideIn'}`}
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
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
