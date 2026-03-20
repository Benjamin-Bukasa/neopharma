const prisma = require("../config/prisma");
const {
  parseListParams,
  buildOrderBy,
  contains,
  buildMeta,
  buildDateRangeFilter,
} = require("../utils/listing");
const { sendExport } = require("../utils/exporter");

const listOrders = async (req, res) => {
  const { status, storeId, customerId } = req.query || {};
  const { page, pageSize, paginate, sortBy, sortDir, search, exportType } =
    parseListParams(req.query);
  const createdAtFilter = buildDateRangeFilter(req.query, "createdAt");

  const searchFilter = search
    ? {
        OR: [
          { status: contains(search) },
          { customer: { firstName: contains(search) } },
          { customer: { lastName: contains(search) } },
          { store: { name: contains(search) } },
        ],
      }
    : {};

  const where = {
    tenantId: req.user.tenantId,
    ...(status ? { status } : {}),
    ...(storeId ? { storeId } : {}),
    ...(customerId ? { customerId } : {}),
    ...createdAtFilter,
    ...searchFilter,
  };

  const orderBy =
    buildOrderBy(sortBy, sortDir, {
      createdAt: "createdAt",
      total: "total",
      status: "status",
    }) || { createdAt: "desc" };

  if (exportType) {
    const data = await prisma.order.findMany({
      where,
      include: { customer: true, store: true, payments: true, items: true },
      orderBy,
    });

    const rows = data.map((item) => ({
      id: item.id,
      status: item.status,
      store: item.store?.name || "",
      customer: [item.customer?.firstName, item.customer?.lastName]
        .filter(Boolean)
        .join(" "),
      total: item.total,
      itemsCount: item.items?.length || 0,
      createdAt: item.createdAt,
    }));

    return sendExport(res, rows, "orders", exportType);
  }

  if (!paginate) {
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        customer: true,
        store: true,
        payments: true,
        createdBy: true,
      },
      orderBy,
    });
    return res.json(orders);
  }

  const [total, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        customer: true,
        store: true,
        payments: true,
        createdBy: true,
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({
    data: orders,
    meta: buildMeta({ page, pageSize, total, sortBy, sortDir }),
  });
};

const getOrder = async (req, res) => {
  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: { id, tenantId: req.user.tenantId },
    include: {
      items: { include: { product: true } },
      customer: true,
      store: true,
      payments: true,
      createdBy: true,
    },
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  return res.json(order);
};

module.exports = {
  listOrders,
  getOrder,
};
