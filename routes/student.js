// routes/student.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const IssueRecord = require('../models/IssueRecord');
// const { protect } = require('../middleware/auth');

// Middleware: Only Students
// router.use(protect(['student']));

// Student Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const books = await Book.find();
    res.render('studentDashboard', { student: req.user, books });
  } catch (err) {
    console.error('Student dashboard error:', err.message);
    res.send('Error loading dashboard');
  }
});

// get available book
router.get('/available-books', async (req, res) => {
  try {
    const { title, author, isbn } = req.query;

    const query = {
      
    };

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }

    if (isbn) {
      query.isbn = { $regex: isbn, $options: 'i' };
    }

    const books = await Book.find(query);

    res.render('availableBooks', { student: req.user, books, search: req.query });
  } catch (err) {
    console.error('Error fetching available books:', err.message);
    res.send('Error loading available books');
  }
});


// View Issued Books
router.get('/my-books', async (req, res) => {
  try {
    // Fetch the books borrowed by the logged-in student
    const records = await IssueRecord.find({ student: req.user._id, returnedDate: { $exists: false } })
      .populate('book') // Populate book details like title, ISBN, author, etc.
      .exec();

    // Render the myBooks page with the borrowed book records
    res.render('myBooks', { student: req.user, records });
  } catch (err) {
    console.error('Error fetching borrowed books:', err.message);
    res.send('Error fetching borrowed books');
  }
});

module.exports = router;
