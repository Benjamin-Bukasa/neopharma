import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AdminDataTable from "../components/ui/AdminDataTable";
import DropdownAction from "../components/ui/dropdownAction";
import { ApiError, requestBlob, requestJson } from "../api/client";
import {
  findRouteByPath,
  getCreateConfig,
  getResourceConfig,
  getTableActionConfig,
} from "../routes/router";
import useAuthStore from "../stores/authStore";

const toRows = (payload) => {
  if (Array.isArray(payload)) {
    return { rows: payload, meta: null };
  }

  if (Array.isArray(payload?.data)) {
    return { rows: payload.data, meta: payload.meta || null };
  }

  return { rows: [], meta: null };
};

const resolveAccessor = (row, accessor) => {
  if (typeof accessor === "function") return accessor(row);
  if (!accessor) return undefined;

  return String(accessor)
    .split(".")
    .reduce((value, segment) => (value == null ? value : value[segment]), row);
};

const statusLabels = {
  DRAFT: "Non valide",
  SUBMITTED: "En cours",
  APPROVED: "Valide",
  SENT: "Valide",
  ORDERED: "Commande creee",
};

const filterDefinitions = [
  {
    id: "status",
    label: "Statut",
    accessor: "status",
    queryKey: "status",
    formatLabel: (value) => statusLabels[value] || value,
  },
  {
    id: "role",
    label: "Role",
    accessor: "role",
    queryKey: "role",
  },
  {
    id: "movementType",
    label: "Type mouvement",
    accessor: "movementType",
    queryKey: "movementType",
  },
  {
    id: "sourceType",
    label: "Source",
    accessor: "sourceType",
    queryKey: "sourceType",
  },
  {
    id: "type",
    label: "Type",
    accessor: "type",
    queryKey: "type",
  },
  {
    id: "zoneType",
    label: "Type zone",
    accessor: "zoneType",
    queryKey: "zoneType",
  },
  {
    id: "isActive",
    label: "Etat",
    accessor: "isActive",
    queryKey: "isActive",
    serialize: (value) => String(Boolean(value)),
    formatLabel: (value) =>
      String(value) === "true" || value === true ? "Actif" : "Inactif",
  },
];

const isEmptyValue = (value) =>
  value === undefined || value === null || value === "";

const toDateComparable = (value) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.getTime();
  }

  if (typeof value !== "string") {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}/.test(value) && !value.includes("T")) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

const compareValues = (left, right) => {
  if (isEmptyValue(left) && isEmptyValue(right)) return 0;
  if (isEmptyValue(left)) return 1;
  if (isEmptyValue(right)) return -1;

  if (typeof left === "boolean" || typeof right === "boolean") {
    return Number(Boolean(left)) - Number(Boolean(right));
  }

  const leftDate = toDateComparable(left);
  const rightDate = toDateComparable(right);
  if (leftDate !== null && rightDate !== null) {
    return leftDate - rightDate;
  }

  const leftNumber = Number(left);
  const rightNumber = Number(right);
  if (
    Number.isFinite(leftNumber) &&
    Number.isFinite(rightNumber) &&
    String(left).trim() !== "" &&
    String(right).trim() !== ""
  ) {
    return leftNumber - rightNumber;
  }

  return String(left).localeCompare(String(right), "fr", {
    sensitivity: "base",
    numeric: true,
  });
};

const getRowDate = (row) =>
  row?.receivedAt || row?.orderDate || row?.createdAt || row?.updatedAt || null;

const buildSortItems = (columns = []) => {
  const seen = new Set();

  return columns.reduce((accumulator, column) => {
    const accessor = column.sortBy || column.accessor;
    if (typeof accessor !== "string" || !accessor) {
      return accumulator;
    }

    if (seen.has(accessor)) {
      return accumulator;
    }

    seen.add(accessor);
    accumulator.push({
      id: accessor,
      label: column.header,
      accessor,
      serverField: accessor.includes(".") ? null : accessor,
    });
    return accumulator;
  }, []);
};

