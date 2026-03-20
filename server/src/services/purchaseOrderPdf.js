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

const buildPurchaseOrderPdf = (order) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(18).text("Commande fournisseur", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Reference: ${order.code || `PO-${order.id.slice(0, 8).toUpperCase()}`}`);
      doc.text(`Date commande: ${formatDate(order.orderDate || order.createdAt)}`);
      doc.text(`Statut: ${order.status || "DRAFT"}`);
      if (order.expectedDate) {
        doc.text(`Date attendue: ${formatDate(order.expectedDate)}`);
      }
      doc.moveDown(0.5);

      if (order.supplier?.name) doc.text(`Fournisseur: ${order.supplier.name}`);
      if (order.store?.name) doc.text(`Boutique: ${order.store.name}`);
      if (order.orderedBy) {
        const orderedBy = [order.orderedBy.firstName, order.orderedBy.lastName]
          .filter(Boolean)
          .join(" ");
        if (orderedBy) doc.text(`Commande par: ${orderedBy}`);
      }
      if (order.purchaseRequest?.title) {
        doc.text(`Demande d'achat source: ${order.purchaseRequest.title}`);
      }
      if (order.note) {
        doc.moveDown(0.5);
        doc.text(`Note: ${order.note}`);
      }

      doc.moveDown();
      doc.fontSize(12).text("Articles commandes", { underline: true });
      doc.moveDown(0.5);

      let total = 0;
      (order.items || []).forEach((item, index) => {
        const name = item.product?.name || "Produit";
        const unitLabel = item.unit?.symbol || item.unit?.name || "";
        const quantity = toNumber(item.quantity);
        const unitPrice = toNumber(item.unitPrice);
        const lineTotal = quantity * unitPrice;
        total += lineTotal;

        doc
          .fontSize(10)
          .text(
            `${index + 1}. ${name} | Qté: ${quantity} ${unitLabel} | PU: ${formatMoney(
              unitPrice,
            )} | Total: ${formatMoney(lineTotal)}`,
          );
      });

      doc.moveDown();
      doc.fontSize(11).text(`Montant estime: ${formatMoney(total)}`, {
        align: "right",
      });

      if (order.deliveryNotes?.length) {
        doc.moveDown();
        doc.fontSize(12).text("Bons de reception", { underline: true });
        doc.moveDown(0.5);

        order.deliveryNotes.forEach((note, index) => {
          doc
            .fontSize(10)
            .text(
              `${index + 1}. ${note.code || "--"} | Statut: ${note.status || "--"} | Reception: ${formatDate(
                note.receivedAt || note.createdAt,
              )}`,
            );
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });

module.exports = { buildPurchaseOrderPdf };
