const express = require('express');
const router = express.Router();

const User = require('../models/users');

const bcrypt = require('bcrypt');

router.post('/signup/fighter', async (req, res) => {
  const newUser = new User({
    name: 'Test',
    email: 'test@email.com',
    password: bcrypt.hashSync('test', 10),
    phoneNumber: '0123456789',
    bio: 'A very detailed bio!',
    profilePicture: 'https://picture.png',
    role: 'fighter',
    sports: ['jjb', 'mma'],
  });

  await newUser.save();

  return res.json({ result: true });
});

module.exports = router;
