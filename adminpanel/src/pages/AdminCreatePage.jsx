import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, requestJson } from "../api/client";
import {
  findRouteByPath,
  getCreatePageConfig,
  getEditPageConfig,
} from "../routes/router";
import useAuthStore from "../stores/authStore";

const pickRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const resolvePath = (source, accessor) => {
  if (typeof accessor === "function") return accessor(source);
  if (!accessor) return source;

  return String(accessor)
    .split(".")
    .reduce((value, part) => (value == null ? value : value[part]), source);
};

const fieldSourceKey = (field) =>
  `${field.optionsEndpoint || ""}::${JSON.stringify(field.query || {})}`;

const getDefaultFieldValue = (field, index = 0) => {
  if (typeof field.initialValue === "function") {
    return field.initialValue(index);
  }

  if (field.initialValue !== undefined) {
    return field.initialValue;
  }

  return field.type === "checkbox" ? false : "";
};

const buildRow = (repeater, index = 0) => {
  if (typeof repeater.createRow === "function") {
    return repeater.createRow(index);
  }

  return (repeater.fields || []).reduce(
    (accumulator, field) => ({
      ...accumulator,
      [field.name]: getDefaultFieldValue(field, index),
    }),
    {},
  );
};

const buildInitialValues = (config) => {
  const baseValues = (config?.fields || []).reduce(
    (accumulator, field) => ({
      ...accumulator,
      [field.name]: getDefaultFieldValue(field),
    }),
    {},
  );

  (config?.repeaters || []).forEach((repeater) => {
    const minRows = repeater.minRows || 0;
    baseValues[repeater.name] = Array.from({ length: minRows }, (_, index) =>
      buildRow(repeater, index),
    );
  });

  return baseValues;
};

const collectOptionFields = (config) => {
  const topFields = config?.fields || [];
  const repeaterFields = (config?.repeaters || []).flatMap(
    (repeater) => repeater.fields || [],
  );

  return [...topFields, ...repeaterFields].filter((field) => field.optionsEndpoint);
};

const normalizeOptions = (field, rows) =>
  rows
    .map((item) => ({
      value: resolvePath(item, field.optionValue || "id"),
      label: resolvePath(item, field.optionLabel || "name"),
    }))
    .filter((item) => item.value !== undefined && item.value !== null);

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary outline-none transition focus:border-secondary";

