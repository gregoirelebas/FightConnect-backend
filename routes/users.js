var express = require('express');
var router = express.Router();

const uid2 = require('uid2');
const { checkBody } = require('../modules/checkBody');
const bcrypt = require('bcrypt');




router.post('/signup/fighter', async (req, res) => {
  if (!checkBody(req.body,
    ['username', 'email', 'password', 'phoneNumber', 'bio', 'profilePicture', 'role', 'level', 'licenceNumber',
      'weight', 'height', 'victoryCount', 'defeatCount', 'drawCount', 'lastFightDate'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const { username, email, password, phoneNumber, bio, profilePicture, role, level, licenceNumber, weight, height, victoryCount, defeatCount, drawCount, lastFightDate } = req.body;

  const found = User.findOne({ username: username });
  if (found) {
    return res.status(400).json({ result: false, error: "User already exist" });
  }

  const newUser = new User({
    id: uid2(32),
    username: username,
    email: email,
    password: bcrypt.hashSync(password, 10),
    phoneNumber: phoneNumber,
    bio: bio,
    profilePicture: profilePicture,
    role: role
  });

  await newUser.save();

  const data = await User.findOne({ username: username });

  const newFighter = new Fighter({
    id: uid2(32),
    user_id: data.id,
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

});




router.post('/signup/promoter', async (req, res) => {
  if (!checkBody(req.body,
    ['username', 'email', 'password', 'phoneNumber', 'bio', 'profilePicture', 'role', 'siret', 'name', 'date'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const { username, email, password, phoneNumber, bio, profilePicture, role, siret, name, date } = req.body;

  const found = User.findOne({ username: req.body.username })

  if (found) {
    return res.status(400).json({ result: false, error: "User already exist" });
  }

  const newUser = new User({
    id: uid2(32),
    username: username,
    email: email,
    password: bcrypt.hashSync(password, 10),
    phoneNumber: phoneNumber,
    bio: bio,
    profilePicture: profilePicture,
    role: role
  });

  await newUser.save()

  const data = await User.findOne({ username: req.body.username })

  const newPromoter = new Promoter({
    id: uid2(32),
    user_id: data.id,
    siret: siret,
    organisation: [{
      name: name,
      date: date
    }]
  })
});

newPromoter.save().then(() => {
  res.json({ result: true });
});





router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  User.findOne({ username: req.body.username }).then(data => {

    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true });
    } else {
      res.json({ result: false, error: 'User not found' });
    }
  });
});



module.exports = router;
