import express from 'express';
import Saving from '../models/Saving.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// ✅ POST: Create a new saving goal
router.post('/', async (req, res) => {
  try {
    const { goal, targetAmount, contribution, dueDate } = req.body;
    const newSaving = new Saving({
      userId: req.user.id,
      goal,
      targetAmount,
      contributions: [{ amount: contribution, date: new Date() }],
      dueDate: new Date(dueDate),
    });
    const saved = await newSaving.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create saving goal' });
  }
});

// ✅ POST: Add contribution to an existing saving
router.post('/:id/contribute', async (req, res) => {
  try {
    const { amount } = req.body;
    const saving = await Saving.findOne({ _id: req.params.id, userId: req.user.id });
    if (!saving) return res.status(404).json({ error: 'Saving goal not found' });

    saving.contributions.push({ amount, date: new Date() });
    await saving.save();
    res.json(saving);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to add contribution' });
  }
});

// ✅ GET: Fetch all savings with totalSaved calculated
router.get('/', async (req, res) => {
  try {
    const savings = await Saving.find({ userId: req.user.id });
    const enriched = savings.map((s) => ({
      ...s.toObject(),
      totalSaved: s.contributions.reduce((acc, c) => acc + c.amount, 0),
    }));
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch savings' });
  }
});

// ✅ DELETE: Remove a saving goal
router.delete('/:id', async (req, res) => {
  try {
    const result = await Saving.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ error: 'Saving not found' });
    res.json({ message: 'Saving deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete saving' });
  }
});

// ✅ PUT: Update an existing saving goal
router.put('/:id', async (req, res) => {
  try {
    const { goal, targetAmount, dueDate } = req.body;

    const updated = await Saving.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        ...(goal && { goal }),
        ...(targetAmount && { targetAmount }),
        ...(dueDate && { dueDate: new Date(dueDate) })
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Saving goal not found or unauthorized' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Failed to update saving goal:', err);
    res.status(500).json({ error: 'Server error while updating saving goal' });
  }
});

export default router;
