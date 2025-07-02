import express from 'express';
import Investment from '../models/Investment.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateInvestment, validateInvestmentUpdate } from '../middleware/validation.js';

const router = express.Router();
router.use(authMiddleware);

// ✅ POST: Add investment
router.post('/', validateInvestment, async (req, res) => {
  try {
    const { amount, assetType, institution, date } = req.body;

    const investment = await Investment.create({
      userId: req.user._id,
      amount,
      assetType,
      institution,
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json(investment);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to add investment' });
  }
});

// ✅ GET: Get all investments for a user
router.get('/', async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(investments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// ✅ DELETE: Delete an investment
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Investment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({ message: 'Investment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

// ✅ PUT: Update an investment
router.put('/:id', validateInvestmentUpdate, async (req, res) => {
  try {
    const updated = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update investment' });
  }
});

export default router;
