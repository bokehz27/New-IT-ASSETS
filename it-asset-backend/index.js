require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// Import routes
const Asset = require('./models/asset');
const SwitchPort = require('./models/SwitchPort');
const BitlockerKey = require('./models/bitlockerKey');
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const ticketRoutes = require('./routes/tickets');
const publicRoutes = require('./routes/public');
const masterDataRoutes = require('./routes/masterData');
const userRoutes = require('./routes/users');
const employeeRoutes = require('./routes/employees');
const dashboardRoutes = require('./routes/dashboard');
const portRoutes = require('./routes/portRoutes');
const switchRoutes = require('./routes/switchRoutes');
const rackRoutes = require('./routes/rackRoutes');
const AssetSpecialProgram = require('./models/assetSpecialProgram');
const reportRoutes = require('./routes/reports');
const path = require('path');
// Import middleware
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  `http://${process.env.SERVER_IP || '172.18.1.61'}:3000` // เพิ่ม IP ของคุณที่นี่
];


app.use(cors({
  origin: function (origin, callback) {
    // อนุญาตถ้า origin อยู่ในลิสต์ หรือเป็น request ที่ไม่มี origin (เช่น จาก Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token'],
}));

// Middlewares
app.use(express.json());

// Sync Database
sequelize.sync({ alter: true }).then(() => {
  console.log('Database & tables synced.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

// === Register Routes ===

// Public Routes (ไม่ต้อง login)
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);

// Protected Routes (ต้อง login และผ่าน 'ยาม')
app.use('/api/assets', authMiddleware, assetRoutes);
app.use('/api/tickets', authMiddleware, ticketRoutes);
app.use('/api/master-data', authMiddleware, masterDataRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/employees', authMiddleware, employeeRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/ports', authMiddleware, portRoutes);
app.use('/api/switches', authMiddleware, switchRoutes);
app.use('/api/racks', authMiddleware, rackRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/public', publicRoutes);
const HOST = '0.0.0.0'; // ทำให้รับการเชื่อมต่อจากทุก IP Address

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Ready to accept connections from your network.`);
});

