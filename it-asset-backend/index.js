const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
require('./models');
const path = require('path');

const authRoutes = require("./routes/auth");
const assetRoutes = require("./routes/assets");
const assetStatusRoutes = require("./routes/asset_statuses");
const brandRoutes = require("./routes/brands");
const categoryRoutes = require("./routes/categories");
const subcategoryRoutes = require("./routes/subcategories");
const modelRoutes = require("./routes/models");
const ramRoutes = require("./routes/rams");
const cpuRoutes = require("./routes/cpus");
const storageRoutes = require("./routes/storages");
const windowsVersionRoutes = require("./routes/windows_versions");
const officeVersionRoutes = require("./routes/office_versions");
const antivirusRoutes = require("./routes/antivirus_programs");
const departmentRoutes = require("./routes/departments");
const locationRoutes = require("./routes/locations");
const positionRoutes = require("./routes/positions");
const emailRoutes = require("./routes/emails");
const employeeRoutes = require("./routes/employees");
const assetSpecialProgramRoutes = require("./routes/asset_special_programs");
const authMiddleware = require("./middleware/authMiddleware");
const portRoutes = require("./routes/portRoutes");
const switchRoutes = require("./routes/switchRoutes");
const rackRoutes = require("./routes/rackRoutes");
const publicRoutes = require("./routes/public");
const ticketRoutes = require("./routes/tickets");
const ticketsRouter = require('./routes/tickets');
const faqRoutes = require("./routes/faqs");
const reportRoutes = require("./routes/reports");
const dashboardRoutes = require("./routes/dashboard");
const userRoutes = require("./routes/users");
const SwitchPort = require("./models/SwitchPort");
const vlanRoutes = require('./routes/vlans');
const ipRoutes = require('./routes/ips');
const specialProgramRoutes = require('./routes/special_programs');
const ipPoolRoutes = require('./routes/ip-pools');




const app = express();
app.use(cors());

// เพิ่ม limit ขนาด body (เช่น 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Public Routes
app.use("/api/auth", authRoutes);

// Protected Routes
app.use("/api/assets", assetRoutes);
app.use("/api/asset_statuses", assetStatusRoutes);
app.use("/api/brands", authMiddleware, brandRoutes);
app.use("/api/categories", authMiddleware, categoryRoutes);
app.use("/api/subcategories", authMiddleware, subcategoryRoutes);
app.use("/api/models", authMiddleware, modelRoutes);
app.use("/api/rams", authMiddleware, ramRoutes);
app.use("/api/cpus", authMiddleware, cpuRoutes);
app.use("/api/storages", authMiddleware, storageRoutes);
app.use("/api/windows_versions", authMiddleware, windowsVersionRoutes);
app.use("/api/office_versions", authMiddleware, officeVersionRoutes);
app.use("/api/antivirus_programs", authMiddleware, antivirusRoutes);
app.use("/api/departments", authMiddleware, departmentRoutes);
app.use("/api/locations", authMiddleware, locationRoutes);
app.use("/api/positions", authMiddleware, positionRoutes);
app.use("/api/emails", authMiddleware, emailRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/asset_special_programs", authMiddleware, assetSpecialProgramRoutes);
app.use("/api/tickets", ticketRoutes);
app.use('/api/tickets', ticketsRouter);
app.use("/api/switches", authMiddleware, switchRoutes);
app.use("/api/racks", authMiddleware, rackRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/reports", authMiddleware, reportRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/ports", authMiddleware, portRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api/vlans', vlanRoutes);
app.use('/api/ips', ipRoutes);
app.use('/api/special-programs', specialProgramRoutes);
app.use('/api/ip-pools', ipPoolRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/public', publicRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Database connection
sequelize
  .sync()  // ปิด alter:true เพื่อไม่ให้ Sequelize ไปสร้าง/แก้ตารางเอง
  .then(() => {
    console.log("✅ Database connected successfully.");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to the database:", err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
