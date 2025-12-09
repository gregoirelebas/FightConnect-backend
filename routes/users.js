var express = require('express');
var router = express.Router();
require('../models/connection');

const { checkBody } = require('../modules/checkBody');
const bcrypt = require('bcrypt');

router.post('/signup/fighter', (req, res) => {
  if (!checkBody(req.body,
    ['username', 'email', 'password', 'phone_number', 'bio', 'profile_picture', 'role', 'level', 'licence_number',
      'weight', 'height', 'victory_count', 'defeat_count', 'draw_count', 'last_fight_date'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        phone_number: req.body.phone_number,
        bio: req.body.bio,
        profile_picture: req.body.profile_picture,
        role: req.body.role,
        level: req.body.level,
        licence_number: req.body.licence_number,
        weight: req.body.weight,
        height: req.body.height,
        victory_count: req.body.victory_count,
        defeat_count: req.body.defeat_count,
        draw_count: req.body.draw_count,
        last_fight_date: req.body.last_fight_date,
      });

      newUser.save().then(() => {
        res.json({ result: true });
      });
    } else {
      res.json({ result: false, error: 'User already exists' });
    }

  });

});

router.post('/signup/promoter', (req, res) => {
  if (!checkBody(req.body,
    ['username', 'email', 'password', 'phone_number', 'bio', 'profile_picture', 'role', 'siret', 'organisation'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        phone_number: req.body.phone_number,
        bio: req.body.bio,
        profile_picture: req.body.profile_picture,
        role: req.body.role,
        siret: req.body.siret,
        organisation: req.body.organisation,
      });

      newUser.save().then(() => {
        res.json({ result: true });
      });
    } else {
      res.json({ result: false, error: 'User already exists' });
    }

  });

});

  router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username','password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
   User.findOne({ username: req.body.username}).then(data => {

    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({result:true});
    } else {
      res.json({ result: false, error: 'User not found' });
    }
  });
});



module.exports = router;
