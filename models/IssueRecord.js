const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: Date,
  returnDate: Date,
  fine: { type: Number, default: 0 }
});

module.exports = mongoose.model('IssueRecord', issueSchema);
