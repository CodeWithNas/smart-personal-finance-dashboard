import express from 'express';
import Transaction from '../models/Transaction.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateTransaction, validateTransactionUpdate } from '../middleware/validation.js';

const router = express.Router();

// ✅ Protect all routes with JWT middleware
router.use(authMiddleware);

// ✅ GET all transactions for the logged-in user
router.get('/', async (req, res) => {
  try {
    const { type, month } = req.query;
    const filter = { userId: req.user.id };

    if (type) {
      filter.type = type.toLowerCase();
    }

    if (month) {
      const [y, m] = month.split('-');
      const year = parseInt(y, 10);
      const monthIdx = parseInt(m, 10) - 1;
      const start = new Date(year, monthIdx, 1);
      const end = new Date(year, monthIdx + 1, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('GET /transactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ✅ POST a new transaction (auto-assigns userId from token)
router.post('/', validateTransaction, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      userId: req.user.id,
    });
    const saved = await transaction.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('POST /transactions error:', err);
    res.status(400).json({ error: 'Failed to save transaction' });
  }
});

// ✅ DELETE a transaction owned by the logged-in user
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error('DELETE /transactions/:id error:', err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// ✅ PUT (Update) a transaction owned by the logged-in user
router.put('/:id', validateTransactionUpdate, async (req, res) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }

    res.json(updated);
  } catch (err) {
    console.error('PUT /transactions/:id error:', err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

export default router;
