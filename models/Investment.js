import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  assetType: { type: String, required: true },
  institution: { type: String },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Investment', investmentSchema);
