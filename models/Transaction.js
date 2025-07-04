import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  vendor: { type: String },
  amount: { type: Number, required: true },
  category: { type: String },
  date: { type: Date, default: Date.now },
  recurring: { type: Boolean, default: false },
  frequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly',
  },
  lastGenerated: { type: Date },
  description: { type: String }, // Optional but useful for UI
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
export default Transaction;
