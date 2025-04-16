const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect('/adminlogin');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin || decoded.role !== 'admin') {
      return res.redirect('/adminlogin');
    }

    req.user = admin;
    next();
  } catch (err) {
    console.error('Admin Auth Error:', err.message);
    res.redirect('/adminlogin');
  }
};

module.exports = adminAuth;