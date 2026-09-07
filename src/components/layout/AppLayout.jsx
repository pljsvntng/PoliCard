import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="h-full flex bg-parchment">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto thin-scroll">
        <Outlet context={{ openMenu: () => setMenuOpen(true) }} />
      </div>
    </div>
  );
}
