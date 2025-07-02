import express from 'express';
import Transaction from '../models/Transaction.js';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function endOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfMonth(year, month) {
  return new Date(year, month, 1);
}

function endOfMonth(year, month) {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

// GET: Rich Insights
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const start = startOfCurrentMonth();
    const end = endOfCurrentMonth();
    const topCatAgg = await Expense.aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]);
    const topCategory = topCatAgg[0]?._id || null;

    const vendorAgg = await Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: '$vendor', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const frequentVendor = vendorAgg[0]?._id || null;

    const trend = [];
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      const y = now.getFullYear();
      const m = now.getMonth() - i;
      const s = startOfMonth(y, m);
      const e = endOfMonth(y, m);
      const [inc, exp] = await Promise.all([
        Income.aggregate([
          { $match: { userId, date: { $gte: s, $lte: e } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Expense.aggregate([
          { $match: { userId, date: { $gte: s, $lte: e } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);
      const incTotal = inc[0]?.total || 0;
      const expTotal = exp[0]?.total || 0;
      trend.unshift({ month: `${s.getFullYear()}-${s.getMonth() + 1}`, savings: incTotal - expTotal });
    }

    res.json({ topCategory, frequentVendor, savingsTrend: trend });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

export default router;
