const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: String },
  amount: { type: Number, required: true },
  category: { type: String },
  date: { type: Date, default: Date.now },
  recurring: { type: Boolean, default: false }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
