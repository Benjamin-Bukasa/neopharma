const prisma = require("../config/prisma");
const {
  parseListParams,
  buildOrderBy,
  contains,
  buildMeta,
  buildDateRangeFilter,
} = require("../utils/listing");
const { sendExport } = require("../utils/exporter");

const listInventory = async (req, res) => {
  const { storeId, storageZoneId, zoneType, productId } = req.query || {};
  const { page, pageSize, paginate, sortBy, sortDir, search, exportType } =
    parseListParams(req.query);
  const updatedAtFilter = buildDateRangeFilter(
    req.query,
    "updatedAt"
  );

  const searchFilter = search
    ? {
        OR: [
          { product: { name: contains(search) } },
          { storageZone: { name: contains(search) } },
          { store: { name: contains(search) } },
        ],
      }
    : {};

  const where = {
    tenantId: req.user.tenantId,
    ...(storeId ? { storeId } : {}),
    ...(storageZoneId ? { storageZoneId } : {}),
    ...(productId ? { productId } : {}),
    ...(zoneType ? { storageZone: { zoneType } } : {}),
    ...updatedAtFilter,
    ...searchFilter,
  };

  const orderBy =
    buildOrderBy(sortBy, sortDir, {
      updatedAt: "updatedAt",
      quantity: "quantity",
      product: (dir) => ({ product: { name: dir } }),
      store: (dir) => ({ store: { name: dir } }),
      zone: (dir) => ({ storageZone: { name: dir } }),
    }) || { updatedAt: "desc" };

  if (exportType) {
    const data = await prisma.inventory.findMany({
      where,
      include: { product: true, storageZone: true, store: true },
      orderBy,
    });

    const rows = data.map((item) => ({
      id: item.id,
      product: item.product?.name || "",
      store: item.store?.name || "",
      storageZone: item.storageZone?.name || "",
      quantity: item.quantity,
      minLevel: item.minLevel,
      updatedAt: item.updatedAt,
    }));

    return sendExport(res, rows, "inventory", exportType);
  }

  if (!paginate) {
    const inventory = await prisma.inventory.findMany({
      where,
      include: { product: true, storageZone: true, store: true },
      orderBy,
    });

    return res.json(inventory);
  }

  const [total, inventory] = await prisma.$transaction([
    prisma.inventory.count({ where }),
    prisma.inventory.findMany({
      where,
      include: { product: true, storageZone: true, store: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({
    data: inventory,
    meta: buildMeta({ page, pageSize, total, sortBy, sortDir }),
  });
};

const adjustInventory = async (req, res) => {
  const { storageZoneId, productId, quantity, mode, note } = req.body || {};

  if (!storageZoneId || !productId || quantity === undefined) {
    return res.status(400).json({
      message: "storageZoneId, productId and quantity are required.",
    });
  }

  const storageZone = await prisma.storageZone.findFirst({
    where: { id: storageZoneId, tenantId: req.user.tenantId },
  });

  if (!storageZone || !storageZone.storeId) {
    return res.status(400).json({ message: "Invalid storageZoneId." });
  }

  const modeValue = mode || "SET";
  const amount = Number(quantity);

  const existing = await prisma.inventory.findFirst({
    where: {
      tenantId: req.user.tenantId,
      storageZoneId,
      productId,
    },
  });

  let updated;
  let delta = amount;
  if (!existing) {
    if (modeValue === "DECREMENT") {
      return res.status(400).json({ message: "Cannot decrement missing inventory." });
    }
    updated = await prisma.inventory.create({
      data: {
        tenantId: req.user.tenantId,
        storeId: storageZone.storeId,
        storageZoneId,
        productId,
        quantity: modeValue === "SET" ? amount : amount,
      },
    });
    delta = modeValue === "SET" ? amount : amount;
  } else {
    if (modeValue === "SET") {
      delta = amount - existing.quantity;
      updated = await prisma.inventory.update({
        where: { id: existing.id },
        data: { quantity: amount },
      });
    } else if (modeValue === "INCREMENT") {
      updated = await prisma.inventory.update({
        where: { id: existing.id },
        data: { quantity: { increment: amount } },
      });
      delta = amount;
    } else if (modeValue === "DECREMENT") {
      updated = await prisma.inventory.update({
        where: { id: existing.id },
        data: { quantity: { decrement: amount } },
      });
      delta = -amount;
    } else {
      return res.status(400).json({ message: "Invalid mode." });
    }
  }

  await prisma.inventoryMovement.create({
    data: {
      tenantId: req.user.tenantId,
      productId,
      storageZoneId,
      quantity: delta,
      movementType: "ADJUSTMENT",
      sourceType: "DIRECT",
      sourceId: null,
      createdById: req.user.id,
    },
  });

  return res.json({
    inventory: updated,
    note,
  });
};

const updateMinLevel = async (req, res) => {
  const { id } = req.params;
  const { minLevel } = req.body || {};

  if (minLevel === undefined) {
    return res.status(400).json({ message: "minLevel required." });
  }

  const item = await prisma.inventory.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });

  if (!item) {
    return res.status(404).json({ message: "Inventory not found." });
  }

  const updated = await prisma.inventory.update({
    where: { id },
    data: { minLevel: Number(minLevel) },
  });

  return res.json(updated);
};

module.exports = {
  listInventory,
  adjustInventory,
  updateMinLevel,
};
