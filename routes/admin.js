// routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Book = require('../models/Book');
const User = require('../models/User');
const IssueRecord = require('../models/IssueRecord');
const adminAuth = require('../middleware/adminAuth');

// Dashboard
// router.get('/dashboard', async (req, res) => {
//   try {
//     const books = await Book.find();
//     const students = await User.find({ role: 'student' });
//     res.render('adminDashboard', { admin: req.user, books, students });
//   } catch (err) {
//     console.error('Dashboard error:', err.message);
//     res.send('Error loading dashboard');
//   }
// });

router.get('/dashboard', async (req, res) => {
  res.render('adminDashboard');
})


// get - add student
router.get('/add-student', (req, res) => {
  res.render('addStudent');
})

// pots - add student
router.post('/add-student', async (req, res) => {
  try {
    const { name, email, password, rollNo, fatherName, class: studentClass } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingStudent = await User.findOne({ $or: [{ email }, { rollNo }] });
    if (existingStudent) return res.send(
      `<script>
          alert('Student already exists')
          window.location.href='/admin/add-student'
        </script>`);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      rollNo,
      fatherName,
      class: studentClass
    });
    
    res.redirect('/admin/add-student');
  } catch (err) {
    console.error('Add student error:', err.message);
    res.send('Error adding student');
  }
});

// get - show all students
router.get('/students', async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    let students;

    if (searchQuery.trim() !== '') {
      const regex = new RegExp(searchQuery, 'i'); // case-insensitive search
      students = await User.find({
        $or: [
          { name: regex },
          { email: regex },
          { rollNo: regex },
          { fatherName: regex },
          { class: regex }
        ]
      });
    } else {
      students = await User.find();
    }

    res.render('showStudents', { students, search: searchQuery });
  } catch (err) {
    console.error('Error fetching students:', err);
    res.render('showStudents', { students: [], search: '', error: 'Failed to load students' });
  }
});

// get - delete student
router.get('/delete-student/:id', async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find and delete the student
    await User.findByIdAndDelete(studentId);

    res.redirect('/admin/students');
  } catch (err) {
    console.error('Delete student error:', err.message);
    res.send('Error deleting student');
  }
});

// get - update student
router.get('/update-student/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.send('Student not found');

    res.render('updateStudent', { student });
  } catch (err) {
    console.error('Load update student error:', err.message);
    res.send('Error loading student');
  }
});

// post - update student
router.post('/update-student/:id', async (req, res) => {
  try {
    const { name, email, rollNo, fatherName, class: studentClass } = req.body;

    await User.findByIdAndUpdate(req.params.id, {
      name,
      email,
      rollNo,
      fatherName,
      class: studentClass
    });

    res.redirect('/admin/students');
  } catch (err) {
    console.error('Update student error:', err.message);
    res.send('Error updating student');
  }
});

// get - add book
router.get('/add-book', (req, res) => {
  res.render('addBook');
})

// post - add book
router.post('/add-book', async (req, res) => {
  try {
    const { title, author, isbn, department, totalCopies } = req.body;
    await Book.create({
      title,
      author,
      isbn,
      department,
      totalCopies,
      availableCopies: totalCopies
    });
    res.redirect('/admin/add-book');
  } catch (err) {
    console.error('Add book error:', err.message);
    res.send('Error adding book');
  }
});

// get - show books
router.get('/books', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      const regex = new RegExp(search, 'i'); // case-insensitive search
      query = {
        $or: [
          { title: regex },
          { author: regex },
          { isbn: regex },
          { department: regex }
        ]
      };
    }

    const books = await Book.find(query);
    res.render('showBooks', { books });
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).send('Internal Server Error');
  }
});

