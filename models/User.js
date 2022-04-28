const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'please provide valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'please provide password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.correctPassword = async function (cadidatePassword) {
  const isMatch = await bcrypt.compare(cadidatePassword, this.password);
  return isMatch;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
