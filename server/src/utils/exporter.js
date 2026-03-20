const xlsx = require("xlsx");

const escapeCsv = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const toCsv = (rows) => {
  if (!rows.length) {
    return "";
  }
  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(escapeCsv).join(",");
  const lines = rows.map((row) =>
    headers.map((key) => escapeCsv(row[key])).join(",")
  );
  return [headerLine, ...lines].join("\n");
};

const sendExport = (res, rows, filename, type = "csv") => {
  if (type === "xlsx") {
    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Export");
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.xlsx"`
    );
    return res.send(buffer);
  }

  const csvContent = toCsv(rows);
  const bom = "\ufeff";
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
  return res.send(bom + csvContent);
};

module.exports = {
  sendExport,
};
