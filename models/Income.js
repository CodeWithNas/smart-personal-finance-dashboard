const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  source: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Income', IncomeSchema);
