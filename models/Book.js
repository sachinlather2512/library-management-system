const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  isbn: { type: String, unique: true },
  department: String,
  totalCopies: Number,
  availableCopies: Number
});

module.exports = mongoose.model('Book', bookSchema);
