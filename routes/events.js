const express = require('express');
const router = express.Router();

const uid2 = require('uid2');

const User = require('../models/users');
const Event = require('../models/events');
const Fighter = require('../models/fighters');

const { checkBody } = require('../modules/checkBody');
const { varToString } = require('../modules/varToString');

router.post('/create', async (req, res) => {
  const {
    level,
    sport,
    city,
    clubName,
    date,
    experience,
    weight,
    name,
    description,
    promoterToken,
  } = req.body;

  const check = checkBody(req.body, [
    varToString({ level }),
    varToString({ sport }),
    varToString({ city }),
    varToString({ clubName }),
    varToString({ date }),
    varToString({ experience }),
    varToString({ weight }),
    varToString({ name }),
    varToString({ description }),
    varToString({ promoterToken }),
  ]);

  if (!check.isValid) {
    return res
      .status(400)
      .json({ result: false, error: 'Missing fields => ' + check.missingFields });
  }

  const promoter = await User.findOne({ token: promoterToken });
  if (!promoter) {
    return res.status(400).json({ result: false, error: 'Promoter not found' });
  }

  const eventToken = uid2(32);

  const newEvent = new Event({
    token: eventToken,
    level: level,
    city: city,
    sport: sport,
    clubName: clubName,
    date: new Date(date),
    experience: experience,
    weight: weight,
    name: name,
    description: description,
    promoterId: promoter._id,
    fighters: [],
    isCancelled: false,
  });

  await newEvent.save();

  res.json({ result: true, token: eventToken });
});

router.get('/', async (req, res) => {
  try {
    const data = await Event.find();

    res.json({ result: true, data: data });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ result: false, error: 'Missing token' });
    }

    const event = await Event.findOne({ token: token }).populate('promoterId');

    if (!event) {
      return res.status(400).json({ result: false, error: 'No event found' });
    }

    res.json({ result: true, data: event });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

router.get('/promoter/:token', async (req, res) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(400).json({ result: false, error: 'Missing token' });
    }

    const promoter = await User.findOne({ token: token });
    if (!promoter) {
      return res.status(400).json({ result: false, error: 'Promoter not found' });
    }

    const events = await Event.find({ promoterId: promoter._id });

    return res.json({ result: true, data: events });
  } catch (e) {
    return res.status(500).json({ result: false, error: e });
  }
});

router.put('/decision', async (req, res) => {
  try {
    const { fighterToken, promoterToken, eventToken, decision } = req.body;

    const check = checkBody(req.body, [
      varToString(fighterToken),
      varToString(promoterToken),
      varToString(eventToken),
      varToString(decision),
    ]);

    if (!check) {
      return res
        .status(400)
        .json({ result: false, error: 'Missing fields: ' + check.missingFields });
    }

    const promoter = await User.findOne({ token: promoterToken });
    if (!promoter) {
      return res.status(400).json({ result: false, error: 'Promoter not found' });
    }

    const event = await Event.findOne({ token: eventToken });
    if (!event) {
      return res.status(400).json({ result: false, error: 'Event not found' });
    }

    if (event.isCancelled) {
      return res.status(400).json({ result: false, error: 'This event has been cancelled' });
    }

    if (event.promoterId.toString() !== promoter._id.toString()) {
      return res
        .status(400)
        .json({ result: false, error: 'This promoter is not the manager of the event' });
    }

    const fighter = await User.findOne({ token: fighterToken });
    if (!fighter) {
      return res.status(400).json({ result: false, error: 'Fighter not found' });
    }

    const reservation = event.fighters.find(
      (r) => r.fighterId.toString() === fighter._id.toString()
    );

    if (!reservation) {
      return res.status(400).json({ result: false, error: "Fighter hasn't joined the event" });
    }

    if (reservation.status !== 'onHold') {
      return res.status(400).json({
        result: false,
        error: 'Application is not onHold => a decision has already been made',
      });
    }

    reservation.status = decision ? 'accepted' : 'denied';
    await event.save();

    res.json({ result: true });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

router.put('/join', async (req, res) => {
  try {
    const { fighterToken, eventToken } = req.body;

    const event = await Event.findOne({ token: eventToken });

    if (!event) {
      return res.status(404).json({ result: false, error: 'Event not found' });
    }

    if (event.isCancelled) {
      return res.status(400).json({ result: false, error: 'This event has been cancelled' });
    }

    const fighter = await User.findOne({ token: fighterToken });

    if (!fighter) {
      return res.status(404).json({ result: false, error: 'Fighter not found' });
    }

    if (fighter.role === 'promoter') {
      return res.status(404).json({ result: false, error: 'Fighter not found' });
    }

    const alreadyRegistered = event.fighters.some((r) => r.fighterId.equals(fighter._id));
    if (alreadyRegistered) {
      return res
        .status(400)
        .json({ result: false, error: 'Fighter already registered for this event' });
    }

    event.fighters.push({ fighterId: fighter._id, status: 'onHold', date: new Date() });
    const data = await event.save();

    res.json({ result: true, data: data });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

router.get('/fighter/:token', async (req, res) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(400).json({ result: false, error: 'Missing token' });
    }

    const fighter = await User.findOne({ token: token });
    if (!fighter) {
      return res.status(400).json({ result: false, error: 'Fighter not found' });
    }

    const data = await Event.find({ 'fighters.fighterId': fighter._id });

    res.json({ result: true, data: data });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

router.get('/reservation/:fighterToken/:eventToken', async (req, res) => {
  try {
    const { fighterToken, eventToken } = req.params;

    const event = await Event.findOne({ token: eventToken });
    if (!event) {
      return res.status(404).json({ result: false, error: 'Event not found' });
    }

    const fighter = await User.findOne({ token: fighterToken });
    if (!fighter) {
      return res.status(404).json({ result: false, error: 'Fighter not found' });
    }

    const reservation = event.fighters.find((r) => r.fighterId.equals(fighter._id));
    if (!reservation) {
      return res.json({ result: true, status: '' });
    }

    return res.json({ result: true, status: reservation.status });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

router.put('/cancel', async (req, res) => {
  try {
    const { promoterToken, eventToken } = req.body;

    const check = checkBody(req.body, [varToString(promoterToken), varToString(eventToken)]);
    if (!check.isValid) {
      return res
        .status(400)
        .json({ result: false, error: 'Missing fields => ' + check.missingFields });
    }

    const event = await Event.find({ token: eventToken });
    if (!event) {
      return res.status(404).json({ result: false, error: 'Event not found' });
    }

    if (event.isCancelled) {
      return res
        .status(400)
        .json({ result: false, error: 'This event has already been cancelled' });
    }

    const promoter = await User.findOne({ token: promoterToken });
    if (!promoter) {
      return res.status(400).json({ result: false, error: 'Promoter not found' });
    }

    if (event.promoterId.toString() !== promoter._id.toString()) {
      return res
        .status(400)
        .json({ result: false, error: 'This promoter is not the manager of the event' });
    }

    event.isCancelled = true;
    await event.save();

    return res.json({ result: true });
  } catch (e) {
    return res.status(500).json({ result: false, error: e.message });
  }
});

module.exports = router;
