import React, { useMemo, useState } from "react";
import { ListFilter, Search, X } from "lucide-react";
import DropdownAction from "./dropdownAction";

const defaultStocks = [
  { id: "all", label: "Tous" },
  { id: "en stock", label: "En stock" },
  { id: "faible", label: "Faible" },
  { id: "épuisé", label: "Épuisé" },
];
const defaultCategories = [
  { id: "all", label: "Toutes" },
  { id: "antalgique", label: "Antalgique" },
  { id: "antibiotique", label: "Antibiotique" },
  { id: "anti-inflammatoire", label: "Anti-inflammatoire" },
  { id: "antihistaminique", label: "Antihistaminique" },
  { id: "gastro-entérologie", label: "Gastro-entérologie" },
  { id: "respiratoire", label: "Respiratoire" },
  { id: "diabète", label: "Diabète" },
  { id: "cardiologie", label: "Cardiologie" },
  { id: "psychiatrie", label: "Psychiatrie" },
  { id: "endocrinologie", label: "Endocrinologie" },
  { id: "corticoïde", label: "Corticoïde" },
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
  categoryItems,
  initialValues,
  onApply,
  onReset,
  buttonClassName = "",
  showDateRange = true,
  showCategory = false,
  ...props
}) => {
  const resolvedStocks = items?.length ? items : defaultStocks;
  const resolvedStatuses = statusItems?.length ? statusItems : defaultStatuses;
  const resolvedCategories = categoryItems?.length
    ? categoryItems
    : defaultCategories;
  const defaults = useMemo(
    () => ({
      from: "",
      to: "",
      stock: resolvedStocks[0]?.id ?? "",
      status: resolvedStatuses[0]?.id ?? "",
      category: resolvedCategories[0]?.id ?? "",
      keyword: "",
      ...initialValues,
    }),
    [initialValues, resolvedStocks, resolvedStatuses, resolvedCategories]
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
        "dark:bg-surface dark:text-text-primary dark:border dark:border-border dark:hover:bg-surface/70 dark:focus:ring-neutral-600/50 dark:focus:border-neutral-600/60",
        buttonClassName,
      ].join(" ")}
      menuClassName="w-[320px] shadow-xl"
      menuBodyClassName="p-0"
      {...props}
    >
      {({ closeMenu }) => (
        <div className="w-full">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <ListFilter size={16} strokeWidth={1.5} />
              <span>{label}</span>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              className="rounded-md p-1 text-text-secondary hover:bg-surface/70 hover:text-text-primary"
              aria-label="Fermer"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          <div className="space-y-4 px-4 py-3 text-sm">
            {showDateRange ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-text-secondary">
                    Plage de dates
                  </p>
                  <button
                    type="button"
                    className="text-xs text-secondary hover:underline dark:text-accent"
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
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
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
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </label>
                </div>
              </div>
            ) : null}

            {showCategory ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-text-secondary">
                    Catégorie
                  </p>
                  <button
                    type="button"
                    className="text-xs text-secondary hover:underline dark:text-accent"
                    onClick={() =>
                      setValues((prev) => ({
                        ...prev,
                        category: resolvedCategories[0]?.id ?? "",
                      }))
                    }
                  >
                    Réinitialiser
                  </button>
                </div>
                <select
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  value={values.category}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      category: event.target.value,
                    }))
                  }
                >
                  {resolvedCategories.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-text-secondary">
                  Stock
                </p>
                <button
                  type="button"
                  className="text-xs text-secondary hover:underline dark:text-accent"
              onClick={() =>
                setValues((prev) => ({
                  ...prev,
                  stock: resolvedStocks[0]?.id ?? "",
                }))
              }
              >
                Réinitialiser
              </button>
            </div>
              <select
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                value={values.stock}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, stock: event.target.value }))
                }
              >
                {resolvedStocks.map((option) => (
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
                  className="text-xs text-secondary hover:underline dark:text-accent"
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
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
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
                  className="text-xs text-secondary hover:underline dark:text-accent"
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
                  className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-12 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border bg-surface/80 px-2 py-0.5 text-[10px] text-text-secondary">
                  ⌘ K
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border bg-surface/80 px-4 py-3">
            <button
              type="button"
              onClick={handleResetAll}
              className="rounded-lg bg-neutral-200 px-3 py-2 text-sm font-medium text-text-primary hover:bg-neutral-300 dark:bg-surface dark:border dark:border-border dark:hover:bg-surface/70"
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
