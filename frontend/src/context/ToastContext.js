import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ToastContext = createContext({ addToast: () => {} });

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, opts = {}) => {
      const id = ++idCounter;
      const toast = {
        id,
        message,
        type: opts.type || "info",
        duration: opts.duration || 3000,
      };
      setToasts((prev) => [...prev, toast]);
      if (toast.duration > 0) {
        setTimeout(() => removeToast(id), toast.duration);
      }
    },
    [removeToast]
  );

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-2 p-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full max-w-sm rounded-md border p-3 shadow-sm ${
              t.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : t.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-gray-200 bg-white text-gray-800"
            }`}
            onClick={() => removeToast(t.id)}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
