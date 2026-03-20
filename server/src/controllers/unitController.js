const prisma = require("../config/prisma");
const {
  parseListParams,
  buildOrderBy,
  contains,
  buildMeta,
  buildDateRangeFilter,
} = require("../utils/listing");
const { sendExport } = require("../utils/exporter");

const createUnit = async (req, res) => {
  const { name, type, symbol } = req.body || {};

  if (!name || !type) {
    return res.status(400).json({ message: "name and type are required." });
  }

  const unit = await prisma.unitOfMeasure.create({
    data: {
      tenantId: req.user.tenantId,
      name,
      type,
      symbol,
    },
  });

  return res.status(201).json(unit);
};

const listUnits = async (req, res) => {
  const { type } = req.query || {};
  const { page, pageSize, paginate, sortBy, sortDir, search, exportType } =
    parseListParams(req.query);
  const createdAtFilter = buildDateRangeFilter(req.query, "createdAt");

  const searchFilter = search
    ? {
        OR: [
          { name: contains(search) },
          { symbol: contains(search) },
          { type: contains(search) },
        ],
      }
    : {};

  const where = {
    tenantId: req.user.tenantId,
    ...(type ? { type } : {}),
    ...createdAtFilter,
    ...searchFilter,
  };

  const orderBy =
    buildOrderBy(sortBy, sortDir, {
      name: "name",
      type: "type",
      createdAt: "createdAt",
    }) || { name: "asc" };

  if (exportType) {
    const data = await prisma.unitOfMeasure.findMany({ where, orderBy });
    const rows = data.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      symbol: item.symbol,
      createdAt: item.createdAt,
    }));
    return sendExport(res, rows, "units", exportType);
  }

  if (!paginate) {
    const units = await prisma.unitOfMeasure.findMany({ where, orderBy });
    return res.json(units);
  }

  const [total, units] = await prisma.$transaction([
    prisma.unitOfMeasure.count({ where }),
    prisma.unitOfMeasure.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({
    data: units,
    meta: buildMeta({ page, pageSize, total, sortBy, sortDir }),
  });
};

const updateUnit = async (req, res) => {
  const { id } = req.params;
  const { name, type, symbol } = req.body || {};

  const unit = await prisma.unitOfMeasure.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });

  if (!unit) {
    return res.status(404).json({ message: "Unit not found." });
  }

  const updated = await prisma.unitOfMeasure.update({
    where: { id },
    data: { name, type, symbol },
  });

  return res.json(updated);
};

const deleteUnit = async (req, res) => {
  const { id } = req.params;

  const unit = await prisma.unitOfMeasure.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });

  if (!unit) {
    return res.status(404).json({ message: "Unit not found." });
  }

  const [productCount, purchaseRequestCount, supplyRequestCount] = await prisma.$transaction([
    prisma.product.count({
      where: {
        OR: [{ saleUnitId: id }, { stockUnitId: id }, { dosageUnitId: id }],
      },
    }),
    prisma.purchaseRequestItem.count({ where: { unitId: id } }),
    prisma.supplyRequestItem.count({ where: { unitId: id } }),
  ]);

  if (productCount > 0 || purchaseRequestCount > 0 || supplyRequestCount > 0) {
    return res.status(400).json({
      message: "Unit cannot be deleted while it is referenced.",
    });
  }

  await prisma.unitOfMeasure.delete({ where: { id } });
  return res.json({ message: "Unit deleted." });
};

module.exports = {
  createUnit,
  listUnits,
  updateUnit,
  deleteUnit,
};
