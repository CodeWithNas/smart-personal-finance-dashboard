// ✅ Savings.js (Mongoose Model)
import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

const savingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  contributions: [contributionSchema]
}, { timestamps: true });

export default mongoose.model('Saving', savingSchema);
