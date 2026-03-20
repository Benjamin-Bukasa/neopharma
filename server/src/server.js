require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const storeRoutes = require("./routes/storeRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const unitRoutes = require("./routes/unitRoutes");
const productRoutes = require("./routes/productRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const customerRoutes = require("./routes/customerRoutes");
const productCategoryRoutes = require("./routes/productCategoryRoutes");
const productFamilyRoutes = require("./routes/productFamilyRoutes");
const storageZoneRoutes = require("./routes/storageZoneRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const inventoryMovementRoutes = require("./routes/inventoryMovementRoutes");
const approvalFlowRoutes = require("./routes/approvalFlowRoutes");
const supplyRequestRoutes = require("./routes/supplyRequestRoutes");
const transferRoutes = require("./routes/transferRoutes");
const purchaseRequestRoutes = require("./routes/purchaseRequestRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const deliveryNoteRoutes = require("./routes/deliveryNoteRoutes");
const stockEntryRoutes = require("./routes/stockEntryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const { startSubscriptionCron } = require("./services/subscriptionCron");
const { initSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/product-families", productFamilyRoutes);
app.use("/api/storage-zones", storageZoneRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/inventory-movements", inventoryMovementRoutes);
app.use("/api/approval-flows", approvalFlowRoutes);
app.use("/api/supply-requests", supplyRequestRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/purchase-requests", purchaseRequestRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/delivery-notes", deliveryNoteRoutes);
app.use("/api/stock-entries", stockEntryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin-dashboard", adminDashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

const port = process.env.PORT || 5000;
initSocket(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

startSubscriptionCron();
