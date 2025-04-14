const jwt = require('jsonwebtoken');
const User = require('../models/User');

const studentAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect('/studentLogin');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || decoded.role !== 'student') {
      return res.redirect('/studentLogin');
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Student Auth Error:', err.message);
    res.redirect('/studentLogin');
  }
};

module.exports = studentAuth;
