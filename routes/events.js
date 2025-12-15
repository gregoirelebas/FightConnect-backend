const express = require('express');
const router = express.Router();

const uid2 = require('uid2');

const User = require('../models/users');
const Event = require('../models/events');

const { checkBody } = require('../modules/checkBody');
const { varToString } = require('../modules/varToString');

router.post('/create', async (req, res) => {
    const { level, sport, clubName, date, experience, weight, name, description, promoterToken } =
        req.body;

    const check = checkBody(req.body, [
        varToString({ level }),
        varToString({ sport }),
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
        sport: sport,
        clubName: clubName,
        date: new Date(date),
        experience: experience,
        weight: weight,
        name: name,
        description: description,
        promoterId: promoter._id,
        fighters: [],
    });

    await newEvent.save();

    res.json({ result: true, token: eventToken });
});

router.get('/search', async (req, res) => {
    try {
        const data = await Event.find(req.query);

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

        const data = await Event.findOne({ token: token });

        if (!data) {
            return res.status(400).json({ result: false, error: 'No event found' });
        }

        res.json({ result: true, data: data });
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
    } catch (e) {
        return res.status(500).json({ result: false, error: e });
    }
});

router.put('/acceptFighter', async (req, res) => {
    try {
        const { fighterId, eventId } = req.body;

        const data = await Event.find({ promoterId: promoter._id });

        if (!data) {
            return res.status(404).json({ result: false, error: 'Event not found' });
        }

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

module.exports = router;
