const prisma = require("../config/prisma");
const {
  parseListParams,
  buildOrderBy,
  contains,
  buildMeta,
  buildDateRangeFilter,
} = require("../utils/listing");
const { sendExport } = require("../utils/exporter");

const createCategory = async (req, res) => {
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ message: "name is required." });
  }

  const category = await prisma.productCategory.create({
    data: { tenantId: req.user.tenantId, name },
  });

  return res.status(201).json(category);
};

const listCategories = async (req, res) => {
  const { page, pageSize, paginate, sortBy, sortDir, search, exportType } =
    parseListParams(req.query);
  const createdAtFilter = buildDateRangeFilter(req.query, "createdAt");

  const searchFilter = search ? { name: contains(search) } : {};
  const where = {
    tenantId: req.user.tenantId,
    ...createdAtFilter,
    ...searchFilter,
  };

  const orderBy =
    buildOrderBy(sortBy, sortDir, {
      name: "name",
      createdAt: "createdAt",
    }) || { name: "asc" };

  if (exportType) {
    const data = await prisma.productCategory.findMany({ where, orderBy });
    const rows = data.map((item) => ({
      id: item.id,
      name: item.name,
      createdAt: item.createdAt,
    }));
    return sendExport(res, rows, "product-categories", exportType);
  }

  if (!paginate) {
    const categories = await prisma.productCategory.findMany({ where, orderBy });
    return res.json(categories);
  }

  const [total, categories] = await prisma.$transaction([
    prisma.productCategory.count({ where }),
    prisma.productCategory.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({
    data: categories,
    meta: buildMeta({ page, pageSize, total, sortBy, sortDir }),
  });
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body || {};

  const category = await prisma.productCategory.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });
  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }

  const updated = await prisma.productCategory.update({
    where: { id },
    data: { name },
  });

  return res.json(updated);
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const category = await prisma.productCategory.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });
  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }

  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });
  if (productCount > 0) {
    return res.status(400).json({ message: "Category has products." });
  }

  await prisma.productCategory.delete({ where: { id } });
  return res.json({ message: "Category deleted." });
};

module.exports = {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
};
