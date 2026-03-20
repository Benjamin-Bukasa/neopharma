const requirePermission = (...codes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role === "SUPERADMIN") {
      return next();
    }

    const hasPermission = req.user.permissions?.some((code) =>
      codes.includes(code)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
};

module.exports = requirePermission;
