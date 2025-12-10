const express = require('express');
const router = express.Router();
const Event = require('../models/events');
const User = require('../models/users');


const { checkBody } = require('../modules/checkBody');


router.post('/create', async (req, res) => {
    if (!checkBody(req.body,
        ['level', 'sports', 'clubName', 'date', 'experience', 'weight', 'minWeight', 'maxWeight', 'name', 'description',
            'PromoterId'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }

    const { level, sports, clubName, date, experience, weight, minWeight, maxWeight, name, description,
        PromoterId, } = req.body;



    const newEvent = new Event({
        level: level,
        sports: sports,
        clubName: clubName,
        date: new Date(date),
        experience: experience,
        weight: weight,
        minWeight: minWeight,
        maxWeight: maxWeight,
        name: name,
        description: description,
        PromoterId: PromoterId,
        fighters: [],
    });

    await newEvent.save();

    res.send("ok");

});

router.get("/search", async (req, res) => {


  try {
    const data = await Event.find(req.query);

    if (data.length > 0) {
      res.json({ result: true, event: data });
    } else {
      res.json({ result: false, error: "No event found" });
    }
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ result: false, error: "Missing id parameter" });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ result: false, error: "Event not found" });
    }

    res.json({ result: true, event });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});



router.get("/user/:id", async (req, res) => {
  try {
    console.log(req.params)
    const  PromoterId  = req.params.id;

    if (!PromoterId) {
      return res.status(400).json({ result: false, error: "Missing id parameter" });
    }

    const event = await Event.find({PromoterId});

    if (!event) {
      return res.status(404).json({ result: false, error: "User not found" });
    }

    res.json({ result: true, event });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});





module.exports = router;