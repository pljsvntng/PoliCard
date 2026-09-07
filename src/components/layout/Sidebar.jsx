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
  BookOpen,
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
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
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
            <BookOpen size={19} className="text-amber" />
            <span className="font-display text-lg tracking-tight">POLICARD</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-parchment/70" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto thin-scroll px-3 py-5 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-parchment/65 hover:text-white hover:bg-white/[0.06]"
                }`
              }
            >
              <Icon size={17} className="shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/10 text-xs text-parchment/45">
          Study materials generated only from what you upload.
        </div>
      </aside>
    </>
  );
}
