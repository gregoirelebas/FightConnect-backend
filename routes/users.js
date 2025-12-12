var express = require('express');
var router = express.Router();

const uid2 = require('uid2');
const bcrypt = require('bcrypt');

const User = require('../models/users');
const Fighter = require('../models/fighters');
const Promoter = require('../models/promoters');

const { checkBody } = require('../modules/checkBody');
const { varToString } = require('../modules/varToString');

router.get('/checkUsername/:username', async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ result: false, error: "Username can't be empty" });
  }

  const found = await User.findOne({ name: username });

  return res.json({ result: found === null });
});

router.post('/signup/fighter', async (req, res) => {
  const {
    name,
    email,
    password,
    phoneNumber,
    bio,
    profilePicture,
    role,
    sports,
    level,
    licenceNumber,
    weight,
    height,
    victoryCount,
    defeatCount,
    drawCount,
    lastFightDate,
  } = req.body;

  const check = checkBody(req.body, [
    varToString({ name }),
    varToString({ email }),
    varToString({ password }),
    varToString({ phoneNumber }),
    varToString({ bio }),
    varToString({ profilePicture }),
    varToString({ role }),
    varToString({ sports }),
    varToString({ level }),
    varToString({ licenceNumber }),
    varToString({ weight }),
    varToString({ height }),
    varToString({ victoryCount }),
    varToString({ defeatCount }),
    varToString({ drawCount }),
    varToString({ lastFightDate }),
  ]);

  if (!check.isValid) {
    return res
      .status(400)
      .json({ result: false, error: 'Missing fields => ' + check.missingFields });
  }

  const found = await User.findOne({ name: name });
  if (found) {
    return res.status(400).json({ result: false, error: 'Username is already used' });
  }

  const token = uid2(32);

  const newUser = new User({
    token: token,
    name: name,
    email: email,
    password: bcrypt.hashSync(password, 10),
    phoneNumber: phoneNumber,
    bio: bio,
    profilePicture: profilePicture,
    role: role,
    sports: sports,
  });

  await newUser.save();

  const userID = (await User.findOne({ token: token }))._id;

  const newFighter = new Fighter({
    userId: userID,
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

  return res.json({ result: true, token: token });
});

router.post('/signup/promoter', async (req, res) => {
  const {
    name,
    email,
    password,
    phoneNumber,
    bio,
    profilePicture,
    role,
    sports,
    siret,
    organizations,
  } = req.body;

  const check = checkBody(req.body, [
    varToString({ name }),
    varToString({ email }),
    varToString({ password }),
    varToString({ phoneNumber }),
    varToString({ bio }),
    varToString({ profilePicture }),
    varToString({ role }),
    varToString({ sports }),
    varToString({ siret }),
    varToString({ organizations }),
  ]);

  if (!check.isValid) {
    return res
      .status(400)
      .json({ result: false, error: 'Missing fields => ' + check.missingFields });
  }

  const found = await User.findOne({ name: req.body.name });

  if (found) {
    return res.status(400).json({ result: false, error: 'Username is already used' });
  }

  const token = uid2(32);

  const newUser = new User({
    token: token,
    name: name,
    email: email,
    password: bcrypt.hashSync(password, 10),
    phoneNumber: phoneNumber,
    bio: bio,
    profilePicture: profilePicture,
    role: role,
    sports: sports,
  });

  await newUser.save();

  const userID = (await User.findOne({ token: token }))._id;

  const newPromoter = new Promoter({
    userId: userID,
    siret: siret,
    organizations: organizations,
  });

  await newPromoter.save();

  return res.json({ result: true, token: token });
});

router.post('/signin', async (req, res) => {
  const { name, password } = req.body;

  const check = checkBody(req.body, [varToString({ name }), varToString({ password })]);
  if (!check.isValid) {
    return res
      .status(400)
      .json({ result: false, error: 'Missing fields => ' + check.missingFields });
  }

  const user = await User.findOne({ name: req.body.name });

  if (!user) {
    return res.json({ result: false, error: 'User not found' });
  }

  if (user && bcrypt.compareSync(password, user.password)) {
    res.json({ result: true, token: user.token });
  } else {
    res.json({ result: false, error: 'Invalid password' });
  }
});

module.exports = router;
