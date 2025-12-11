const mongoose = require('mongoose');



const fightersReservation = mongoose.Schema({
    fighterId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    status: { type: [String], enum: ['accepted', 'denied', 'onHold'] },
    date: Date,
});

const eventSchema = mongoose.Schema({
    level: { type: String, enum: ['amateur', 'pro'] },
    sports: { type: [String], enum: ['mma', 'englishBoxing', 'jjb', 'kickBoxing', 'muayThai'] },
    clubName: String,
    date: Date,
    experience: { type: [String], enum: ['0', "1-3", '4-6', '7-9', '10-12', '13-15', '16-18', '19-21', '22-25', '25+'] },
    weight: { type: [String], enum: ['52-57', "57-61", '61-66', '66-70', '70-77', '77-84', '84-93', '93-120'] },
    name: String,
    description: String,
    PromoterId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    fighters: [fightersReservation],
});


const Event = mongoose.model('events', eventSchema);

module.exports = Event;

