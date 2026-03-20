const prisma = require("../config/prisma");
const xlsx = require("xlsx");
const {
  parseListParams,
  buildOrderBy,
  contains,
  buildMeta,
  buildDateRangeFilter,
} = require("../utils/listing");
const { sendExport } = require("../utils/exporter");

const createProduct = async (req, res) => {
  const {
    name,
    sku,
    description,
    unitPrice,
    categoryId,
    familyId,
    saleUnitId,
    stockUnitId,
    dosageUnitId,
    conversions,
    components,
  } = req.body || {};

  if (!name || unitPrice === undefined) {
    return res.status(400).json({ message: "name and unitPrice are required." });
  }

  const product = await prisma.product.create({
    data: {
      tenantId: req.user.tenantId,
      name,
      sku,
      description,
      unitPrice,
      categoryId,
      familyId,
      saleUnitId,
      stockUnitId,
      dosageUnitId,
    },
  });

  if (Array.isArray(conversions) && conversions.length) {
    await prisma.productUnitConversion.createMany({
      data: conversions.map((item) => ({
        tenantId: req.user.tenantId,
        productId: product.id,
        fromUnitId: item.fromUnitId,
        toUnitId: item.toUnitId,
        factor: item.factor,
      })),
      skipDuplicates: true,
    });
  }

  if (Array.isArray(components) && components.length) {
    await prisma.productComponent.createMany({
      data: components.map((item) => ({
        tenantId: req.user.tenantId,
        productId: product.id,
        componentProductId: item.componentProductId,
        componentName: item.componentName,
        dosageUnitId: item.dosageUnitId,
        quantity: item.quantity,
      })),
    });
  }

  return res.status(201).json(product);
};

const listProducts = async (req, res) => {
  const { categoryId, familyId, isActive } = req.query || {};
  const activeFilter =
    isActive === undefined ? undefined : String(isActive).toLowerCase() === "true";
  const { page, pageSize, paginate, sortBy, sortDir, search, exportType } =
    parseListParams(req.query);
  const createdAtFilter = buildDateRangeFilter(req.query, "createdAt");

  const searchFilter = search
    ? {
        OR: [
          { name: contains(search) },
          { sku: contains(search) },
          { description: contains(search) },
          { category: { name: contains(search) } },
          { family: { name: contains(search) } },
        ],
      }
    : {};

  const where = {
    tenantId: req.user.tenantId,
    ...(categoryId ? { categoryId } : {}),
    ...(familyId ? { familyId } : {}),
    ...(activeFilter === undefined ? {} : { isActive: activeFilter }),
    ...createdAtFilter,
    ...searchFilter,
  };

  const orderBy =
    buildOrderBy(sortBy, sortDir, {
      createdAt: "createdAt",
      name: "name",
      sku: "sku",
      unitPrice: "unitPrice",
    }) || { createdAt: "desc" };

  if (exportType) {
    const data = await prisma.product.findMany({
      where,
      include: { category: true, family: true },
      orderBy,
    });

    const rows = data.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      unitPrice: item.unitPrice,
      category: item.category?.name || "",
      family: item.family?.name || "",
      isActive: item.isActive,
      createdAt: item.createdAt,
    }));

    return sendExport(res, rows, "products", exportType);
  }

  if (!paginate) {
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        family: true,
        saleUnit: true,
        stockUnit: true,
        dosageUnit: true,
      },
      orderBy,
    });

    return res.json(products);
  }

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: true,
        family: true,
        saleUnit: true,
        stockUnit: true,
        dosageUnit: true,
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({
    data: products,
    meta: buildMeta({ page, pageSize, total, sortBy, sortDir }),
  });
};

const getProduct = async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findFirst({
    where: { id, tenantId: req.user.tenantId },
    include: {
      category: true,
      family: true,
      saleUnit: true,
      stockUnit: true,
      dosageUnit: true,
      components: true,
      unitConversions: true,
    },
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  return res.json(product);
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    sku,
    description,
    unitPrice,
    categoryId,
    familyId,
    saleUnitId,
    stockUnitId,
    dosageUnitId,
    isActive,
  } = req.body || {};

  const product = await prisma.product.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name,
      sku,
      description,
      unitPrice,
      categoryId,
      familyId,
      saleUnitId,
      stockUnitId,
      dosageUnitId,
      isActive,
    },
  });

  return res.json(updated);
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  return res.json(updated);
};

