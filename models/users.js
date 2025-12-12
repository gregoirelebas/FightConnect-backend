const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  token: String,
  name: String,
  email: String,
  password: String,
  phoneNumber: String,
  bio: String,
  profilePicture: String,
  role: { type: String, enum: ['fighter', 'promoter'] },
  sports: { type: [String], enum: ['mma', 'englishBoxing', 'jjb', 'kickBoxing', 'muayThai'] },
});

const User = mongoose.model('users', userSchema);

module.exports = User;
