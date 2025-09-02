// backend/routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = express.Router();

// GET /api/users - รายชื่อทั้งหมด (ต้องมี id, username, role)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role'],
      order: [['username', 'ASC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users - สร้างผู้ใช้ใหม่
router.post('/', async (req, res) => {
  try {
    const { username, password, role = 'it_staff' } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hash, role });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
});

// PUT /api/users/:id - แก้ไขผู้ใช้
router.put('/:id', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (username) user.username = username;
    if (role) user.role = role;
    if (password && password.length >= 6) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();

    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update user' });
  }
});

// DELETE /api/users/:id - ลบผู้ใช้
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.destroy();
    res.json({ msg: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

module.exports = router;
