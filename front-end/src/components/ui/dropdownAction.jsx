/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useRef, useState } from "react";

const getClippingParent = (element) => {
  let current = element?.parentElement;

  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    const isClipping =
      (overflowY && overflowY !== "visible") ||
      (overflowX && overflowX !== "visible");

    if (isClipping) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
};

const dropdownAction = ({
  label = "Action",
  items = [],
  onSelect,
  buttonClassName = "",
  menuClassName = "",
  itemClassName = "",
  menuBodyClassName = "",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState("down");
  const [align, setAlign] = useState("left");
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const buttonEl = buttonRef.current;
      const menuEl = menuRef.current;

      if (!buttonEl || !menuEl) return;

      const buttonRect = buttonEl.getBoundingClientRect();
      const menuRect = menuEl.getBoundingClientRect();
      const menuHeight = menuRect.height;
      const menuWidth = menuRect.width;
      const viewportBelow = window.innerHeight - buttonRect.bottom;
      const viewportAbove = buttonRect.top;
      const clippingParent = getClippingParent(containerRef.current);

      let parentBelow = Number.POSITIVE_INFINITY;
      let parentAbove = Number.POSITIVE_INFINITY;
      let parentLeft = 0;
      let parentRight = window.innerWidth;

      if (clippingParent) {
        const parentRect = clippingParent.getBoundingClientRect();
        parentBelow = parentRect.bottom - buttonRect.bottom;
        parentAbove = buttonRect.top - parentRect.top;
        parentLeft = parentRect.left;
        parentRight = parentRect.right;
      }

      const availableBelow = Math.min(viewportBelow, parentBelow);
      const availableAbove = Math.min(viewportAbove, parentAbove);
      const availableRight = parentRight - buttonRect.right;
      const availableLeft = buttonRect.left - parentLeft;
      const margin = 8;

      if (availableBelow < menuHeight + margin && availableAbove >= menuHeight + margin) {
        setDirection("up");
      } else {
        setDirection("down");
      }

      if (availableRight < menuWidth + margin && availableLeft >= menuWidth + margin) {
        setAlign("right");
      } else if (availableLeft < menuWidth + margin && availableRight >= menuWidth + margin) {
        setAlign("left");
      } else {
        setAlign(availableRight >= availableLeft ? "left" : "right");
      }
    };

    const raf = requestAnimationFrame(updatePosition);
    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, items.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const renderItems = () => {
    if (typeof children === "function") {
      return children({ closeMenu });
    }
    if (children) return children;

    return items.map((item) => {
      const label = (item.label ?? "").toLowerCase();
      const isDanger = item.variant === "danger";
      const baseClasses =
        "w-full text-left px-2 py-1 text-sm rounded-lg border transition-colors";
      const variantClasses = isDanger
        ? "bg-red-50 text-red-600 border-red-600 hover:bg-red-100"
        : "bg-transparent text-primary border-transparent hover:bg-neutral-200/80";

      return (
        <button
          key={item.id ?? item.label}
          type="button"
          onClick={() => {
            if (item.onClick) item.onClick(item);
            if (onSelect) onSelect(item);
            closeMenu();
          }}
          className={[baseClasses, variantClasses, itemClassName].join(" ")}
        >
          <div className="flex items-center gap-2">
            {item.icon ? (
              <span
                className={[
                  "inline-flex items-center justify-center",
                  item.iconClassName ?? "",
                ].join(" ")}
              >
                <item.icon size={item.iconSize ?? 18} strokeWidth={1.5} />
              </span>
            ) : null}
            <span>{item.label}</span>
          </div>
        </button>
      );
    });
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className={[
          "text-sm font-normal px-3 py-2 rounded-lg bg-[#b0bbb7] text-text-primary",
          buttonClassName,
        ].join(" ")}
      >
        {label}
      </button>

      {isOpen ? (
        <div
          ref={menuRef}
          className={[
            "absolute z-50 min-w-[180px] rounded-lg bg-white text-text-primary shadow-lg border border-gray-200",
            direction === "down" ? "top-full mt-2" : "bottom-full mb-2",
            align === "right" ? "right-0" : "left-0",
            menuClassName,
          ].join(" ")}
        >
          <div
            className={[
              menuBodyClassName || (children ? "p-2" : "p-2 flex flex-col gap-1"),
            ].join(" ")}
          >
            {renderItems()}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default dropdownAction;