// get - update book
router.get('/update-book/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).send('Book not found');
    res.render('updateBook', { book });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// post - update book
router.post('/update-book/:id', async (req, res) => {
  try {
    const { title, author, isbn, department, totalCopies } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).send('Book not found');
    }

    // Calculate how many copies are currently borrowed
    const borrowedCopies = book.totalCopies - book.availableCopies;

    // If new total is less than borrowed, reject the update
    if (parseInt(totalCopies) < borrowedCopies) {
      return res.status(400).send(`Cannot reduce total copies below borrowed copies (${borrowedCopies})`);
    }

    // Update fields
    book.title = title;
    book.author = author;
    book.isbn = isbn;
    book.department = department;
    book.totalCopies = parseInt(totalCopies);
    book.availableCopies = parseInt(totalCopies) - borrowedCopies;

    await book.save();

    res.redirect('/admin/books');
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).send('Internal Server Error');
  }
});


// post - delete book
router.post('/delete-book/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/admin/books');
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// get - issue book
router.get('/issue-book', (req, res) => {
  res.render('issueBook');
})

// post - issue book
router.post('/issue-book', async (req, res) => {
  try {
    const { rollNo, isbn, issueDate } = req.body;

    const student = await User.findOne({ rollNo });
    const book = await Book.findOne({ isbn });

    if (!student) return res.send(
      `<script>
          alert('Student not found')
          window.location.href='/admin/issue-book'
        </script>`
    );
    if (!book) return res.send(
      `<script>
          alert('Book not found')
          window.location.href='/admin/issue-book'
        </script>`
    );
    if (book.availableCopies < 1) return res.send(
      `<script>
          alert('Book is not available')
          window.location.href='/admin/issue-book'
        </script>`
    );

    // Set issue and due dates
    const issuedOn = new Date(issueDate);
    const dueDate = new Date(issuedOn);
    dueDate.setDate(issuedOn.getDate() + 15);

    // Create issue record
    await IssueRecord.create({
      book: book._id,
      student: student._id,
      issueDate: issuedOn,
      dueDate
    });

    // Update book availability
    book.availableCopies -= 1;
    await book.save();

    res.redirect('/admin/borrowed-books');
  } catch (err) {
    console.error('Issue book error:', err.message);
    res.send('Error issuing book');
  }
});

// get - borrowed books
router.get('/borrowed-books', async (req, res) => {
  try {
    const records = await IssueRecord.find({ returnDate: null })
      .populate('student')
      .populate('book')
      .lean();

    const validRecords = records.filter(r => r.student && r.book);
    res.render('borrowedBooks', { records: validRecords });

  } catch (err) {
    console.error('Error fetching borrowed books:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

// post - return book
router.post('/return-book/:id', async (req, res) => {
  try {
    const record = await IssueRecord.findById(req.params.id).populate('book');

    if (!record || record.returnDate) {
      return res.send('Invalid or already returned record.');
    }

    const returnDate = new Date();
    const dueDate = new Date(record.dueDate);
    const daysLate = Math.max(0, Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24)));
    const fine = daysLate > 0 ? daysLate * 10 : 0;

    // Update record
    record.returnDate = returnDate;
    record.fine = fine;
    await record.save();

    // Increase availableCopies
    const book = await Book.findById(record.book._id);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.redirect('/admin/returned-books');
  } catch (err) {
    console.error('Return book error:', err.message);
    res.send('Error returning book');
  }
});

// get - returned books
router.get('/returned-books', async (req, res) => {
  try {
    let records = await IssueRecord.find({ returnDate: { $ne: null } })
      .populate('student')
      .populate('book');

    // Filter out records where student or book is null
    records = records.filter(record => record.student && record.book);

    res.render('returnedBooks', { records });
  } catch (err) {
    console.error('Returned books error:', err.message);
    res.send('Error fetching returned books');
  }
});

// get - delete return books
router.post('/delete-returned-book/:id', async (req, res) => {
  try {
    await IssueRecord.findByIdAndDelete(req.params.id);
    res.redirect('/admin/returned-books');
  } catch (err) {
    console.error('Delete returned book error:', err.message);
    res.send('Error deleting returned book record');
  }
});


module.exports = router;