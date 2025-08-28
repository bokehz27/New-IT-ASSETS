const express = require('express');
const { Op } = require('sequelize');
const Ticket = require('../models/ticket');
const router = express.Router();

// GET /api/tickets - (แก้ไข) เพิ่มระบบ Pagination
router.get('/', async (req, res) => {
  try {
    // 1. รับค่า page และ limit จาก query string
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { status, startDate, endDate } = req.query;
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.report_date = {
        [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')]
      };
    }

    // 2. เปลี่ยนมาใช้ findAndCountAll เพื่อนับจำนวนทั้งหมดสำหรับ Pagination
    const { count, rows } = await Ticket.findAndCountAll({
      where: whereClause,
      order: [['report_date', 'DESC']],
      limit: limit,
      offset: offset
    });

    // 3. จัดรูปแบบข้อมูลที่ส่งกลับให้ Frontend
    res.json({
      tickets: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });

  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});


// GET /api/tickets/:id - (คงเดิม)
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (ticket) {
      res.json(ticket);
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch the ticket' });
  }
});

// GET /api/tickets/asset/:asset_code - (คงเดิม)
router.get('/asset/:asset_code', async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: { asset_code: req.params.asset_code },
      order: [['report_date', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket history' });
  }
});

// PUT /api/tickets/:id - (คงเดิม)
router.put('/:id', async (req, res) => {
  try {
    const { solution, status, handler_name, problem_description, repair_type, contact_phone } = req.body;
    const ticketId = req.params.id;
    
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.solution = solution;
    ticket.status = status;
    ticket.handler_name = handler_name;
    ticket.problem_description = problem_description;
    ticket.repair_type = repair_type;
    ticket.contact_phone = contact_phone;

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    console.error("Failed to update ticket:", error);
    res.status(500).json({ error: 'Failed to update ticket', details: error.message });
  }
});

// DELETE /api/tickets/:id - (คงเดิม)
router.delete('/:id', async (req, res) => {
  try {
    const ticketId = req.params.id;
    const deleted = await Ticket.destroy({
      where: { id: ticketId }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error)
 {
    console.error("Failed to delete ticket:", error);
    res.status(500).json({ error: 'Failed to delete ticket', details: error.message });
  }
});

module.exports = router;