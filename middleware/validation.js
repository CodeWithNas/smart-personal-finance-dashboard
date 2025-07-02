export const validateTransaction = (req, res, next) => {
  const { type, amount } = req.body;
  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Invalid or missing type' });
  }
  const amt = Number(amount);
  if (isNaN(amt)) {
    return res.status(400).json({ error: 'Invalid or missing amount' });
  }
  next();
};

export const validateTransactionUpdate = (req, res, next) => {
  if (req.body.type && !['income', 'expense'].includes(req.body.type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }
  if (req.body.amount !== undefined && isNaN(Number(req.body.amount))) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  next();
};

export const validateSaving = (req, res, next) => {
  const { goal, targetAmount, contribution, dueDate } = req.body;
  if (!goal || typeof goal !== 'string') {
    return res.status(400).json({ error: 'Goal is required' });
  }
  if (isNaN(Number(targetAmount))) {
    return res.status(400).json({ error: 'targetAmount must be a number' });
  }
  if (isNaN(Number(contribution))) {
    return res.status(400).json({ error: 'contribution must be a number' });
  }
  if (!dueDate || isNaN(Date.parse(dueDate))) {
    return res.status(400).json({ error: 'Valid dueDate required' });
  }
  next();
};

export const validateSavingContribution = (req, res, next) => {
  if (isNaN(Number(req.body.amount))) {
    return res.status(400).json({ error: 'amount must be a number' });
  }
  next();
};

export const validateSavingUpdate = (req, res, next) => {
  const { goal, targetAmount, dueDate } = req.body;
  if (goal !== undefined && typeof goal !== 'string') {
    return res.status(400).json({ error: 'Invalid goal' });
  }
  if (targetAmount !== undefined && isNaN(Number(targetAmount))) {
    return res.status(400).json({ error: 'Invalid targetAmount' });
  }
  if (dueDate !== undefined && isNaN(Date.parse(dueDate))) {
    return res.status(400).json({ error: 'Invalid dueDate' });
  }
  next();
};

export const validateGoal = (req, res, next) => {
  const { goalName, targetAmount, deadline } = req.body;
  if (!goalName || typeof goalName !== 'string') {
    return res.status(400).json({ error: 'goalName is required' });
  }
  if (isNaN(Number(targetAmount))) {
    return res.status(400).json({ error: 'targetAmount must be a number' });
  }
  if (deadline && isNaN(Date.parse(deadline))) {
    return res.status(400).json({ error: 'Invalid deadline' });
  }
  next();
};

export const validateInvestment = (req, res, next) => {
  const { amount, assetType, date } = req.body;
  if (isNaN(Number(amount))) {
    return res.status(400).json({ error: 'amount must be a number' });
  }
  if (!assetType || typeof assetType !== 'string') {
    return res.status(400).json({ error: 'assetType is required' });
  }
  if (date !== undefined && isNaN(Date.parse(date))) {
    return res.status(400).json({ error: 'Invalid date' });
  }
  next();
};

export const validateInvestmentUpdate = (req, res, next) => {
  const { amount, assetType, date } = req.body;
  if (amount !== undefined && isNaN(Number(amount))) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  if (assetType !== undefined && typeof assetType !== 'string') {
    return res.status(400).json({ error: 'Invalid assetType' });
  }
  if (date !== undefined && isNaN(Date.parse(date))) {
    return res.status(400).json({ error: 'Invalid date' });
  }
  next();
};
