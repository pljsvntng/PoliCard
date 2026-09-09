import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, width = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full ${width} max-h-[85vh] overflow-y-auto thin-scroll bg-paper rounded-3xl border border-line shadow-[var(--shadow-pop)] animate-pop-in`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-paper rounded-t-3xl">
          <h2 className="font-display text-lg text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
