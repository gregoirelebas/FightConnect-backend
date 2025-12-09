const express = require('express');
const router = express.Router();
const Event = require('../models/events');


const { checkBody } = require('../modules/checkBody');


router.post('/create', async (req, res) => {
    if (!checkBody(req.body,
        ['level', 'sports', 'clubName', 'date', 'experience', 'weight', 'name','description',
            'PromoterId'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }

    const { level, sports, clubName, date, experience, weight, name, description,
            PromoterId, } = req.body;

  

    const newEvent = new Event({
        level: level,
        sports: sports,
        clubName: clubName,
        date: new Date(date),
        experience: experience,
        weight: weight,
        name: name,
        description: description,
        PromoterId: PromoterId,
        fighters: [],
    });

    await newEvent.save();

   res.send("ok");

});


module.exports = router;