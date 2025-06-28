const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalName: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentSaved: { type: Number, default: 0 },
  deadline: { type: Date }
});

module.exports = mongoose.model('Goal', GoalSchema);
