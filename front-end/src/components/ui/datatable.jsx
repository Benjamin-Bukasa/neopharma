import React, { useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import Button from "./button";
import Input from "./input";
import DropdownFilter from "./dropdownFilter";
import DropdownSort from "./dropdownSort";

const resolveAccessor = (row, accessor) => {
  if (typeof accessor === "function") return accessor(row);
  if (!accessor) return "";
  return row?.[accessor];
};

const DataTable = ({
  title,
  description,
  columns = [],
  data = [],
  rowKey = "id",
  enableSelection = true,
  onSelectionChange,
  onDeleteSelected,
  renderActions,
  actionsHeader = "Actions",
  emptyMessage = "Aucune donnée",
  tableClassName = "",
  tableContainerClassName = "",
  headerClassName = "",
  rowClassName = "",
  cellClassName = "",
  searchInput,
  filterItems,
  sortItems,
  onFilterSelect,
  onSortSelect,
  filterLabel,
  sortLabel,
  pageSizeSelect,
  pagination,
}) => {
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());
  const headerCheckboxRef = useRef(null);

  const getRowKey = (row, index) =>
    typeof rowKey === "function" ? rowKey(row, index) : row?.[rowKey] ?? index;

  const allKeys = useMemo(
    () => data.map((row, index) => getRowKey(row, index)),
    [data, rowKey]
  );
  const allKeySet = useMemo(() => new Set(allKeys), [allKeys]);
  const selectedCount = selectedKeys.size;
  const allSelected =
    allKeys.length > 0 && allKeys.every((key) => selectedKeys.has(key));
  const someSelected = allKeys.some((key) => selectedKeys.has(key));

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  useEffect(() => {
    setSelectedKeys((prev) => {
      const next = new Set();
      prev.forEach((key) => {
        if (allKeySet.has(key)) next.add(key);
      });
      return next;
    });
  }, [allKeySet]);

  useEffect(() => {
    if (typeof onSelectionChange !== "function") return;
    const selectedRows = data.filter((row, index) =>
      selectedKeys.has(getRowKey(row, index))
    );
    onSelectionChange(selectedRows, Array.from(selectedKeys));
  }, [selectedKeys, data, rowKey, onSelectionChange]);

  const showActions = typeof renderActions === "function";
  const showSelection = enableSelection;
  const getPaginationItems = (current, total) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => ({
        type: "page",
        value: i + 1,
      }));
    }

    const items = [];
    const addPage = (value) => items.push({ type: "page", value });
    const addEllipsis = (key) => items.push({ type: "ellipsis", key });

    addPage(1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) addEllipsis("left");

    for (let i = start; i <= end; i += 1) {
      addPage(i);
    }

    if (end < total - 1) addEllipsis("right");

    addPage(total);

    return items;
  };

  return (
    
    <div className="">
      {title || description ? (
        <div className="">
          {title ? <h3 className="text-xl font-semibold">{title}</h3> : null}
          {description ? (
            <p className="text-sm text-gray-500">{description}</p>
          ) : null}
          <div className="flex items-center justify-end gap-4">
            {searchInput ? (
              <div className="w-64">
                <Input
                  label={searchInput.label}
                  name={searchInput.name ?? "search"}
                  register={searchInput.register}
                  errors={searchInput.errors}
                  value={searchInput.value}
                  onChange={(event) =>
                    searchInput.onChange?.(event.target.value)
                  }
                  placeholder={searchInput.placeholder ?? "Rechercher..."}
                  type={searchInput.type ?? "text"}
                  aria-label={searchInput.ariaLabel ?? "Recherche"}
                />
              </div>
            ) : null}
            <DropdownFilter
              label={filterLabel}
              items={filterItems}
              onApply={onFilterSelect}
            />
            <DropdownSort
              label={sortLabel}
              items={sortItems}
              onApply={onSortSelect}
            />
            {pageSizeSelect ? (
              <label className="flex items-center gap-2 text-sm text-gray-500">
                {pageSizeSelect.label ?? "Afficher"}
                <select
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none "
                  value={pageSizeSelect.value}
                  onChange={(event) =>
                    pageSizeSelect.onChange?.(Number(event.target.value))
                  }
                >
                  {pageSizeSelect.options?.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {showSelection ? (
              <Button
                label={
                  <div className="flex items-center gap-2">
                    <span>Supprimer</span>
                    <Trash2 size={16} strokeWidth={1.5} />
                  </div>
                }
                variant={selectedCount === 0 ? "default" : "destructive"}
                className={
                  selectedCount === 0
                    ? "bg-[#b0bbb7] text-text-primary hover:bg-[#a6b1ad] disabled:bg-[#b0bbb7] disabled:text-text-primary disabled:opacity-100 disabled:cursor-not-allowed"
                    : ""
                }
                size="default"
                type="button"
                disabled={selectedCount === 0}
                onClick={() => {
                  if (typeof onDeleteSelected !== "function") return;
                  const selectedRows = data.filter((row, index) =>
                    selectedKeys.has(getRowKey(row, index))
                  );
                  onDeleteSelected(selectedRows, Array.from(selectedKeys));
                }}
              />
            ) : null}
            
          </div>
        </div>
      ) : null}

       <div
        className={[
          "table-scroll mt-4 max-h-[60vh] overflow-y-auto rounded-xl border border-gray-200",
          tableContainerClassName,
        ].join(" ")}
      >
      <table
        className={[
            "w-full text-sm table-auto border-collapse",
            tableClassName,
        ].join(" ")}
        >
        <thead className="sticky top-0 z-10 bg-[#b0bbb7]">
          <tr>
            {showSelection ? (
              <th className="border-0 border-b border-gray-200 px-4 py-4 text-left w-10">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                  checked={allSelected}
                  onChange={() => {
                    setSelectedKeys(() =>
                      allSelected ? new Set() : new Set(allKeys)
                    );
                  }}
                  aria-label="Selectionner toutes les lignes"
                />
              </th>
            ) : null}
            {columns.map((column) => (
              <th
                key={column.key ?? column.accessor ?? column.header}
                className={[
                    "border-0 border-b border-gray-200 px-4 py-4 text-left",
                    headerClassName,
                    column.headerClassName ?? "",
                ].join(" ")}
                >
                {column.header}
              </th>
            ))}
            {showActions ? (
              <th className="border-0 border-b border-gray-200 px-4 py-4 text-left">
                {actionsHeader}
              </th>
            ) : null}
          </tr>
        </thead>
        
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                className="border-b border-gray-200 px-4 py-6 text-center text-sm text-gray-500"
                colSpan={columns.length + (showActions ? 1 : 0)}
                >
                {emptyMessage}
              </td>
            </tr>
          ) : (
              data.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                className={[
                  "border-b border-gray-200 hover:bg-gray-50",
                  rowClassName,
                ].join(" ")}
              >
                {showSelection ? (
                  <td className="border-0 px-4 py-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                      checked={selectedKeys.has(getRowKey(row, index))}
                      onChange={() => {
                        const key = getRowKey(row, index);
                        setSelectedKeys((prev) => {
                          const next = new Set(prev);
                          if (next.has(key)) {
                            next.delete(key);
                          } else {
                            next.add(key);
                          }
                          return next;
                        });
                      }}
                      aria-label={`Selectionner la ligne ${index + 1}`}
                    />
                  </td>
                ) : null}
                {columns.map((column) => (
                  <td
                    key={column.key ?? column.accessor ?? column.header}
                    className={[
                        "border-0 px-4 py-2",
                        cellClassName,
                        column.className ?? "",
                    ].join(" ")}
                  >
                    {column.render
                      ? column.render(row, index)
                      : resolveAccessor(row, column.accessor)}
                  </td>
                ))}
                {showActions ? (
                    <td className="border-0 px-4 py-2">
                    {renderActions(row, index)}
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

      {pagination ? (
  <div className="w-full flex items-center justify-between">
    <div className="text-center text-sm text-gray-500 mt-2">
      {pagination.label ??
        `Page ${pagination.page ?? 1} sur ${pagination.totalPages ?? 1}`}
    </div>
    <div className="flex justify-center gap-2 mt-4 flex-wrap">
      {getPaginationItems(
        pagination.page ?? 1,
        pagination.totalPages ?? 1
      ).map((item) => {
        if (item.type === "ellipsis") {
          return (
            <button
              key={item.key}
              type="button"
              disabled
              className="px-3 py-1.5 rounded-lg text-sm font-medium border bg-gray-100 text-gray-400 cursor-default"
            >
              ...
            </button>
          );
        }

        const isActive = item.value === (pagination.page ?? 1);
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              if (isActive) return;
              if (typeof pagination.onPageChange === "function") {
                pagination.onPageChange(item.value);
                return;
              }
              if (item.value < (pagination.page ?? 1)) {
                pagination.onPrev?.();
                return;
              }
              if (item.value > (pagination.page ?? 1)) {
                pagination.onNext?.();
              }
            }}
            className={[
              "px-3 py-1.5 rounded-lg text-sm font-medium border",
              isActive
                ? "bg-[#b0bbb7] text-text-primary border-[#b0bbb7]"
                : "bg-gray-200 text-gray-800 border-gray-200 hover:bg-gray-300",
            ].join(" ")}
          >
            {item.value}
          </button>
        );
      })}
    </div>
  </div>
) : null}
    </div>
  );
};

export default DataTable;

