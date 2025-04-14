const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

// GET Login
router.get('/studentlogin', (req, res) => {
  res.render('studentLogin', { error: null });
});

router.get('/adminlogin', (req, res) => {
  res.render('adminLogin', { error: null });
});


router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let user;
    
    if (role === 'admin') {
      user = await Admin.findOne({ email });

      if (!user) {
        return res.render('adminLogin', { error: 'Admin not found' });
      }
    } else {
      user = await User.findOne({ email });

      if (!user) {
        return res.render('studentLogin', { error: 'Student not found' });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render(role === 'admin' ? 'adminLogin' : 'studentLogin', {
        error: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, { httpOnly: true });

    return role === 'admin'
      ? res.redirect('/admin/dashboard')
      : res.redirect('/student/dashboard');

  } catch (err) {
    console.error('Login error:', err.message);
    res.render('home', { error: 'Something went wrong' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;
