// index.js
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');
const adminAuth = require('./middleware/adminAuth');
const studentAuth = require('./middleware/studentAuth');
const bcrypt = require('bcrypt');

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// additional admin register
// app.post('/register-admin', async (req, res) => {
//     try {
//       const { name, email, password } = req.body;
//       const existing = await User.findOne({ email });
//       if (existing) return res.send('Admin already registered');
  
//       const hashedPassword = await bcrypt.hash(password, 10);
//       const newAdmin = new User({ name, email, password: hashedPassword });
//       await newAdmin.save();
//       res.send('Admin registered successfully. You can now log in.');
//     } catch (err) {
//       console.error('Error registering admin:', err);
//       res.status(500).send('Error registering admin');
//     }
//   });

// Routes
app.get('/', (req, res) => res.render('home'));
app.use('/', require('./routes/auth'));
app.use('/admin', adminAuth, require('./routes/admin'));
app.use('/student', studentAuth, require('./routes/student'));

// app.use('/', require('./routes/adminRegister'));



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
