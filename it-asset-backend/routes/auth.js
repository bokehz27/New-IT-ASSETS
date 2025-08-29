require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log('--- REGISTER ATTEMPT RECEIVED ---');
  try {
    const { username, password } = req.body;
    console.log(`[1] Received data for username: ${username}`);

    if (!username || !password) {
      console.log('[FAIL] Missing username or password.');
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    console.log('[2] Checking database for existing user...');
    const existingUser = await User.findOne({ where: { username } });
    
    if (existingUser) {
      console.log(`[FAIL] User '${username}' already exists.`);
      return res.status(400).json({ msg: 'User already exists' });
    }
    console.log(`[3] User '${username}' is unique. Continuing.`);

    console.log('[4] Generating salt for password...');
    const salt = await bcrypt.genSalt(10);
    console.log('[5] Hashing password...');
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('[6] Password hashed successfully.');

    console.log('[7] Attempting to save new user to database...');
    const newUser = await User.create({
      username,
      password: hashedPassword,
    });
    console.log('[SUCCESS] User created in database!');

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
    });
  } catch (error) {
    console.error('---!!! AN ERROR OCCURRED IN CATCH BLOCK !!!---');
    console.error('The registration process failed with the following error:');
    console.error(error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // สร้าง Payload ให้ตรงกับที่ authMiddleware ต้องการ
    const payload = {
      user: {
        id: user.id,
        username: user.username
      }
    };

    // สร้าง Token โดยดึง Secret Key จาก .env
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '2h', // ขยายเวลาหมดอายุ
    });
    
    res.json({
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/verify - ใช้สำหรับตรวจสอบ Token
router.get('/verify', authMiddleware, (req, res) => {
  // ถ้าโค้ดทำงานมาถึงบรรทัดนี้ได้ แสดงว่า token ถูกต้อง
  res.json({ success: true, user: { id: req.user.id, username: req.user.username } });
});

module.exports = router;