import { Menu } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function Topbar({ title, subtitle, onMenu, actions }) {
  const { settings } = useApp();
  const initial = (settings.name || "S").trim().charAt(0).toUpperCase();

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-line bg-parchment/85 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenu}
          className="lg:hidden text-ink -ml-1 p-1.5 rounded-2xl hover:bg-ink/[0.05] press-effect"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="font-display font-semibold text-lg sm:text-xl text-ink truncate leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {actions}
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal to-[#7d79ff] text-white flex items-center justify-center text-sm font-semibold font-display shadow-[var(--shadow-soft)] ring-2 ring-white">
          {initial}
        </div>
      </div>
    </header>
  );
}
