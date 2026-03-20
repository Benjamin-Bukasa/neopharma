const PDFDocument = require("pdfkit");

const formatDate = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR");
};

const toNumber = (value) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
};

const formatMoney = (value) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
  }).format(toNumber(value));

const buildStockEntryPdf = (entry) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(18).text("Entree de stock", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Reference: SE-${entry.id.slice(0, 8).toUpperCase()}`);
      doc.text(`Type source: ${entry.sourceType || "--"}`);
      doc.text(`Statut: ${entry.status || "PENDING"}`);
      doc.text(`Date creation: ${formatDate(entry.createdAt)}`);
      if (entry.approvedAt) doc.text(`Date validation: ${formatDate(entry.approvedAt)}`);
      if (entry.postedAt) doc.text(`Date comptabilisation: ${formatDate(entry.postedAt)}`);
      doc.moveDown(0.5);

      if (entry.store?.name) doc.text(`Boutique: ${entry.store.name}`);
      if (entry.storageZone?.name) doc.text(`Zone: ${entry.storageZone.name}`);
      if (entry.sourceId) doc.text(`Document source: ${entry.sourceId}`);
      if (entry.createdBy) {
        const createdBy = [entry.createdBy.firstName, entry.createdBy.lastName]
          .filter(Boolean)
          .join(" ");
        if (createdBy) doc.text(`Cree par: ${createdBy}`);
      }
      if (entry.approvedBy) {
        const approvedBy = [entry.approvedBy.firstName, entry.approvedBy.lastName]
          .filter(Boolean)
          .join(" ");
        if (approvedBy) doc.text(`Valide par: ${approvedBy}`);
      }
      if (entry.note) {
        doc.moveDown(0.5);
        doc.text(`Note: ${entry.note}`);
      }

      doc.moveDown();
      doc.fontSize(12).text("Lignes", { underline: true });
      doc.moveDown(0.5);

      (entry.items || []).forEach((item, index) => {
        const name = item.product?.name || "Produit";
        const unitLabel = item.unit?.symbol || item.unit?.name || "";
        const quantity = toNumber(item.quantity);
        const unitCost = toNumber(item.unitCost);

        doc
          .fontSize(10)
          .text(
            `${index + 1}. ${name} | Quantite: ${quantity} ${unitLabel} | Cout unitaire: ${formatMoney(
              unitCost,
            )}`,
          );
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });

module.exports = { buildStockEntryPdf };
