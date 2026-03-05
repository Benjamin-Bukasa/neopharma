import React, { useEffect, useRef, useState } from "react";
import { PanelRightClose, PanelRightOpen, Pill } from "lucide-react";
import useUiStore from "../../../stores/uiStore";

const Logo = () => {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);
  const [tooltipSide, setTooltipSide] = useState("right");

  useEffect(() => {
    if (isSidebarOpen) return;

    const updatePosition = () => {
      const buttonEl = buttonRef.current;
      const tooltipEl = tooltipRef.current;

      if (!buttonEl) return;

      const rect = buttonEl.getBoundingClientRect();
      const tooltipWidth = tooltipEl?.offsetWidth ?? 0;
      const spaceLeft = rect.left;
      const spaceRight = window.innerWidth - rect.right;
      const margin = 8;
      const canShowRight = spaceRight >= tooltipWidth + margin;
      const canShowLeft = spaceLeft >= tooltipWidth + margin;

      if (canShowRight && !canShowLeft) {
        setTooltipSide("right");
        return;
      }

      if (canShowLeft && !canShowRight) {
        setTooltipSide("left");
        return;
      }

      setTooltipSide(spaceRight >= spaceLeft ? "right" : "left");
    };

    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isSidebarOpen]);

  return (
    <div className="w-full flex items-center justify-between gap-2">
      <div className="flex items-center justify-start gap-2">
        <Pill size={24} strokeWidth={2} className="text-accent" />
        {isSidebarOpen ? (
          <p className="text-2xl text-white font-semibold">NeoPharma</p>
        ) : null}
      </div>
      <div className="relative group">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleSidebar}
          className="text-accent cursor-pointer"
          aria-label={isSidebarOpen ? "Réduire le sidebar" : "Voir plus"}
        >
          {isSidebarOpen ? (
            <PanelRightClose size={24} strokeWidth={1.25} />
          ) : (
            <PanelRightOpen size={24} strokeWidth={1.25} />
          )}
        </button>
        {!isSidebarOpen ? (
          <span
            ref={tooltipRef}
            className={[
              "pointer-events-none absolute top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-accent px-2 py-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100",
              tooltipSide === "right" ? "left-full ml-2" : "right-full mr-2",
            ].join(" ")}
          >
            Ouvrir
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default Logo;