const toPlainValue = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const buildCsvContent = (columns = [], rows = []) => {
  const escapeCell = (value) => `"${toPlainValue(value).replace(/"/g, '""')}"`;
  const header = columns.map((column) => escapeCell(column.header)).join(",");
  const lines = rows.map((row) =>
    columns
      .map((column) => {
        const value = column.accessor
          ? resolveAccessor(row, column.accessor)
          : undefined;
        return escapeCell(value);
      })
      .join(","),
  );

  return [header, ...lines].join("\n");
};

const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 60000);
};

const slugify = (value = "export") => {
  const normalized = String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "export";
};

const AdminResourcePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentRoute = findRouteByPath(location.pathname);
  const resource = getResourceConfig(currentRoute.path);
  const createConfig = getCreateConfig(currentRoute.path);
  const tableActionConfig = getTableActionConfig(currentRoute.path);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const [rows, setRows] = useState(resource?.staticRows || []);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(Boolean(resource?.endpoint));
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(resource?.pageSize || 10);
  const [refreshTick, setRefreshTick] = useState(0);
  const [pendingActionKey, setPendingActionKey] = useState("");
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ sortBy: "", sortDir: "desc" });

  useEffect(() => {
    setPage(1);
    setSearch("");
    setFilters({});
    setSort({ sortBy: "", sortDir: "desc" });
    setError("");
    setPageSize(resource?.pageSize || 10);
  }, [location.pathname, resource?.pageSize]);

  const sortItems = useMemo(
    () => buildSortItems(resource?.columns || []),
    [resource?.columns],
  );

  const activeSortItem = useMemo(
    () => sortItems.find((item) => item.id === sort.sortBy) || null,
    [sort.sortBy, sortItems],
  );

  const buildQuery = useCallback(
    ({ includePagination = true, exportType } = {}) => {
      const query = {
        ...(resource?.defaultQuery || {}),
        ...(search ? { search } : {}),
        ...(filters.createdFrom ? { createdFrom: filters.createdFrom } : {}),
        ...(filters.createdTo ? { createdTo: filters.createdTo } : {}),
      };

      filterDefinitions.forEach((definition) => {
        const selectedValue = filters[definition.id];
        if (!selectedValue || selectedValue === "all") {
          return;
        }

        query[definition.queryKey || definition.id] = selectedValue;
      });

      if (activeSortItem?.serverField) {
        query.sortBy = activeSortItem.serverField;
        query.sortDir = sort.sortDir;
      }

      if (includePagination) {
        query.paginate = true;
        query.page = page;
        query.pageSize = pageSize;
      }

      if (exportType) {
        query.export = exportType;
      }

      return query;
    },
    [activeSortItem?.serverField, filters, page, pageSize, resource?.defaultQuery, search, sort.sortDir],
  );

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      if (!resource) {
        setRows([]);
        setMeta(null);
        setLoading(false);
        setError("");
        return;
      }

      if (!resource.endpoint) {
        setRows(resource.staticRows || []);
        setMeta(null);
        setLoading(false);
        setError(resource.notice || "");
        return;
      }

      if (!accessToken) {
        setRows([]);
        setMeta(null);
        setLoading(false);
        setError("Session manquante.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const payload = await requestJson(resource.endpoint, {
          token: accessToken,
          query: buildQuery(),
        });

        if (ignore) return;

        const { rows: nextRows, meta: nextMeta } = toRows(payload);
        setRows(resource.transformRows ? resource.transformRows(nextRows) : nextRows);
        setMeta(nextMeta);
      } catch (requestError) {
        if (ignore) return;

        if (
          requestError instanceof ApiError &&
          (requestError.status === 401 || requestError.status === 403)
        ) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }

        setRows([]);
        setMeta(null);
        setError(requestError.message || "Impossible de charger les donnees.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [accessToken, buildQuery, logout, navigate, refreshTick, resource]);

  const displayedRows = useMemo(() => {
    const filteredRows = rows.filter((row) => {
      const rowDate = getRowDate(row);

      if (filters.createdFrom) {
        const fromDate = new Date(filters.createdFrom);
        if (!Number.isNaN(fromDate.getTime())) {
          const rowTimestamp = rowDate ? new Date(rowDate).getTime() : null;
          if (rowTimestamp !== null && rowTimestamp < fromDate.getTime()) {
            return false;
          }
        }
      }

      if (filters.createdTo) {
        const toDate = new Date(filters.createdTo);
        toDate.setHours(23, 59, 59, 999);
        if (!Number.isNaN(toDate.getTime())) {
          const rowTimestamp = rowDate ? new Date(rowDate).getTime() : null;
          if (rowTimestamp !== null && rowTimestamp > toDate.getTime()) {
            return false;
          }
        }
      }

      return filterDefinitions.every((definition) => {
        const selectedValue = filters[definition.id];
        if (!selectedValue || selectedValue === "all") {
          return true;
        }

        const rawValue = resolveAccessor(row, definition.accessor);
        const serializedValue = definition.serialize
          ? definition.serialize(rawValue)
          : toPlainValue(rawValue);

        return serializedValue === selectedValue;
      });
    });

    if (!activeSortItem) {
      return filteredRows;
    }

    return [...filteredRows].sort((leftRow, rightRow) => {
      const leftValue = resolveAccessor(leftRow, activeSortItem.accessor);
      const rightValue = resolveAccessor(rightRow, activeSortItem.accessor);
      const result = compareValues(leftValue, rightValue);
      return sort.sortDir === "asc" ? result : -result;
    });
  }, [activeSortItem, filters, rows, sort.sortDir]);

  const filterSections = useMemo(() => {
    const sections = [];
    const shouldShowDate = Boolean(resource?.endpoint) || rows.some((row) => getRowDate(row));

    if (shouldShowDate) {
      sections.push(
        {
          id: "createdFrom",
          label: "Date du",
          type: "date",
          value: filters.createdFrom || "",
        },
        {
          id: "createdTo",
          label: "Date au",
          type: "date",
          value: filters.createdTo || "",
        },
      );
    }

    filterDefinitions.forEach((definition) => {
      const optionsMap = new Map();

      rows.forEach((row) => {
        const rawValue = resolveAccessor(row, definition.accessor);
        if (isEmptyValue(rawValue)) {
          return;
        }

        const serializedValue = definition.serialize
          ? definition.serialize(rawValue)
          : toPlainValue(rawValue);
        const label = definition.formatLabel
          ? definition.formatLabel(rawValue)
          : toPlainValue(rawValue);
        optionsMap.set(serializedValue, label);
      });

      const selectedValue = filters[definition.id];
      if (selectedValue && selectedValue !== "all" && !optionsMap.has(selectedValue)) {
        const restoredLabel = definition.formatLabel
          ? definition.formatLabel(selectedValue)
          : selectedValue;
        optionsMap.set(selectedValue, restoredLabel);
      }

      if (!optionsMap.size) {
        return;
      }

      sections.push({
        id: definition.id,
        label: definition.label,
        type: "select",
        value: selectedValue || "all",
        options: [
          { value: "all", label: "Tous" },
          ...Array.from(optionsMap.entries()).map(([value, label]) => ({
            value,
            label,
          })),
        ],
      });
    });

    return sections;
  }, [filters, resource?.endpoint, rows]);

  const pagination = useMemo(() => {
    if (!resource?.endpoint) return null;

    return {
      page: meta?.page || page,
      pageSize: meta?.pageSize || pageSize,
      totalPages: meta?.totalPages || 1,
      total: meta?.total || rows.length,
      visibleTotal: displayedRows.length,
      onPageChange: (nextPage) => {
        if (nextPage < 1) return;
        if (meta?.totalPages && nextPage > meta.totalPages) return;
        setPage(nextPage);
      },
      onPageSizeChange: (nextSize) => {
        setPageSize(nextSize);
        setPage(1);
      },
    };
  }, [displayedRows.length, meta, page, pageSize, resource?.endpoint, rows.length]);

  const handleRowAction = useCallback(
    async (action, row) => {
      if (!accessToken) {
        setError("Session manquante.");
        return;
      }

      setPendingActionKey(`${action.id}:${row.id}`);
      setError("");

      try {
        await requestJson(action.endpoint(row), {
          token: accessToken,
          method: action.method || "POST",
          body: action.body ? action.body(row) : undefined,
        });

        setRefreshTick((current) => current + 1);
      } catch (requestError) {
        if (
          requestError instanceof ApiError &&
          (requestError.status === 401 || requestError.status === 403)
        ) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }

        setError(requestError.message || "Impossible d'executer cette action.");
      } finally {
        setPendingActionKey("");
      }
    },
    [accessToken, logout, navigate],
  );

  const handleDelete = useCallback(
    async (row) => {
      if (!tableActionConfig.deleteRequest || !accessToken) return;

      setPendingActionKey(`delete:${row.id}`);
      setError("");

      try {
        const request = tableActionConfig.deleteRequest(row.id, row);
        await requestJson(request.endpoint, {
          token: accessToken,
          method: request.method || "DELETE",
          body: request.body,
        });
        setRefreshTick((current) => current + 1);
      } catch (requestError) {
        if (
          requestError instanceof ApiError &&
          (requestError.status === 401 || requestError.status === 403)
        ) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }

        setError(requestError.message || "Impossible de supprimer cette ligne.");
      } finally {
        setPendingActionKey("");
      }
    },
    [accessToken, logout, navigate, tableActionConfig],
  );

  const handlePdfOpen = useCallback(
    async (row) => {
      if (!tableActionConfig.pdfUrl || !accessToken) return;

      const pdfPath = tableActionConfig.pdfUrl(row);
      if (!pdfPath) return;
      const openedWindow = window.open("", "_blank", "noopener,noreferrer");

      setPendingActionKey(`pdf:${row.id}`);
      setError("");

      try {
        const blob = await requestBlob(pdfPath, { token: accessToken });
        const url = window.URL.createObjectURL(blob);
        if (!openedWindow) {
          window.URL.revokeObjectURL(url);
          throw new Error("Le navigateur a bloque l'ouverture du PDF.");
        }
        openedWindow.location.href = url;
        window.setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      } catch (requestError) {
        if (openedWindow) {
          openedWindow.close();
        }
        if (
          requestError instanceof ApiError &&
          (requestError.status === 401 || requestError.status === 403)
        ) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }

        setError(requestError.message || "Impossible d'ouvrir le PDF.");
      } finally {
        setPendingActionKey("");
      }
    },
    [accessToken, logout, navigate, tableActionConfig],
  );

  const handleExport = useCallback(
    async (item) => {
      if (!item?.id) {
        return;
      }

      setError("");

      try {
        if (resource?.endpoint) {
          if (!accessToken) {
            setError("Session manquante.");
            return;
          }

          const blob = await requestBlob(resource.endpoint, {
            token: accessToken,
            query: buildQuery({ includePagination: false, exportType: item.id }),
          });
          downloadBlob(blob, `${slugify(currentRoute.name)}.${item.id}`);
          return;
        }

        if (item.id !== "csv") {
          setError("L'export local est disponible uniquement en CSV.");
          return;
        }

        const csv = buildCsvContent(resource?.columns || [], displayedRows);
        downloadBlob(
          new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" }),
          `${slugify(currentRoute.name)}.csv`,
        );
      } catch (requestError) {
        if (
          requestError instanceof ApiError &&
          (requestError.status === 401 || requestError.status === 403)
        ) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }

        setError(requestError.message || "Impossible d'exporter les donnees.");
      }
    },
    [accessToken, buildQuery, currentRoute.name, displayedRows, logout, navigate, resource],
  );

  const renderActions = useCallback(
    (row) => {
      const customActions = (resource?.rowActions || []).filter(
        (action) => !action.visible || action.visible(row),
      );
      const canEdit = tableActionConfig.canEdit?.(row);
      const canDelete = tableActionConfig.canDelete?.(row);
      const detailPath = tableActionConfig.detailPath;
      const pdfPath = tableActionConfig.pdfUrl?.(row);
      const items = [];

      if (pdfPath) {
        items.push({
          id: `pdf:${row.id}`,
          label: "Ouvrir le PDF",
          icon: FileText,
          disabled: Boolean(pendingActionKey),
          onClick: () => handlePdfOpen(row),
        });
      }

      if (canEdit && tableActionConfig.editPath) {
        items.push({
          id: `edit:${row.id}`,
          label: "Modifier",
          icon: Pencil,
          disabled: Boolean(pendingActionKey),
          onClick: () =>
            navigate(`${tableActionConfig.editPath}?id=${row.id}`, {
              state: { row },
            }),
        });
      }

      if (canDelete && tableActionConfig.deleteRequest) {
        items.push({
          id: `delete:${row.id}`,
          label: "Supprimer",
          icon: Trash2,
          variant: "danger",
          disabled: Boolean(pendingActionKey),
          onClick: () => handleDelete(row),
        });
      }

      if (detailPath) {
        items.push({
          id: `detail:${row.id}`,
          label: "Detail",
          icon: Eye,
          disabled: Boolean(pendingActionKey),
          onClick: () =>
            navigate(`${detailPath}?id=${row.id}`, {
              state: { row },
            }),
        });
      }

      customActions.forEach((action) => {
        const isPending = pendingActionKey === `${action.id}:${row.id}`;
        items.push({
          id: `${action.id}:${row.id}`,
          label: isPending ? `${action.label}...` : action.label,
          icon: action.tone === "danger" ? XCircle : CheckCircle2,
          variant: action.tone === "danger" ? "danger" : undefined,
          disabled: Boolean(pendingActionKey),
          onClick: () => handleRowAction(action, row),
        });
      });

      if (!items.length) {
        items.push({
          id: `empty:${row.id}`,
          label: "Aucune action disponible",
          disabled: true,
        });
      }

      return (
        <DropdownAction
          label={<MoreHorizontal size={16} strokeWidth={1.5} />}
          items={items}
          disabled={Boolean(pendingActionKey)}
          buttonClassName="rounded-lg border border-border bg-background/70 p-2 hover:bg-background dark:bg-background/40"
          menuClassName="min-w-[220px]"
        />
      );
    },
    [
      handleDelete,
      handlePdfOpen,
      handleRowAction,
      navigate,
      pendingActionKey,
      resource?.rowActions,
      tableActionConfig,
    ],
  );

  const actionSlot =
    resource?.actionSlot || createConfig ? (
      <div className="flex flex-wrap items-center gap-2">
        {resource?.actionSlot}
        {createConfig ? (
          <Link
            to={createConfig.createPath}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Plus size={16} />
            Nouveau
          </Link>
        ) : null}
      </div>
    ) : null;

  return (
    <div className="layoutSection flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full bg-header/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
              {currentRoute.sectionLabel}
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-text-primary">
              {currentRoute.name}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {resource?.description || currentRoute.summary}
            </p>
          </div>
        </div>
      </section>

      <AdminDataTable
        title={resource?.tableTitle || `Tableau ${currentRoute.name.toLowerCase()}`}
        description={resource?.tableDescription || currentRoute.summary}
        columns={resource?.columns || []}
        rows={displayedRows}
        loading={loading}
        error={error}
        emptyMessage={
          resource?.emptyMessage || "Aucune donnee disponible pour cette vue."
        }
        searchValue={search}
        onSearchChange={resource?.searchEnabled === false ? undefined : setSearch}
        searchPlaceholder={
          resource?.searchPlaceholder ||
          `Rechercher dans ${currentRoute.name.toLowerCase()}`
        }
        filterSections={filterSections}
        onFilterApply={(nextFilters) => {
          setFilters(nextFilters);
          setPage(1);
        }}
        onFilterReset={(nextFilters) => {
          setFilters(nextFilters);
          setPage(1);
        }}
        sortItems={sortItems}
        sortValue={sort}
        onSortApply={(nextSort) => {
          setSort({
            sortBy: nextSort.sortBy || "",
            sortDir: nextSort.sortDir || "desc",
          });
          setPage(1);
        }}
        onSortReset={() => {
          setSort({ sortBy: "", sortDir: "desc" });
          setPage(1);
        }}
        onExportSelect={handleExport}
        exportItems={resource?.endpoint ? undefined : [{ id: "csv", label: "CSV" }]}
        exportDisabled={!resource?.endpoint && displayedRows.length === 0}
        pagination={pagination}
        actionSlot={actionSlot}
        enableSelection
        renderActions={renderActions}
        actionsHeader="Actions"
      />
    </div>
  );
};

export default AdminResourcePage;
