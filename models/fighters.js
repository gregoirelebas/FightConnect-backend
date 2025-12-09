const mongoose = require('mongoose');

const fighterSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  level: { type: String, enum: ['amateur', 'pro'] },
  licenceNuber: String,
  weight: Number,
  height: Number,
  victoryCount: Number,
  defeatCount: Number,
  drawCount: Number,
  lastFightDate: Date,
});

const Fighter = mongoose.model('fighters', fighterSchema);

module.exports = Fighter;