const mongoose = require('mongoose');

const promoterSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref:'users'},
    sport: String,
    organization: String,
    siretNumber: String,
    organizations: [organizationSchema],
    
});

const organizationSchema = mongoose.Schema({
    name: String,
    date: Date,
});

const Promoter = mongoose.model('promoters', promoterSchema);

module.exports = Promoter;


