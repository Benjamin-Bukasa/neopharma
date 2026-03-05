import React from "react";
import { NavLink } from "react-router-dom";
import { items } from "../../../utils/sidebarItems";
import useUiStore from "../../../stores/uiStore";

const SETTINGS_LINKS = new Set([
  "notifications",
  "settings",
  "help",
  "logout",
]);

const ListItemSettings = () => {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);

  return (
    <nav className="w-full flex flex-col gap-2">
      {items
        .filter((item) => SETTINGS_LINKS.has(item.link))
        .map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              aria-label={item.name}
              className={({ isActive }) =>
                [
                  "flex items-center transition-colors",
                  isSidebarOpen ? "gap-3 justify-start" : "gap-0 justify-center",
                  "rounded-lg px-4 py-2 hover:bg-accent hover:text-primary",
                  isActive ? "bg-accent text-primary" : "text-white",
                ].join(" ")
              }
            >
              <Icon size={20} strokeWidth={1.5} />
              {isSidebarOpen ? (
                <span className="text-sm font-normal">{item.name}</span>
              ) : null}
            </NavLink>
          );
        })}
    </nav>
  );
};

export default ListItemSettings;
