const mongoose = require('mongoose');

const fighterModel = mongoose.model({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  level: { type: String, enum: ['amateur', 'pro'] },
  licenceNuber: String,
  weight: Number,
  height: Number,
  victoryCount: Number,
  defeatCount: Number,
  drawCount: Number,
  lastFightDate: Date,
});

module.exports = mongoose.Schema('fighters', fighterModel);
