import React from "react";
import Logo from "./Logo";
import useUiStore from "../../../stores/uiStore";
import ListItemAdmin from "./ListItemAdmin";

const Sidebar = () => {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);

  return (
    <aside
      className={`sidebar h-full shrink-0 overflow-hidden transition-all duration-200 ${
        isSidebarOpen ? "w-80" : "w-24"
      }`}
    >
      <div className="flex h-full min-h-0 w-full flex-col">
        <div className="sticky top-0 z-10 w-full shrink-0 bg-secondary px-4 py-6 dark:bg-primary">
          <div className="flex w-full items-center justify-between">
            <Logo />
          </div>
        </div>

        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          <div className="w-full">
            <ListItemAdmin />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
