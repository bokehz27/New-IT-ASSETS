const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // ดึง token จาก header ของ request
  const token = req.header('x-auth-token');

  // ตรวจสอบว่ามี token หรือไม่
  if (!token) {
    // ใช้ 401 Unauthorized
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // ตรวจสอบความถูกต้องของ token โดยใช้ Secret Key จาก .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ถ้าถูกต้อง ให้เก็บข้อมูล user ไว้ใน request แล้วไปต่อ
    req.user = decoded.user; // แก้ไขให้ตรงกับตอนสร้าง token
    next();
  } catch (e) {
    // ถ้า token ไม่ถูกต้อง (หมดอายุ/ปลอม) ให้ส่ง 401 Unauthorized
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;