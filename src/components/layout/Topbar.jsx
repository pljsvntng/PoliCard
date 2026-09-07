import { Menu } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function Topbar({ title, subtitle, onMenu, actions }) {
  const { settings } = useApp();
  const initial = (settings.name || "S").trim().charAt(0).toUpperCase();

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-line bg-parchment/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenu} className="lg:hidden text-ink -ml-1 p-1" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-lg sm:text-xl text-ink truncate leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {actions}
        <div className="w-8 h-8 rounded-full bg-teal/10 text-teal-deep flex items-center justify-center text-sm font-medium font-display">
          {initial}
        </div>
      </div>
    </header>
  );
}
