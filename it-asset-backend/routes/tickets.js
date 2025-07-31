const express = require('express');
const { Op } = require('sequelize'); // <-- 1. Import Op เข้ามา
const Ticket = require('../models/ticket');
const router = express.Router();

// GET /api/tickets - ดึงรายการแจ้งซ่อมทั้งหมด (พร้อม Filter)
router.get('/', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const whereClause = {};

    // สร้างเงื่อนไขสำหรับ filter status
    if (status) {
      whereClause.status = status;
    }

    // สร้างเงื่อนไขสำหรับ filter วันที่
    if (startDate && endDate) {
      // เพิ่ม T23:59:59 เพื่อให้รวมข้อมูลของวันสุดท้ายทั้งวัน
      whereClause.report_date = {
        [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')]
      };
    }

    const tickets = await Ticket.findAll({ 
      where: whereClause, // นำเงื่อนไขมาใช้ใน query
      order: [['report_date', 'DESC']] 
    });
    
    res.json(tickets);
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});


// GET /api/tickets/:id - ดึงข้อมูลใบแจ้งซ่อมใบเดียวตาม ID
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

// GET /api/tickets/asset/:asset_code - ดึงประวัติการแจ้งซ่อมของ asset ชิ้นเดียว
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

// PUT /api/tickets/:id - อัปเดตสถานะ/วิธีแก้/ผู้ดำเนินการ/ปัญหา/ประเภทการซ่อม
router.put('/:id', async (req, res) => {
  try {
    const { solution, status, handler_name, problem_description, repair_type } = req.body;
    const ticketId = req.params.id;
    
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.solution = solution;
    ticket.status = status;
    ticket.handler_name = handler_name || req.user.username; 
    ticket.problem_description = problem_description;
    ticket.repair_type = repair_type;

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    console.error("Failed to update ticket:", error);
    res.status(500).json({ error: 'Failed to update ticket', details: error.message });
  }
});

// DELETE /api/tickets/:id - ลบรายการแจ้งซ่อม
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
  } catch (error) {
    console.error("Failed to delete ticket:", error);
    res.status(500).json({ error: 'Failed to delete ticket', details: error.message });
  }
});



module.exports = router;