import React from "react";
import Logo from "./Logo";
import useUiStore from "../../../stores/uiStore";
import ListItemClient from "./ListItemClient";
import ListItemSettings from './ListItemSettings';

const Sidebar = () => {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);

  return (
    <aside
      className={`sidebar transition-all duration-200  ${
        isSidebarOpen ? "w-80 " : "w-24"
      }`}
    > 
      <div className="w-full flex flex-col justify-between gap-6">
          <div className="w-full px-4 py-6">
            <div className="w-full flex items-center justify-between">
              <Logo />
            </div>
          </div>
          <div className="w-full px-2">
            <ListItemClient/>
          </div>
      </div>
      {/* <div className="w-full text-center">PUB</div> */}
      <div className="w-full px-2 py-8">
          <ListItemSettings/>
      </div>
    </aside>
  );
}

export default Sidebar;
