const prisma = require("../config/prisma");
const {
  parseListParams,
  buildOrderBy,
  contains,
  buildMeta,
  buildDateRangeFilter,
} = require("../utils/listing");
const { sendExport } = require("../utils/exporter");

const createFamily = async (req, res) => {
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ message: "name is required." });
  }

  const family = await prisma.productFamily.create({
    data: { tenantId: req.user.tenantId, name },
  });

  return res.status(201).json(family);
};

const listFamilies = async (req, res) => {
  const { page, pageSize, paginate, sortBy, sortDir, search, exportType } =
    parseListParams(req.query);
  const createdAtFilter = buildDateRangeFilter(req.query, "createdAt");

  const searchFilter = search ? { name: contains(search) } : {};
  const where = { tenantId: req.user.tenantId, ...createdAtFilter, ...searchFilter };

  const orderBy =
    buildOrderBy(sortBy, sortDir, {
      name: "name",
      createdAt: "createdAt",
    }) || { name: "asc" };

  if (exportType) {
    const data = await prisma.productFamily.findMany({ where, orderBy });
    const rows = data.map((item) => ({
      id: item.id,
      name: item.name,
      createdAt: item.createdAt,
    }));
    return sendExport(res, rows, "product-families", exportType);
  }

  if (!paginate) {
    const families = await prisma.productFamily.findMany({ where, orderBy });
    return res.json(families);
  }

  const [total, families] = await prisma.$transaction([
    prisma.productFamily.count({ where }),
    prisma.productFamily.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({
    data: families,
    meta: buildMeta({ page, pageSize, total, sortBy, sortDir }),
  });
};

const updateFamily = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body || {};

  const family = await prisma.productFamily.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });
  if (!family) {
    return res.status(404).json({ message: "Family not found." });
  }

  const updated = await prisma.productFamily.update({
    where: { id },
    data: { name },
  });

  return res.json(updated);
};

const deleteFamily = async (req, res) => {
  const { id } = req.params;

  const family = await prisma.productFamily.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });
  if (!family) {
    return res.status(404).json({ message: "Family not found." });
  }

  const productCount = await prisma.product.count({
    where: { familyId: id },
  });
  if (productCount > 0) {
    return res.status(400).json({ message: "Family has products." });
  }

  await prisma.productFamily.delete({ where: { id } });
  return res.json({ message: "Family deleted." });
};

module.exports = {
  createFamily,
  listFamilies,
  updateFamily,
  deleteFamily,
};