const renderFieldInput = ({
  field,
  value,
  onChange,
  options = [],
  disabled = false,
}) => {
  const commonProps = {
    name: field.name,
    required: field.required,
    disabled,
    className: inputClassName,
  };

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          {...commonProps}
          rows={field.rows || 4}
          value={value ?? ""}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "select":
      return (
        <select
          {...commonProps}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{field.placeholder || "Selectionner..."}</option>
          {options.map((option) => (
            <option key={`${field.name}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case "checkbox":
      return (
        <label className="inline-flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
          />
          {field.checkboxLabel || field.label}
        </label>
      );

    default:
      return (
        <input
          {...commonProps}
          type={field.type || "text"}
          value={value ?? ""}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
};

const AdminCreatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentRoute = findRouteByPath(location.pathname);
  const editConfig = getEditPageConfig(location.pathname);
  const createConfig = getCreatePageConfig(location.pathname);
  const formConfig = editConfig || createConfig;
  const isEditing = Boolean(editConfig);
  const recordId = searchParams.get("id") || "";
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);

  const [values, setValues] = useState(() => buildInitialValues(formConfig));
  const [optionStore, setOptionStore] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setValues(buildInitialValues(formConfig));
    setError("");
    setSuccess("");
  }, [formConfig]);

  useEffect(() => {
    let ignore = false;

    const loadOptions = async () => {
      if (!formConfig || !accessToken) {
        setOptionStore({});
        return;
      }

      const fields = collectOptionFields(formConfig);
      if (!fields.length) {
        setOptionStore({});
        return;
      }

      const uniqueFields = new Map();
      fields.forEach((field) => {
        const key = fieldSourceKey(field);
        if (!uniqueFields.has(key)) {
          uniqueFields.set(key, field);
        }
      });

      setLoadingOptions(true);

      try {
        const entries = await Promise.all(
          [...uniqueFields.entries()].map(async ([key, field]) => {
            const payload = await requestJson(field.optionsEndpoint, {
              token: accessToken,
              query: field.query,
            });

            return [key, normalizeOptions(field, pickRows(payload))];
          }),
        );

        if (ignore) return;
        setOptionStore(Object.fromEntries(entries));
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

        setError(requestError.message || "Impossible de charger les options.");
      } finally {
        if (!ignore) {
          setLoadingOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      ignore = true;
    };
  }, [accessToken, formConfig, logout, navigate]);

  useEffect(() => {
    let ignore = false;

    const loadRecord = async () => {
      if (!isEditing || !formConfig) return;

      const stateRow = location.state?.row;
      if (stateRow && formConfig.buildFormValues) {
        setValues((current) => ({
          ...current,
          ...formConfig.buildFormValues(stateRow),
        }));
        return;
      }

      if (!recordId || !formConfig.detailEndpoint || !accessToken) {
        return;
      }

      setLoadingRecord(true);

      try {
        const payload = await requestJson(formConfig.detailEndpoint(recordId), {
          token: accessToken,
        });

        if (ignore) return;
        if (formConfig.buildFormValues) {
          setValues((current) => ({
            ...current,
            ...formConfig.buildFormValues(payload),
          }));
        }
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

        setError(requestError.message || "Impossible de charger cette fiche.");
      } finally {
        if (!ignore) {
          setLoadingRecord(false);
        }
      }
    };

    loadRecord();

    return () => {
      ignore = true;
    };
  }, [accessToken, formConfig, isEditing, location.state, logout, navigate, recordId]);

  const repeaterMap = useMemo(
    () =>
      Object.fromEntries(
        (formConfig?.repeaters || []).map((repeater) => [repeater.name, repeater]),
      ),
    [formConfig],
  );

  const getFieldOptions = (field) => {
    if (field.options) return field.options;
    if (!field.optionsEndpoint) return [];
    return optionStore[fieldSourceKey(field)] || [];
  };

  const setFieldValue = (name, nextValue) => {
    setValues((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const setRepeaterFieldValue = (repeaterName, rowIndex, fieldName, nextValue) => {
    setValues((current) => ({
      ...current,
      [repeaterName]: (current[repeaterName] || []).map((row, index) =>
        index === rowIndex ? { ...row, [fieldName]: nextValue } : row,
      ),
    }));
  };

  const addRepeaterRow = (repeaterName) => {
    const repeater = repeaterMap[repeaterName];
    if (!repeater) return;

    setValues((current) => {
      const rows = current[repeaterName] || [];
      return {
        ...current,
        [repeaterName]: [...rows, buildRow(repeater, rows.length)],
      };
    });
  };

  const removeRepeaterRow = (repeaterName, rowIndex) => {
    const repeater = repeaterMap[repeaterName];
    if (!repeater) return;

    setValues((current) => {
      const rows = current[repeaterName] || [];
      const nextRows = rows.filter((_, index) => index !== rowIndex);

      return {
        ...current,
        [repeaterName]:
          nextRows.length >= (repeater.minRows || 0)
            ? nextRows
            : [buildRow(repeater, 0)],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formConfig) return;
    if (!accessToken) {
      setError("Session manquante.");
      return;
    }
    if (formConfig.unavailableMessage) {
      setError(formConfig.unavailableMessage);
      return;
    }

    if (isEditing && !recordId) {
      setError("Identifiant de modification manquant.");
      return;
    }

    const requests = isEditing
      ? [
          formConfig.buildUpdateRequest
            ? formConfig.buildUpdateRequest(values, recordId, location.state?.row)
            : {
                endpoint: formConfig.detailEndpoint?.(recordId),
                method: "PATCH",
                body: values,
              },
        ]
      : formConfig.buildRequests
        ? formConfig.buildRequests(values)
      : [
          formConfig.buildRequest
            ? formConfig.buildRequest(values)
            : {
                endpoint: formConfig.endpoint,
                method: formConfig.method || "POST",
                body: values,
              },
        ];

    const validRequests = requests.filter(
      (request) => request?.endpoint && request?.method !== undefined,
    );

    if (!validRequests.length) {
      setError("Aucune ligne valide a envoyer.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      for (const request of validRequests) {
        await requestJson(request.endpoint, {
          token: accessToken,
          method: request.method || "POST",
          body: request.body,
        });
      }

      setSuccess(
        isEditing
          ? formConfig.successMessage?.replace("cree", "mise a jour") ||
              "Modification enregistree."
          : formConfig.successMessage || "Creation enregistree.",
      );
      window.setTimeout(() => {
        navigate(formConfig.resourcePath || "/dashboard", { replace: true });
      }, 500);
    } catch (requestError) {
      if (
        requestError instanceof ApiError &&
        (requestError.status === 401 || requestError.status === 403)
      ) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }

      setError(requestError.message || "Impossible d'enregistrer ce formulaire.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!formConfig) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-text-secondary">Page de creation introuvable.</p>
      </section>
    );
  }

  return (
    <div className="layoutSection flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full bg-header/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
              {currentRoute.sectionLabel}
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-text-primary">
              {isEditing ? `Modifier ${currentRoute.name}` : formConfig.title}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {formConfig.description || currentRoute.summary}
            </p>
          </div>

          <Link
            to={formConfig.resourcePath}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-background"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
      >
        {loadingRecord ? (
          <div className="mb-4 rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-secondary">
            Chargement de la fiche...
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {(formConfig.fields || []).map((field) => (
            <div
              key={field.name}
              className={field.type === "textarea" ? "md:col-span-2" : ""}
            >
              {field.type !== "checkbox" ? (
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  {field.label}
                </label>
              ) : null}
              {renderFieldInput({
                field,
                value: values[field.name],
                onChange: (nextValue) => setFieldValue(field.name, nextValue),
                options: getFieldOptions(field),
                disabled: loadingOptions || submitting,
              })}
              {field.description ? (
                <p className="mt-2 text-xs text-text-secondary">{field.description}</p>
              ) : null}
            </div>
          ))}
        </div>

        {(formConfig.repeaters || []).map((repeater) => {
          const rows = values[repeater.name] || [];

          return (
            <section key={repeater.name} className="mt-6 rounded-2xl border border-border bg-background/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {repeater.label}
                  </h3>
                  {repeater.description ? (
                    <p className="mt-1 text-sm text-text-secondary">
                      {repeater.description}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => addRepeaterRow(repeater.name)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Plus size={16} />
                  {repeater.addLabel || "Ajouter"}
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-4">
                {rows.map((row, rowIndex) => (
                  <div
                    key={`${repeater.name}-${rowIndex}`}
                    className="rounded-2xl border border-border bg-surface p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-text-primary">
                        Ligne {rowIndex + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeRepeaterRow(repeater.name, rowIndex)}
                        disabled={rows.length <= (repeater.minRows || 0)}
                        className="inline-flex items-center gap-2 rounded-xl border border-danger/20 px-3 py-2 text-sm text-danger disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        Supprimer
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {(repeater.fields || []).map((field) => (
                        <div
                          key={`${repeater.name}-${rowIndex}-${field.name}`}
                          className={field.type === "textarea" ? "md:col-span-2 xl:col-span-3" : ""}
                        >
                          {field.type !== "checkbox" ? (
                            <label className="mb-2 block text-sm font-medium text-text-primary">
                              {field.label}
                            </label>
                          ) : null}
                          {renderFieldInput({
                            field,
                            value: row[field.name],
                            onChange: (nextValue) =>
                              setRepeaterFieldValue(
                                repeater.name,
                                rowIndex,
                                field.name,
                                nextValue,
                              ),
                            options: getFieldOptions(field),
                            disabled: loadingOptions || submitting,
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {formConfig.unavailableMessage ? (
          <div className="mt-6 rounded-xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-warning">
            {formConfig.unavailableMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
            {success}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Link
            to={formConfig.resourcePath}
            className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-background"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={
              submitting ||
              loadingOptions ||
              loadingRecord ||
              Boolean(formConfig.unavailableMessage)
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            {submitting
              ? "Enregistrement..."
              : isEditing
                ? "Enregistrer les modifications"
                : formConfig.submitLabel || "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreatePage;