const addProductComponents = async (req, res) => {
  const { id } = req.params;
  const { components } = req.body || {};

  if (!Array.isArray(components) || !components.length) {
    return res.status(400).json({ message: "components array required." });
  }

  const product = await prisma.product.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  await prisma.productComponent.createMany({
    data: components.map((item) => ({
      tenantId: req.user.tenantId,
      productId: id,
      componentProductId: item.componentProductId,
      componentName: item.componentName,
      dosageUnitId: item.dosageUnitId,
      quantity: item.quantity,
    })),
  });

  return res.json({ message: "Components added." });
};

const listProductComponents = async (req, res) => {
  const { id } = req.params;
  const { page, pageSize, paginate, sortBy, sortDir, search, exportType } =
    parseListParams(req.query);
  const createdAtFilter = buildDateRangeFilter(req.query, "createdAt");

  const searchFilter = search
    ? {
        OR: [
          { componentName: contains(search) },
          { componentProduct: { name: contains(search) } },
          { dosageUnit: { name: contains(search) } },
        ],
      }
    : {};

  const where = {
    productId: id,
    tenantId: req.user.tenantId,
    ...createdAtFilter,
    ...searchFilter,
  };

  const orderBy =
    buildOrderBy(sortBy, sortDir, {
      createdAt: "createdAt",
      componentName: "componentName",
      quantity: "quantity",
    }) || { createdAt: "asc" };

  if (exportType) {
    const data = await prisma.productComponent.findMany({
      where,
      include: { dosageUnit: true, componentProduct: true },
      orderBy,
    });

    const rows = data.map((item) => ({
      id: item.id,
      componentName: item.componentName,
      componentProduct: item.componentProduct?.name || "",
      dosageUnit: item.dosageUnit?.name || "",
      quantity: item.quantity,
      createdAt: item.createdAt,
    }));

    return sendExport(res, rows, "product-components", exportType);
  }

  if (!paginate) {
    const items = await prisma.productComponent.findMany({
      where,
      include: { dosageUnit: true, componentProduct: true },
      orderBy,
    });

    return res.json(items);
  }

  const [total, items] = await prisma.$transaction([
    prisma.productComponent.count({ where }),
    prisma.productComponent.findMany({
      where,
      include: { dosageUnit: true, componentProduct: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({
    data: items,
    meta: buildMeta({ page, pageSize, total, sortBy, sortDir }),
  });
};

const updateProductComponent = async (req, res) => {
  const { id, componentId } = req.params;
  const { componentProductId, componentName, dosageUnitId, quantity } =
    req.body || {};

  const component = await prisma.productComponent.findFirst({
    where: { id: componentId, productId: id, tenantId: req.user.tenantId },
  });
  if (!component) {
    return res.status(404).json({ message: "Component not found." });
  }

  const updated = await prisma.productComponent.update({
    where: { id: componentId },
    data: { componentProductId, componentName, dosageUnitId, quantity },
  });

  return res.json(updated);
};

const deleteProductComponent = async (req, res) => {
  const { id, componentId } = req.params;

  const component = await prisma.productComponent.findFirst({
    where: { id: componentId, productId: id, tenantId: req.user.tenantId },
  });
  if (!component) {
    return res.status(404).json({ message: "Component not found." });
  }

  await prisma.productComponent.delete({ where: { id: componentId } });

  return res.json({ message: "Component deleted." });
};

const addProductConversions = async (req, res) => {
  const { id } = req.params;
  const { conversions } = req.body || {};

  if (!Array.isArray(conversions) || !conversions.length) {
    return res.status(400).json({ message: "conversions array required." });
  }

  const product = await prisma.product.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  await prisma.productUnitConversion.createMany({
    data: conversions.map((item) => ({
      tenantId: req.user.tenantId,
      productId: id,
      fromUnitId: item.fromUnitId,
      toUnitId: item.toUnitId,
      factor: item.factor,
    })),
    skipDuplicates: true,
  });

  return res.json({ message: "Conversions added." });
};

const listProductConversions = async (req, res) => {
  const { id } = req.params;
  const { page, pageSize, paginate, sortBy, sortDir, search, exportType } =
    parseListParams(req.query);
  const createdAtFilter = buildDateRangeFilter(req.query, "createdAt");

  const searchFilter = search
    ? {
        OR: [
          { fromUnit: { name: contains(search) } },
          { toUnit: { name: contains(search) } },
        ],
      }
    : {};

  const where = {
    productId: id,
    tenantId: req.user.tenantId,
    ...createdAtFilter,
    ...searchFilter,
  };

  const orderBy =
    buildOrderBy(sortBy, sortDir, {
      createdAt: "createdAt",
      factor: "factor",
    }) || { createdAt: "asc" };

  if (exportType) {
    const data = await prisma.productUnitConversion.findMany({
      where,
      include: { fromUnit: true, toUnit: true },
      orderBy,
    });

    const rows = data.map((item) => ({
      id: item.id,
      fromUnit: item.fromUnit?.name || "",
      toUnit: item.toUnit?.name || "",
      factor: item.factor,
      createdAt: item.createdAt,
    }));

    return sendExport(res, rows, "product-conversions", exportType);
  }

  if (!paginate) {
    const conversions = await prisma.productUnitConversion.findMany({
      where,
      include: { fromUnit: true, toUnit: true },
      orderBy,
    });

    return res.json(conversions);
  }

  const [total, conversions] = await prisma.$transaction([
    prisma.productUnitConversion.count({ where }),
    prisma.productUnitConversion.findMany({
      where,
      include: { fromUnit: true, toUnit: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({
    data: conversions,
    meta: buildMeta({ page, pageSize, total, sortBy, sortDir }),
  });
};

const updateProductConversion = async (req, res) => {
  const { id, conversionId } = req.params;
  const { fromUnitId, toUnitId, factor } = req.body || {};

  const conversion = await prisma.productUnitConversion.findFirst({
    where: { id: conversionId, productId: id, tenantId: req.user.tenantId },
  });
  if (!conversion) {
    return res.status(404).json({ message: "Conversion not found." });
  }

  const updated = await prisma.productUnitConversion.update({
    where: { id: conversionId },
    data: { fromUnitId, toUnitId, factor },
  });

  return res.json(updated);
};

const deleteProductConversion = async (req, res) => {
  const { id, conversionId } = req.params;

  const conversion = await prisma.productUnitConversion.findFirst({
    where: { id: conversionId, productId: id, tenantId: req.user.tenantId },
  });
  if (!conversion) {
    return res.status(404).json({ message: "Conversion not found." });
  }

  await prisma.productUnitConversion.delete({ where: { id: conversionId } });

  return res.json({ message: "Conversion deleted." });
};

const importProducts = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Excel file required." });
  }

  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  const productsSheet = workbook.Sheets["Products"] || workbook.Sheets[workbook.SheetNames[0]];
  const componentsSheet = workbook.Sheets["Components"];

  const productsRows = xlsx.utils.sheet_to_json(productsSheet, { defval: "" });
  const componentsRows = componentsSheet
    ? xlsx.utils.sheet_to_json(componentsSheet, { defval: "" })
    : [];

  const findOrCreateCategory = async (name) => {
    if (!name) return null;
    const existing = await prisma.productCategory.findFirst({
      where: { tenantId: req.user.tenantId, name },
    });
    return existing
      ? existing
      : prisma.productCategory.create({
          data: { tenantId: req.user.tenantId, name },
        });
  };

  const findOrCreateFamily = async (name) => {
    if (!name) return null;
    const existing = await prisma.productFamily.findFirst({
      where: { tenantId: req.user.tenantId, name },
    });
    return existing
      ? existing
      : prisma.productFamily.create({
          data: { tenantId: req.user.tenantId, name },
        });
  };

  const findOrCreateUnit = async (name, type) => {
    if (!name) return null;
    const existing = await prisma.unitOfMeasure.findFirst({
      where: { tenantId: req.user.tenantId, name, type },
    });
    return existing
      ? existing
      : prisma.unitOfMeasure.create({
          data: { tenantId: req.user.tenantId, name, type },
        });
  };

  const productsBySku = {};
  const created = [];

  for (const row of productsRows) {
    const name = row.name || row.Name || row.product || row.Product;
    if (!name) {
      continue;
    }

    const sku = row.sku || row.SKU || row.code || row.Code || null;
    const description = row.description || row.Description || null;
    const unitPrice = Number(row.unitPrice || row.UnitPrice || row.price || row.Price || 0);

    const categoryName = row.category || row.Category || "";
    const familyName = row.family || row.Family || "";
    const saleUnitName = row.saleUnit || row.SaleUnit || row.sale_unit || "";
    const stockUnitName = row.stockUnit || row.StockUnit || row.stock_unit || "";
    const dosageUnitName = row.dosageUnit || row.DosageUnit || row.dosage_unit || "";

    const category = await findOrCreateCategory(categoryName);
    const family = await findOrCreateFamily(familyName);
    const saleUnit = await findOrCreateUnit(saleUnitName, "SALE");
    const stockUnit = await findOrCreateUnit(stockUnitName, "STOCK");
    const dosageUnit = await findOrCreateUnit(dosageUnitName, "DOSAGE");

    let product = await prisma.product.findFirst({
      where: {
        tenantId: req.user.tenantId,
        ...(sku ? { sku } : { name }),
      },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          tenantId: req.user.tenantId,
          name,
          sku,
          description,
          unitPrice,
          categoryId: category?.id,
          familyId: family?.id,
          saleUnitId: saleUnit?.id,
          stockUnitId: stockUnit?.id,
          dosageUnitId: dosageUnit?.id,
        },
      });
      created.push(product);
    }

    productsBySku[sku || name] = product;

    const convFrom = row.conversionFromUnit || row.ConversionFromUnit || row.fromUnit;
    const convTo = row.conversionToUnit || row.ConversionToUnit || row.toUnit;
    const factor = row.conversionFactor || row.ConversionFactor || row.factor;

    if (convFrom && convTo && factor) {
      const fromUnit = await findOrCreateUnit(convFrom, "STOCK");
      const toUnit = await findOrCreateUnit(convTo, "SALE");

      if (fromUnit && toUnit) {
        await prisma.productUnitConversion.upsert({
          where: {
            productId_fromUnitId_toUnitId: {
              productId: product.id,
              fromUnitId: fromUnit.id,
              toUnitId: toUnit.id,
            },
          },
          update: { factor: Number(factor) },
          create: {
            tenantId: req.user.tenantId,
            productId: product.id,
            fromUnitId: fromUnit.id,
            toUnitId: toUnit.id,
            factor: Number(factor),
          },
        });
      }
    }
  }

  if (componentsRows.length) {
    for (const row of componentsRows) {
      const productKey =
        row.productSku ||
        row.ProductSku ||
        row.product ||
        row.Product ||
        row.productName ||
        row.ProductName;

      if (!productKey) {
        continue;
      }

      const product =
        productsBySku[productKey] ||
        (await prisma.product.findFirst({
          where: {
            tenantId: req.user.tenantId,
            OR: [{ sku: productKey }, { name: productKey }],
          },
        }));

      if (!product) {
        continue;
      }

      const componentSku = row.componentSku || row.ComponentSku || null;
      const componentName =
        row.componentName || row.ComponentName || row.component || row.Component || null;
      const dosageUnitName = row.dosageUnit || row.DosageUnit || null;
      const quantity = Number(row.quantity || row.Quantity || 0);

      const componentProduct = componentSku
        ? await prisma.product.findFirst({
            where: { tenantId: req.user.tenantId, sku: componentSku },
          })
        : null;

      const dosageUnit = await findOrCreateUnit(dosageUnitName, "DOSAGE");

      if (quantity > 0) {
        await prisma.productComponent.create({
          data: {
            tenantId: req.user.tenantId,
            productId: product.id,
            componentProductId: componentProduct?.id,
            componentName,
            dosageUnitId: dosageUnit?.id,
            quantity,
          },
        });
      }
    }
  }

  return res.json({
    message: "Import completed.",
    created: created.length,
  });
};

module.exports = {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  addProductComponents,
  listProductComponents,
  updateProductComponent,
  deleteProductComponent,
  addProductConversions,
  listProductConversions,
  updateProductConversion,
  deleteProductConversion,
  importProducts,
};
