const PDFDocument = require("pdfkit");

const formatDate = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR");
};

const buildPurchaseRequestPdf = (request) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(18).text("Demande d'achat", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Reference: PR-${request.id.slice(0, 8).toUpperCase()}`);
      if (request.title) {
        doc.text(`Titre: ${request.title}`);
      }
      doc.text(`Date: ${formatDate(request.createdAt)}`);
      doc.text(`Statut: ${request.status || "DRAFT"}`);
      doc.moveDown(0.5);

      if (request.store?.name) {
        doc.text(`Boutique: ${request.store.name}`);
      }
      if (request.requestedBy) {
        const requester = [request.requestedBy.firstName, request.requestedBy.lastName]
          .filter(Boolean)
          .join(" ");
        if (requester) {
          doc.text(`Demandeur: ${requester}`);
        }
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
            `${index + 1}. ${name} | Quantite: ${quantity} ${unitLabel}`.trim(),
          );

        if (item.note) {
          doc.fontSize(9).fillColor("gray").text(`Note: ${item.note}`);
          doc.fillColor("black");
        }
      });

      if (request.approvals?.length) {
        doc.moveDown();
        doc.fontSize(12).text("Validation", { underline: true });
        doc.moveDown(0.5);

        request.approvals.forEach((approval) => {
          doc
            .fontSize(10)
            .text(
              `Etape ${approval.stepOrder} | Role: ${approval.approverRole || "--"} | Statut: ${approval.status || "PENDING"}`,
            );
          if (approval.note) {
            doc.fontSize(9).fillColor("gray").text(`Note: ${approval.note}`);
            doc.fillColor("black");
          }
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });

module.exports = { buildPurchaseRequestPdf };
