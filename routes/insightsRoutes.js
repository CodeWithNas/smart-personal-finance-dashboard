import express from 'express';
import Transaction from '../models/Transaction.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// GET: Summary Insights
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ userId });

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      byCategory: {},
    };

    for (let txn of transactions) {
      if (txn.type === 'income') {
        summary.totalIncome += txn.amount;
      } else {
        summary.totalExpense += txn.amount;
        summary.byCategory[txn.category] = (summary.byCategory[txn.category] || 0) + txn.amount;
      }
    }

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

export default router;
