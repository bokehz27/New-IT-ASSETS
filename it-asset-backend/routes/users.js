const express = require('express');
const User = require('../models/user');
const router = express.Router();

// GET /api/users - ดึงรายชื่อผู้ใช้ (admin) ทั้งหมด
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['username'], // ดึงมาแค่ username
      order: [['username', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
