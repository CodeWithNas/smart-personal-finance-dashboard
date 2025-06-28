import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OpenAI from 'openai';

import Income from './models/Income.js';
import Expense from './models/Expense.js';
import Budget from './models/Budget.js';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function endOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

async function checkBudgets(userId) {
  const start = startOfCurrentMonth();
  const end = endOfCurrentMonth();
  const expenses = await Expense.aggregate([
    { $match: { userId, date: { $gte: start, $lte: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } }
  ]);
  const budgets = await Budget.find({ userId });
  const result = [];
  budgets.forEach(budget => {
    const spent = expenses.find(e => e._id === budget.category);
    const total = spent ? spent.total : 0;
    result.push({
      category: budget.category,
      limit: budget.monthlyLimit,
      spent: total,
      over: total > budget.monthlyLimit
    });
  });
  return result;
}

app.post('/api/categorize', async (req, res) => {
  const { expenseDescription } = req.body || {};
  if (!expenseDescription || typeof expenseDescription !== 'string') {
    return res.status(400).json({ error: 'expenseDescription required' });
  }
  const lower = expenseDescription.toLowerCase();
  if (/(aldi|lidl|rewe)/i.test(lower)) {
    return res.json({ category: 'Groceries' });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: `Categorize this expense: ${expenseDescription}\nCategories: Food, Groceries, Rent, Transport, Entertainment, Insurance, Utilities, Other` }
      ],
      max_tokens: 10,
      temperature: 0
    });
    const category = completion.choices[0]?.message?.content?.trim() || 'Other';
    res.json({ category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to categorize' });
  }
});

app.get('/api/overview', async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const start = startOfCurrentMonth();
    const end = endOfCurrentMonth();

    const [incomeAgg, expenseAgg] = await Promise.all([
      Income.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpenses = expenseAgg[0]?.total || 0;

    await checkBudgets(userId);

    res.json({
      income: totalIncome,
      expenses: totalExpenses,
      savings: totalIncome - totalExpenses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
