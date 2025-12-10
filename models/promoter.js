const mongoose = require('mongoose');

const organizationSchema = mongoose.Schema({
  name: String,
  date: Date,
});

const promoterSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  sport: String,
  siretNumber: String,
  organizations: [organizationSchema],
});

const Promoter = mongoose.model('promoters', promoterSchema);

module.exports = Promoter;
