import express from 'express';
import Budget from '../models/Budget.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Protect all routes
router.use(authMiddleware);

// ✅ GET all budgets for logged-in user
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json(budgets);
  } catch (err) {
    console.error('GET /budget error:', err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// ✅ POST a new budget
router.post('/', async (req, res) => {
  try {
    const { category, amount, month } = req.body;

    const budget = new Budget({
      userId: req.user.id,
      category,
      amount,
      month,
    });

    const saved = await budget.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('POST /budget error:', err);
    res.status(400).json({ error: 'Failed to save budget' });
  }
});

// ✅ PUT (Update) an existing budget
router.put('/:id', async (req, res) => {
  try {
    const updated = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Budget not found or unauthorized' });
    }

    res.json(updated);
  } catch (err) {
    console.error('PUT /budget/:id error:', err);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// ✅ DELETE a budget
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted' });
  } catch (err) {
    console.error('DELETE /budget/:id error:', err);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

export default router;
