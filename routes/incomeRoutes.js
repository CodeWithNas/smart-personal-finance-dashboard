import express from 'express';
import Income from '../models/Income.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔐 Protect all routes
router.use(authMiddleware);

// ✅ GET all income for the logged-in user
router.get('/', async (req, res) => {
  try {
    const income = await Income.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(income);
  } catch (err) {
    console.error('GET /income error:', err);
    res.status(500).json({ error: 'Failed to fetch income' });
  }
});

// ✅ POST new income
router.post('/', async (req, res) => {
  try {
    const newIncome = new Income({
      ...req.body,
      userId: req.user.id,
    });
    const saved = await newIncome.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('POST /income error:', err);
    res.status(400).json({ error: 'Failed to save income' });
  }
});

// ✅ DELETE income by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json({ message: 'Income deleted' });
  } catch (err) {
    console.error('DELETE /income/:id error:', err);
    res.status(500).json({ error: 'Failed to delete income' });
  }
});

export default router;
