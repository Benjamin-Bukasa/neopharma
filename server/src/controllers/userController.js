const prisma = require("../config/prisma");
const { hashPassword } = require("../utils/password");
const { generateTempPassword } = require("../utils/tokens");
const { sendEmail, sendSms } = require("../services/notificationService");
const { buildAccountCreationEmail } = require("../utils/emailTemplates");
const {
  parseListParams,
  buildOrderBy,
  contains,
  buildMeta,
  buildDateRangeFilter,
} = require("../utils/listing");
const { sendExport } = require("../utils/exporter");

const createUser = async (req, res) => {
  const {
    email,
    phone,
    firstName,
    lastName,
    role,
    storeId,
    defaultStorageZoneId,
    sendVia,
    permissions,
  } = req.body || {};

  if (!email && !phone) {
    return res.status(400).json({ message: "Email or phone required." });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { tenantId: req.user.tenantId },
  });

  const userCount = await prisma.user.count({
    where: { tenantId: req.user.tenantId },
  });

  if (subscription && userCount >= subscription.maxUsers) {
    return res.status(403).json({
      message: "User limit reached for your subscription.",
    });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (existing) {
    return res.status(409).json({ message: "User already exists." });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const user = await prisma.user.create({
    data: {
      tenantId: req.user.tenantId,
      email,
      phone,
      firstName,
      lastName,
      role: role || "USER",
      storeId,
      defaultStorageZoneId,
      passwordHash,
      mustChangePassword: true,
    },
  });

  if (Array.isArray(permissions) && permissions.length) {
    const permissionRecords = await prisma.permission.findMany({
      where: { code: { in: permissions } },
    });

    await prisma.userPermission.createMany({
      data: permissionRecords.map((perm) => ({
        userId: user.id,
        permissionId: perm.id,
      })),
      skipDuplicates: true,
    });
  }

  const identifier = email || phone;
  const { subject, text, html } = buildAccountCreationEmail({
    tenantName: "NeoPharma",
    identifier,
    tempPassword,
  });

  if (sendVia === "sms" && phone) {
    await sendSms({ to: phone, message: text });
  } else if (email) {
    await sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  return res.status(201).json({
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
  });
};

const listUsers = async (req, res) => {
  const { role, storeId } = req.query || {};
  const isActive =
    req.query?.isActive === undefined
      ? undefined
      : String(req.query.isActive).toLowerCase() === "true";
  const { page, pageSize, paginate, sortBy, sortDir, search, exportType } =
    parseListParams(req.query);
  const createdAtFilter = buildDateRangeFilter(req.query, "createdAt");

  const searchFilter = search
    ? {
        OR: [
          { firstName: contains(search) },
          { lastName: contains(search) },
          { email: contains(search) },
          { phone: contains(search) },
          { role: contains(search) },
        ],
      }
    : {};

  const where = {
    tenantId: req.user.tenantId,
    ...(role ? { role } : {}),
    ...(storeId ? { storeId } : {}),
    ...(isActive === undefined ? {} : { isActive }),
    ...createdAtFilter,
    ...searchFilter,
  };

  const orderBy =
    buildOrderBy(sortBy, sortDir, {
      createdAt: "createdAt",
      firstName: "firstName",
      lastName: "lastName",
      email: "email",
      role: "role",
    }) || { createdAt: "desc" };

  const selectFields = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    role: true,
    isActive: true,
    storeId: true,
    store: {
      select: {
        id: true,
        name: true,
      },
    },
    defaultStorageZoneId: true,
    createdAt: true,
  };

  if (exportType) {
    const data = await prisma.user.findMany({
      where,
      orderBy,
      select: selectFields,
    });

    const rows = data.map((item) => ({
      id: item.id,
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      phone: item.phone,
      role: item.role,
      isActive: item.isActive,
      storeId: item.storeId,
      storeName: item.store?.name || "",
      createdAt: item.createdAt,
    }));

    return sendExport(res, rows, "users", exportType);
  }

  if (!paginate) {
    const users = await prisma.user.findMany({
      where,
      orderBy,
      select: selectFields,
    });

    return res.json(users);
  }

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy,
      select: selectFields,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({
    data: users,
    meta: buildMeta({ page, pageSize, total, sortBy, sortDir }),
  });
};

const getUser = async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findFirst({
    where: { id, tenantId: req.user.tenantId },
    include: {
      store: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.json(user);
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    email,
    phone,
    role,
    storeId,
    defaultStorageZoneId,
    isActive,
  } = req.body || {};

  const user = await prisma.user.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      firstName,
      lastName,
      email,
      phone,
      role,
      storeId,
      defaultStorageZoneId,
      isActive,
    },
  });

  return res.json(updated);
};

const deactivateUser = async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });

  return res.json(updated);
};

const updateUserPermissions = async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body || {};

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ message: "permissions array required." });
  }

  const user = await prisma.user.findFirst({
    where: { id, tenantId: req.user.tenantId },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const permissionRecords = await prisma.permission.findMany({
    where: { code: { in: permissions } },
  });

  await prisma.userPermission.deleteMany({ where: { userId: id } });
  if (permissionRecords.length) {
    await prisma.userPermission.createMany({
      data: permissionRecords.map((perm) => ({
        userId: id,
        permissionId: perm.id,
      })),
    });
  }

  return res.json({ message: "Permissions updated." });
};

module.exports = {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deactivateUser,
  updateUserPermissions,
};
