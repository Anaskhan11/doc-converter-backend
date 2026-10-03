import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Notification } from '../components/Notification';

const ToastContext = createContext();

const MAX_VISIBLE_TOASTS = 5;
const AUTO_DISMISS_MS = 4000;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = (id) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      return next.length > MAX_VISIBLE_TOASTS ? next.slice(-MAX_VISIBLE_TOASTS) : next;
    });
    timersRef.current.set(id, setTimeout(() => removeToast(id), AUTO_DISMISS_MS));
  };

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 space-y-3 max-w-sm w-full px-4" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <Notification
            key={toast.id}
            severity={toast.type}
            message={toast.message}
            onDismiss={() => removeToast(toast.id)}
            floating
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
