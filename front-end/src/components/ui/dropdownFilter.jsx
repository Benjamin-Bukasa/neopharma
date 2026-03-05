import React, { useMemo, useState } from "react";
import { ListFilter, Search, X } from "lucide-react";
import DropdownAction from "./dropdownAction";

const defaultActivities = [
  { id: "all", label: "Tous" },
  { id: "time-charge", label: "Time Charge" },
  { id: "consultation", label: "Consultation" },
];
const defaultStatuses = [
  { id: "all", label: "Tous" },
  { id: "actif", label: "Actif" },
  { id: "inactif", label: "Inactif" },
  { id: "annule", label: "Annulé" },
];

const DropdownFilter = ({
  label = "Filtrer",
  items,
  statusItems,
  initialValues,
  onApply,
  onReset,
  buttonClassName = "",
  ...props
}) => {
  const resolvedActivities = items?.length ? items : defaultActivities;
  const resolvedStatuses = statusItems?.length ? statusItems : defaultStatuses;
  const defaults = useMemo(
    () => ({
      from: "",
      to: "",
      activity: resolvedActivities[0]?.id ?? "",
      status: resolvedStatuses[0]?.id ?? "",
      keyword: "",
      ...initialValues,
    }),
    [initialValues, resolvedActivities, resolvedStatuses]
  );
  const [values, setValues] = useState(defaults);

  const handleResetAll = () => {
    setValues(defaults);
    onReset?.(defaults);
    onApply?.(defaults);
  };

  return (
    <DropdownAction
      label={
        <div className="flex items-center gap-2">
          <p>{label}</p>
          <ListFilter size={18} strokeWidth={1.5} />
        </div>
      }
      buttonClassName={[
        "px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2",
        "bg-neutral-300 text-text-primary focus:ring-neutral-400",
        buttonClassName,
      ].join(" ")}
      menuClassName="w-[320px] shadow-xl"
      menuBodyClassName="p-0"
      {...props}
    >
      {({ closeMenu }) => (
        <div className="w-full">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <ListFilter size={16} strokeWidth={1.5} />
              <span>{label}</span>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              className="rounded-md p-1 text-text-secondary hover:bg-gray-100 hover:text-text-primary"
              aria-label="Fermer"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          <div className="space-y-4 px-4 py-3 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-text-secondary">
                  Plage de dates
                </p>
                <button
                  type="button"
                  className="text-xs text-secondary hover:underline"
                  onClick={() =>
                    setValues((prev) => ({ ...prev, from: "", to: "" }))
                  }
                >
                  Réinitialiser
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs text-text-secondary">
                  Du
                  <input
                    type="date"
                    value={values.from}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, from: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-text-secondary">
                  Au
                  <input
                    type="date"
                    value={values.to}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, to: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-text-secondary">
                  Type d&apos;activité
                </p>
                <button
                  type="button"
                  className="text-xs text-secondary hover:underline"
                  onClick={() =>
                    setValues((prev) => ({
                      ...prev,
                      activity: resolvedActivities[0]?.id ?? "",
                    }))
                  }
                >
                  Réinitialiser
                </button>
              </div>
              <select
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                value={values.activity}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, activity: event.target.value }))
                }
              >
                {resolvedActivities.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-text-secondary">
                  Statut
                </p>
                <button
                  type="button"
                  className="text-xs text-secondary hover:underline"
                  onClick={() =>
                    setValues((prev) => ({
                      ...prev,
                      status: resolvedStatuses[0]?.id ?? "",
                    }))
                  }
                >
                  Réinitialiser
                </button>
              </div>
              <select
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                value={values.status}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                {resolvedStatuses.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-text-secondary">
                  Recherche
                </p>
                <button
                  type="button"
                  className="text-xs text-secondary hover:underline"
                  onClick={() => setValues((prev) => ({ ...prev, keyword: "" }))}
                >
                  Réinitialiser
                </button>
              </div>
              <div className="relative">
                <Search
                  size={16}
                  strokeWidth={1.5}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="text"
                  value={values.keyword}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, keyword: event.target.value }))
                  }
                  placeholder="Rechercher..."
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-12 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-text-secondary">
                  ⌘ K
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/60 px-4 py-3">
            <button
              type="button"
              onClick={handleResetAll}
              className="rounded-lg bg-neutral-200 px-3 py-2 text-sm font-medium text-text-primary hover:bg-neutral-300"
            >
              Réinitialiser
            </button>
            <button
              type="button"
              onClick={() => {
                onApply?.(values);
                closeMenu();
              }}
              className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-white hover:bg-secondary/90"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </DropdownAction>
  );
};

export default DropdownFilter;
