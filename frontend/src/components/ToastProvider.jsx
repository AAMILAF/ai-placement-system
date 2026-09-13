import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = (message, type = "success") => {
    const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, message, type }]);
    setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3200);
  };

  const value = useMemo(
    () => ({
      success: (message) => push(message, "success"),
      error: (message) => push(message, "error"),
      info: (message) => push(message, "info"),
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-72 rounded-lg border px-4 py-3 text-sm shadow-xl backdrop-blur ${
              toast.type === "error"
                ? "border-rose-300 bg-rose-50 text-rose-800"
                : toast.type === "info"
                ? "border-sky-300 bg-sky-50 text-sky-800"
                : "border-emerald-300 bg-emerald-50 text-emerald-800"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
