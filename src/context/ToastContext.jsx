import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TONE = {
  success: "border-moss/30 text-moss",
  error: "border-rose/30 text-rose",
  info: "border-teal/30 text-teal-deep",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, tone = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-[min(360px,90vw)]">
        {toasts.map((t) => {
          const Icon = ICONS[t.tone] || Info;
          return (
            <div
              key={t.id}
              role="status"
              className={`flex items-start gap-2.5 rounded-xl border bg-paper px-4 py-3 shadow-[0_4px_16px_rgba(23,32,58,0.08)] ${TONE[t.tone]}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm text-ink flex-1">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="text-slate hover:text-ink" aria-label="Dismiss">
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
