var express = require('express');
var router = express.Router();

const uid2 = require('uid2');
const { checkBody } = require('../modules/checkBody');
const bcrypt = require('bcrypt');

const User = require('../models/users');
const Fighter = require('../models/fighters');
const Promoter = require('../models/promoter');


router.post('/signup/fighter', async (req, res) => {
  if (!checkBody(req.body,
    ['username', 'email', 'password', 'phoneNumber', 'bio', 'profilePicture', 'role', 'level', 'licenceNumber',
      'weight', 'height', 'victoryCount', 'defeatCount', 'drawCount', 'lastFightDate'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const { name, email, password, phoneNumber, bio, profilePicture, role, sports, level, licenceNumber, weight, height, victoryCount, defeatCount, drawCount, lastFightDate } = req.body;

  const found = User.findOne({ name: name });
  if (found) {
    return res.status(400).json({ result: false, error: "User already exist" });
  }

  const newUser = new User({
    id: uid2(32),
    name: name,
    email: email,
    password: bcrypt.hashSync(password, 10),
    phoneNumber: phoneNumber,
    bio: bio,
    profilePicture: profilePicture,
    role: role,
    sports: sports
  });

  await newUser.save();

  const data = await User.findOne({ name: name });

  const newFighter = new Fighter({
    id: uid2(32),
    userId: data.id,
    level: level,
    licenceNumber: licenceNumber,
    weight: weight,
    height: height,
    victoryCount: victoryCount,
    defeatCount: defeatCount,
    drawCount: drawCount,
    lastFightDate: lastFightDate,
  });

  await newFighter.save();

  return res.json({ result: true });


});




router.post('/signup/promoter', async (req, res) => {
  if (!checkBody(req.body,
    ['username', 'email', 'password', 'phoneNumber', 'bio', 'profilePicture', 'role', 'siret', 'name', 'date'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const { name, email, password, phoneNumber, bio, profilePicture, role, sports, siret, organizations } = req.body;

  const found = User.findOne({ name: req.body.name })

  if (found) {
    return res.status(400).json({ result: false, error: "User already exist" });
  }

  const newUser = new User({
    id: uid2(32),
    name: name,
    email: email,
    password: bcrypt.hashSync(password, 10),
    phoneNumber: phoneNumber,
    bio: bio,
    profilePicture: profilePicture,
    role: role,
    sports: sports
  });

  await newUser.save()

  const data = await User.findOne({ name: name })

  const newPromoter = new Promoter({
    userId: data.id,
    siret: siret,
    organizations: organizations
  })

  await newPromoter.save();

  return res.json({ result: true });


});




router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  User.findOne({ name: req.body.name }).then(data => {

    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true });
    } else {
      res.json({ result: false, error: 'User not found' });
    }
  });
});



module.exports = router;
