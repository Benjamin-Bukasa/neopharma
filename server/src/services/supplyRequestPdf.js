const PDFDocument = require("pdfkit");

const formatDate = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR");
};

const buildSupplyRequestPdf = (request) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(18).text("Requisition de stock", { align: "center" });
      doc.moveDown(0.5);
      const rawTitle = String(request.title || "").trim();
      const hasCustomRef = /^REQ\s*\d+/i.test(rawTitle);
      const reference = hasCustomRef
        ? rawTitle
        : `REQ-${request.id.slice(0, 8).toUpperCase()}`;
      doc.fontSize(10).text(`Reference: ${reference}`);
      if (rawTitle && !hasCustomRef) {
        doc.text(`Titre: ${rawTitle}`);
      }
      doc.text(`Date: ${formatDate(request.createdAt)}`);
      doc.text(`Statut: ${request.status || "DRAFT"}`);
      doc.moveDown(0.5);

      if (request.store?.name) doc.text(`Boutique: ${request.store.name}`);
      if (request.storageZone?.name)
        doc.text(`Zone: ${request.storageZone.name}`);
      if (request.requestedBy) {
        const requester = [request.requestedBy.firstName, request.requestedBy.lastName]
          .filter(Boolean)
          .join(" ");
        if (requester) doc.text(`Demandeur: ${requester}`);
      }
      if (request.note) {
        doc.moveDown(0.5);
        doc.text(`Note: ${request.note}`);
      }

      doc.moveDown();
      doc.fontSize(12).text("Articles demandes", { underline: true });
      doc.moveDown(0.5);

      (request.items || []).forEach((item, index) => {
        const name = item.product?.name || "Produit";
        const unitLabel = item.unit?.symbol || item.unit?.name || "";
        const quantity = item.quantity ?? 0;
        doc
          .fontSize(10)
          .text(
            `${index + 1}. ${name} | Quantite: ${quantity} ${unitLabel}`.trim()
          );
        if (item.note) {
          doc.fontSize(9).fillColor("gray").text(`Note: ${item.note}`);
          doc.fillColor("black");
        }
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });

module.exports = { buildSupplyRequestPdf };
