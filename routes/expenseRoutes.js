import express from 'express';
import Expense from '../models/Expense.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Require authentication
router.use(authMiddleware);

// ✅ POST: Add new expense
router.post('/', async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      category,
      description,
      date: date ? new Date(date) : new Date()
    });
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to add expense' });
  }
});

// ✅ GET: Get all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// ✅ DELETE: Delete an expense
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;
