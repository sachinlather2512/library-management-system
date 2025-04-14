const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  rollNo: { type: String, unique: true,
    validate: {
      validator: function (v) {
        return /^\d{12}$/.test(v); // Exactly 12 digits
      },
      message: props => `${props.value} is not a valid 12-digit roll number!`
    }
   },
  fatherName: String,
  class: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
