import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';
import multer from 'multer';
import fs from 'fs';
import cookieParser from 'cookie-parser';

import Income from './models/Income.js';
import Expense from './models/Expense.js';
import Budget from './models/Budget.js';
import Transaction from './models/Transaction.js';
import Goal from './models/Goal.js';

import transactionRoutes from './routes/transactionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js'; 
import savingRoutes from './routes/savingRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import goalRoutes from './routes/goalsRoutes.js';
import insightsRoutes from './routes/insightsRoutes.js';
import authMiddleware from './middleware/authMiddleware.js'; 

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budget', budgetRoutes); 
app.use('/api/expenses', expenseRoutes); 
app.use('/api/savings', savingRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/insights', insightsRoutes);

const upload = multer({ storage: multer.memoryStorage() });

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

function startOfMonth(year, month) {
  return new Date(year, month, 1);
}

function endOfMonth(year, month) {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
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

async function checkRecurringTransaction(userId, vendor, amount) {
  const min = amount * 0.95;
  const max = amount * 1.05;
  const txs = await Transaction.find({
    userId,
    vendor: new RegExp(`^${vendor}$`, 'i'),
    amount: { $gte: min, $lte: max }
  });
  const months = new Set(txs.map(t => `${t.date.getFullYear()}-${t.date.getMonth()}`));
  if (months.size >= 3) {
    await Transaction.updateMany({
      userId,
      vendor: new RegExp(`^${vendor}$`, 'i'),
      amount: { $gte: min, $lte: max }
    }, { recurring: true });
  }
}

app.post('/api/categorize', authMiddleware, async (req, res) => {
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

// ✅ Protected: Overview
app.get('/api/overview', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
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

// ✅ Protected: Upload
app.post('/api/upload', authMiddleware, upload.single('file'), async (req, res) => {
  const userId = req.user._id;
  if (!req.file) {
    return res.status(400).json({ error: 'File required' });
  }
  try {
    const text = req.file.buffer.toString('utf8');
    const lines = text.trim().split(/\r?\n/);
    const headers = lines.shift().split(',');
    let inserted = 0;
    for (const line of lines) {
      if (!line.trim()) continue;
      const cols = line.split(',');
      const record = {};
      headers.forEach((h, idx) => record[h.trim()] = cols[idx] ? cols[idx].trim() : '');
      const amount = parseFloat(record.amount);
      const date = record.date ? new Date(record.date) : new Date();
      if (isNaN(amount)) continue;
      const tx = await Transaction.create({
        userId,
        vendor: record.vendor || record.description || '',
        amount,
        category: record.category || '',
        date
      });
      inserted++;
      await checkRecurringTransaction(userId, tx.vendor, tx.amount);
    }
    res.json({ inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// ✅ Protected: Goals
app.post('/api/goals', authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.user._id });
    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

app.get('/api/goals', authMiddleware, async (req, res) => {
  const goals = await Goal.find({ userId: req.user._id });
  res.json(goals);
});

app.put('/api/goals/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

app.delete('/api/goals/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
