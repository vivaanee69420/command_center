import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-bg-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
