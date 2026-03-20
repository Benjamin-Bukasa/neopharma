const prisma = require("../config/prisma");
const {
  parseListParams,
  buildOrderBy,
  contains,
  buildMeta,
  buildDateRangeFilter,
} = require("../utils/listing");
const { sendExport } = require("../utils/exporter");

const listPayments = async (req, res) => {
  const { status, method, orderId } = req.query || {};
  const { page, pageSize, paginate, sortBy, sortDir, search, exportType } =
    parseListParams(req.query);
  const createdAtFilter = buildDateRangeFilter(req.query, "createdAt");

  const searchFilter = search
    ? {
        OR: [
          { status: contains(search) },
          { method: contains(search) },
          { reference: contains(search) },
        ],
      }
    : {};

  const where = {
    tenantId: req.user.tenantId,
    ...(status ? { status } : {}),
    ...(method ? { method } : {}),
    ...(orderId ? { orderId } : {}),
    ...createdAtFilter,
    ...searchFilter,
  };

  const orderBy =
    buildOrderBy(sortBy, sortDir, {
      createdAt: "createdAt",
      amount: "amount",
      status: "status",
      method: "method",
      paidAt: "paidAt",
    }) || { createdAt: "desc" };

  if (exportType) {
    const data = await prisma.payment.findMany({
      where,
      include: { order: { include: { customer: true } } },
      orderBy,
    });

    const rows = data.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      amount: item.amount,
      method: item.method,
      status: item.status,
      reference: item.reference,
      paidAt: item.paidAt,
      createdAt: item.createdAt,
    }));

    return sendExport(res, rows, "payments", exportType);
  }

  if (!paginate) {
    const payments = await prisma.payment.findMany({
      where,
      include: { order: { include: { customer: true } } },
      orderBy,
    });

    return res.json(payments);
  }

  const [total, payments] = await prisma.$transaction([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: { order: { include: { customer: true } } },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({
    data: payments,
    meta: buildMeta({ page, pageSize, total, sortBy, sortDir }),
  });
};

const getPayment = async (req, res) => {
  const { id } = req.params;

  const payment = await prisma.payment.findFirst({
    where: { id, tenantId: req.user.tenantId },
    include: { order: { include: { customer: true } } },
  });

  if (!payment) {
    return res.status(404).json({ message: "Payment not found." });
  }

  return res.json(payment);
};

module.exports = {
  listPayments,
  getPayment,
};
