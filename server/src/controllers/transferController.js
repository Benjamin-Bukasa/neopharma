const prisma = require("../config/prisma");
const {
  parseListParams,
  buildOrderBy,
  contains,
  buildMeta,
  buildDateRangeFilter,
} = require("../utils/listing");
const { sendExport } = require("../utils/exporter");
const { emitToStore } = require("../socket");

const createTransfer = async (req, res) => {
  const {
    fromStoreId,
    toStoreId,
    fromZoneId,
    toZoneId,
    note,
    items,
  } = req.body || {};

  if (!fromStoreId || !toStoreId) {
    return res.status(400).json({ message: "fromStoreId and toStoreId required." });
  }
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: "items array required." });
  }

  const transfer = await prisma.productTransfer.create({
    data: {
      tenantId: req.user.tenantId,
      fromStoreId,
      toStoreId,
      fromZoneId,
      toZoneId,
      requestedById: req.user.id,
      note,
      status: "DRAFT",
      items: {
        create: items.map((item) => ({
          tenantId: req.user.tenantId,
          productId: item.productId,
          unitId: item.unitId,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  });

  emitToStore(fromStoreId, "transfer:created", {
    id: transfer.id,
    status: transfer.status,
    fromStoreId,
    toStoreId,
  });
  if (toStoreId && toStoreId !== fromStoreId) {
    emitToStore(toStoreId, "transfer:created", {
      id: transfer.id,
      status: transfer.status,
      fromStoreId,
      toStoreId,
    });
  }

  return res.status(201).json(transfer);
};

const listTransfers = async (req, res) => {
  const { status, fromStoreId, toStoreId } = req.query || {};
  const { page, pageSize, paginate, sortBy, sortDir, search, exportType } =
    parseListParams(req.query);
  const createdAtFilter = buildDateRangeFilter(req.query, "createdAt");

  const searchFilter = search
    ? {
        OR: [
          { status: contains(search) },
          { fromStore: { name: contains(search) } },
          { toStore: { name: contains(search) } },
          { fromZone: { name: contains(search) } },
          { toZone: { name: contains(search) } },
        ],
      }
    : {};

  const where = {
    tenantId: req.user.tenantId,
    ...(status ? { status } : {}),
    ...(fromStoreId ? { fromStoreId } : {}),
    ...(toStoreId ? { toStoreId } : {}),
    ...createdAtFilter,
    ...searchFilter,
  };

  const orderBy =
    buildOrderBy(sortBy, sortDir, {
      createdAt: "createdAt",
      status: "status",
    }) || { createdAt: "desc" };

  if (exportType) {
    const data = await prisma.productTransfer.findMany({
      where,
      include: {
        fromStore: true,
        toStore: true,
        fromZone: true,
        toZone: true,
        items: true,
      },
      orderBy,
    });

    const rows = data.map((item) => ({
      id: item.id,
      status: item.status,
      fromStore: item.fromStore?.name || "",
      toStore: item.toStore?.name || "",
      fromZone: item.fromZone?.name || "",
      toZone: item.toZone?.name || "",
      itemsCount: item.items?.length || 0,
      createdAt: item.createdAt,
    }));

    return sendExport(res, rows, "transfers", exportType);
  }

  if (!paginate) {
    const transfers = await prisma.productTransfer.findMany({
      where,
      include: {
        items: { include: { product: true, unit: true } },
        fromStore: true,
        toStore: true,
        fromZone: true,
        toZone: true,
        requestedBy: true,
      },
      orderBy,
    });
    return res.json(transfers);
  }

  const [total, transfers] = await prisma.$transaction([
    prisma.productTransfer.count({ where }),
    prisma.productTransfer.findMany({
      where,
      include: {
        items: { include: { product: true, unit: true } },
        fromStore: true,
        toStore: true,
        fromZone: true,
        toZone: true,
        requestedBy: true,
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({
    data: transfers,
    meta: buildMeta({ page, pageSize, total, sortBy, sortDir }),
  });
};

const getTransfer = async (req, res) => {
  const { id } = req.params;

  const transfer = await prisma.productTransfer.findFirst({
    where: { id, tenantId: req.user.tenantId },
    include: {
      items: { include: { product: true, unit: true } },
      fromStore: true,
      toStore: true,
      fromZone: true,
      toZone: true,
      requestedBy: true,
    },
  });

  if (!transfer) {
    return res.status(404).json({ message: "Transfer not found." });
  }

  return res.json(transfer);
};

const updateTransfer = async (req, res) => {
  const { id } = req.params;
  const {
    fromStoreId,
    toStoreId,
    fromZoneId,
    toZoneId,
    note,
    items,
  } = req.body || {};

  const transfer = await prisma.productTransfer.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });

  if (!transfer) {
    return res.status(404).json({ message: "Transfer not found." });
  }

  if (transfer.status !== "DRAFT") {
    return res.status(400).json({ message: "Only draft transfers can be edited." });
  }

  if (!fromStoreId || !toStoreId) {
    return res.status(400).json({ message: "fromStoreId and toStoreId required." });
  }
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: "items array required." });
  }

  await prisma.productTransferItem.deleteMany({
    where: { transferId: id },
  });

  const updated = await prisma.productTransfer.update({
    where: { id },
    data: {
      fromStoreId,
      toStoreId,
      fromZoneId,
      toZoneId,
      note,
      items: {
        create: items.map((item) => ({
          tenantId: req.user.tenantId,
          productId: item.productId,
          unitId: item.unitId,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: { include: { product: true, unit: true } },
      fromStore: true,
      toStore: true,
      fromZone: true,
      toZone: true,
      requestedBy: true,
    },
  });

  return res.json(updated);
};

const deleteTransfer = async (req, res) => {
  const { id } = req.params;

  const transfer = await prisma.productTransfer.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });

  if (!transfer) {
    return res.status(404).json({ message: "Transfer not found." });
  }

  if (transfer.status !== "DRAFT") {
    return res.status(400).json({ message: "Only draft transfers can be deleted." });
  }

  await prisma.productTransfer.delete({ where: { id } });
  return res.json({ message: "Transfer deleted." });
};

const completeTransfer = async (req, res) => {
  const { id } = req.params;

  const transfer = await prisma.productTransfer.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!transfer || transfer.tenantId !== req.user.tenantId) {
    return res.status(404).json({ message: "Transfer not found." });
  }

  if (transfer.status === "COMPLETED") {
    return res.status(400).json({ message: "Transfer already completed." });
  }

  if (!transfer.fromZoneId || !transfer.toZoneId) {
    return res.status(400).json({
      message: "Transfer must define both source and target zones.",
    });
  }

  for (const item of transfer.items) {
    const quantity = Number(item.quantity || 0);
    const sourceInventory = await prisma.inventory.findUnique({
      where: {
        storageZoneId_productId: {
          storageZoneId: transfer.fromZoneId,
          productId: item.productId,
        },
      },
    });

    if (!sourceInventory || Number(sourceInventory.quantity || 0) < quantity) {
      return res.status(400).json({
        message: "Insufficient stock to complete this transfer.",
      });
    }
  }

  await prisma.$transaction(
    transfer.items.flatMap((item) => {
      const quantity = Number(item.quantity || 0);

      return [
        prisma.inventory.update({
          where: {
            storageZoneId_productId: {
              storageZoneId: transfer.fromZoneId,
              productId: item.productId,
            },
          },
          data: {
            quantity: { decrement: quantity },
          },
        }),
        prisma.inventory.upsert({
          where: {
            storageZoneId_productId: {
              storageZoneId: transfer.toZoneId,
              productId: item.productId,
            },
          },
          create: {
            tenantId: transfer.tenantId,
            storeId: transfer.toStoreId,
            storageZoneId: transfer.toZoneId,
            productId: item.productId,
            quantity,
          },
          update: {
            quantity: { increment: quantity },
          },
        }),
        prisma.inventoryMovement.create({
          data: {
            tenantId: transfer.tenantId,
            productId: item.productId,
            storageZoneId: transfer.fromZoneId,
            quantity,
            movementType: "TRANSFER_OUT",
            sourceType: "TRANSFER",
            sourceId: transfer.id,
            createdById: req.user.id,
          },
        }),
        prisma.inventoryMovement.create({
          data: {
            tenantId: transfer.tenantId,
            productId: item.productId,
            storageZoneId: transfer.toZoneId,
            quantity,
            movementType: "TRANSFER_IN",
            sourceType: "TRANSFER",
            sourceId: transfer.id,
            createdById: req.user.id,
          },
        }),
      ];
    })
  );

  const updated = await prisma.productTransfer.update({
    where: { id },
    data: { status: "COMPLETED" },
  });

  emitToStore(transfer.fromStoreId, "transfer:completed", {
    id: updated.id,
    status: updated.status,
    fromStoreId: transfer.fromStoreId,
    toStoreId: transfer.toStoreId,
  });
  if (transfer.toStoreId && transfer.toStoreId !== transfer.fromStoreId) {
    emitToStore(transfer.toStoreId, "transfer:completed", {
      id: updated.id,
      status: updated.status,
      fromStoreId: transfer.fromStoreId,
      toStoreId: transfer.toStoreId,
    });
  }

  return res.json(updated);
};

module.exports = {
  createTransfer,
  listTransfers,
  getTransfer,
  updateTransfer,
  deleteTransfer,
  completeTransfer,
};
