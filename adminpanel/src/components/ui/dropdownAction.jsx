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

    if (isClipping) return current;
    current = current.parentElement;
  }

  return null;
};

const DropdownAction = ({
  label = "Action",
  items = [],
  onSelect,
  buttonClassName = "",
  menuClassName = "",
  itemClassName = "",
  menuBodyClassName = "",
  children,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState("down");
  const [align, setAlign] = useState("left");
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const buttonEl = buttonRef.current;
      const menuEl = menuRef.current;

      if (!buttonEl || !menuEl) return;

      const buttonRect = buttonEl.getBoundingClientRect();
      const menuRect = menuEl.getBoundingClientRect();
      const clippingParent = getClippingParent(containerRef.current);
      const margin = 8;

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

      const viewportBelow = window.innerHeight - buttonRect.bottom;
      const viewportAbove = buttonRect.top;
      const availableBelow = Math.min(viewportBelow, parentBelow);
      const availableAbove = Math.min(viewportAbove, parentAbove);
      const availableRight = parentRight - buttonRect.right;
      const availableLeft = buttonRect.left - parentLeft;

      setDirection(
        availableBelow < menuRect.height + margin &&
          availableAbove >= menuRect.height + margin
          ? "up"
          : "down",
      );

      if (
        availableRight < menuRect.width + margin &&
        availableLeft >= menuRect.width + margin
      ) {
        setAlign("right");
      } else if (
        availableLeft < menuRect.width + margin &&
        availableRight >= menuRect.width + margin
      ) {
        setAlign("left");
      } else {
        setAlign(availableRight >= availableLeft ? "left" : "right");
      }
    };

    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
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
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const renderItems = () => {
    if (typeof children === "function") return children({ closeMenu });
    if (children) return children;

    return items.map((item) => {
      const isDanger = item.variant === "danger";
      const isDisabled = Boolean(item.disabled);
      const baseClasses =
        "w-full rounded-lg border px-2 py-1 text-left text-sm transition-colors";
      const variantClasses = isDanger
        ? "border-red-600 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-300"
        : "border-transparent bg-transparent text-text-primary hover:bg-neutral-200/80 dark:hover:bg-white/10";
      const disabledClasses = isDisabled
        ? "cursor-not-allowed opacity-50 hover:bg-transparent"
        : "";

      return (
        <button
          key={item.id ?? item.label}
          type="button"
          disabled={isDisabled}
          onClick={() => {
            if (isDisabled) return;
            if (item.onClick) item.onClick(item);
            if (onSelect) onSelect(item);
            closeMenu();
          }}
          className={[
            baseClasses,
            variantClasses,
            disabledClasses,
            itemClassName,
          ].join(" ")}
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
        disabled={disabled}
        onClick={toggleMenu}
        className={[
          "rounded-lg bg-[#b0bbb7] px-3 py-2 text-sm font-normal text-text-primary transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1D473F] dark:text-white",
          buttonClassName,
        ].join(" ")}
      >
        {label}
      </button>

      {isOpen ? (
        <div
          ref={menuRef}
          className={[
            "absolute z-50 min-w-[180px] rounded-lg border border-border bg-surface text-text-primary shadow-lg",
            direction === "down" ? "top-full mt-2" : "bottom-full mb-2",
            align === "right" ? "right-0" : "left-0",
            menuClassName,
          ].join(" ")}
        >
          <div
            className={[
              menuBodyClassName || (children ? "p-2" : "flex flex-col gap-1 p-2"),
            ].join(" ")}
          >
            {renderItems()}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DropdownAction;
