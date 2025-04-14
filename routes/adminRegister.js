const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');

// GET Register Admin
router.get('/register-admin', async (req, res) => {
  const existingAdmin = await Admin.findOne();
  if (existingAdmin) {
    return res.send('Admin already registered. You can log in.');
  }
  res.render('registerAdmin', { error: null });
});

// POST Register Admin
router.post('/register-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if already registered
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.render('registerAdmin', { error: 'Admin already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      name,
      email,
      password: hashedPassword
    });

    await admin.save();
    res.redirect('/login');
  } catch (err) {
    console.error('Admin registration error:', err.message);
    res.render('registerAdmin', { error: 'Something went wrong' });
  }
});

module.exports = router;
