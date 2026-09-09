import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  BrainCircuit,
  Layers,
  Library,
  History,
  Settings,
  X,
  Sparkles,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload", icon: UploadCloud },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/quiz", label: "Quizzes", icon: BrainCircuit },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/library", label: "Library", icon: Library },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-ink text-parchment flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7d79ff] to-teal flex items-center justify-center shadow-[var(--shadow-pop)]">
              <Sparkles size={16} className="text-white" />
            </span>
            <span className="font-display text-lg tracking-tight">PoliCard</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-parchment/70" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto thin-scroll px-3 py-5 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-white/[0.12] text-white font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-parchment/60 hover:text-white hover:bg-white/[0.06] hover:translate-x-0.5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`w-7 h-7 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? "bg-gradient-to-br from-[#7d79ff] to-teal text-white" : "bg-white/[0.06] text-parchment/70 group-hover:bg-white/[0.1]"
                    }`}
                  >
                    <Icon size={15} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/10 text-xs text-parchment/45 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-moss" />
          Study materials generated only from what you upload.
        </div>
      </aside>
    </>
  );
}
