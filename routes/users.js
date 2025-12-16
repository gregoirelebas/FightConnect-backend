var express = require('express');
var router = express.Router();

const uid2 = require('uid2');
const bcrypt = require('bcrypt');

const User = require('../models/users');
const Fighter = require('../models/fighters');
const Promoter = require('../models/promoters');
const Event = require('../models/events');

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
    res.json({ result: true, token: user.token, role: user.role });
  } else {
    res.json({ result: false, error: 'Invalid password' });
  }
});

router.delete('/:token', async (req, res) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(400).json({ result: false, error: 'User not found' });
    }

    if (user.role === 'fighter') {
      await Fighter.deleteOne({ userId: user._id });
    } else if (user.role === 'promoter') {
      await Promoter.deleteOne({ userId: user._id });
    }

    await User.findByIdAndDelete(user._id);

    res.json({ result: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ result: false, error: error });
  }
});

async function getUserByRole(user, res) {
  if (user.role === 'fighter') {
    const fighter = await Fighter.findOne({ userId: user._id }).populate('userId');
    if (!fighter) {
      return res.status(400).json({ result: false, error: 'Fighter not found' });
    }

    return res.json({ result: true, data: fighter });
  } else if (user.role === 'promoter') {
    const promoter = await Promoter.findOne({ userId: user._id }).populate('userId');

    if (!promoter) {
      return res.status(400).json({ result: false, error: 'Promoter not found' });
    }

    return res.json({ result: true, data: promoter });
  } else {
    return res.json({ result: false, error: 'User role not handled: ' + user.role });
  }
}

router.get('/me/:token', async (req, res) => {
  const token = req.params.token;

  if (!token) {
    return res.status(400).json({ result: false, error: 'Missing token' });
  }

  const user = await User.findOne({ token: token });
  if (!user) {
    return res.status(400).json({ result: false, error: 'User not found' });
  }

  return getUserByRole(user, res);
});

router.get('/profile/:username', async (req, res) => {
  const username = req.params.username;

  if (!username) {
    return res.status(400).json({ result: false, error: 'Missing username' });
  }

  const user = await User.findOne({ name: username });
  if (!user) {
    return res.status(400).json({ result: false, error: 'User not found' });
  }

  return getUserByRole(user, res);
});

router.get('/applicants/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ result: false, error: 'Missing token' });
    }

    const event = await Event.findOne({ token: token });
    if (!event) {
      return res.status(400).json({ result: false, error: 'Event not found' });
    }

    const applicants = [];
    for (application of event.fighters) {
      const fighter = await User.findById(application.fighterId);

      applicants.push({ fighter: fighter, status: application.status, date: application.date });
    }

    res.json({ result: true, applicants: applicants });
  } catch (e) {
    return res.status(500).json({ result: false, error: e });
  }
});

module.exports = router;
