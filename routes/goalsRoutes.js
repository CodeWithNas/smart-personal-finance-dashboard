import express from 'express';
import Goal from '../models/Goal.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateGoal } from '../middleware/validation.js';

const router = express.Router();
router.use(authMiddleware);

// ✅ GET all goals for the logged-in user
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ deadline: 1 });
    res.json(goals);
  } catch (err) {
    console.error('GET /goals error:', err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// ✅ POST a new goal
router.post('/', validateGoal, async (req, res) => {
  try {
    const { goalName, targetAmount, deadline } = req.body;

    const goal = await Goal.create({
      userId: req.user.id,
      goalName,
      targetAmount,
      deadline,
    });

    res.status(201).json(goal);
  } catch (err) {
    console.error('POST /goals error:', err);
    res.status(400).json({ error: 'Failed to create goal' });
  }
});

// ✅ DELETE a goal
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted' });
  } catch (err) {
    console.error('DELETE /goals/:id error:', err);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;
