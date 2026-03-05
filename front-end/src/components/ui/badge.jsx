import React from "react";

const STATUS_TO_VARIANT = {
  "en stock": "success",
  disponible: "success",
  faible: "warning",
  "faible stock": "warning",
  "épuisé": "danger",
  epuisé: "danger",
  rupture: "danger",
  actif: "active",
  active: "active",
  inactif: "inactive",
  inactive: "inactive",
};

const VARIANT_CLASSES = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  active: "bg-[#b0bbb7] text-text-primary border-[#b0bbb7]",
  inactive: "bg-neutral-300 text-text-primary border-neutral-300",
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
};

const Badge = ({
  label,
  status,
  variant,
  className = "",
}) => {
  const normalizedStatus = status?.toLowerCase?.().trim?.() ?? "";
  const resolvedVariant =
    variant ||
    (normalizedStatus ? STATUS_TO_VARIANT[normalizedStatus] : undefined) ||
    "neutral";

  const content = label ?? status ?? "";

  return (
    <span
      className={[
        "inline-flex items-center rounded-lg border px-2.5 py-0 text-[10px] font-medium",
        VARIANT_CLASSES[resolvedVariant] ?? VARIANT_CLASSES.neutral,
        className,
      ].join(" ")}
    >
      {content}
    </span>
  );
};

export default Badge;
