export const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export const formatAmount = (value, symbol = "$") => {
  const amount = Number(value || 0);
  return `${symbol}${amount.toFixed(2)}`;
};

export const formatName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
  user?.name ||
  user?.email ||
  "N/A";

export const shortId = (value, prefix = "") => {
  if (!value) return "";
  const slice = String(value).replace(/-/g, "").slice(-6).toUpperCase();
  return prefix ? `${prefix}${slice}` : slice;
};
