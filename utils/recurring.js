import Transaction from '../models/Transaction.js';

function addMonths(date, months) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) {
    d.setDate(0);
  }
  return d;
}

export async function generateRecurringTransactions(userId) {
  const now = new Date();
  const recurringTxns = await Transaction.find({
    userId,
    recurring: true,
    frequency: { $in: ['monthly', 'quarterly', 'yearly'] },
  });

  let generated = 0;
  let skipped = 0;
  const inserts = [];
  const updates = [];

  for (const tx of recurringTxns) {
    if (tx.recurringPaused) {
      continue;
    }
    let lastDate = tx.lastGenerated || tx.date;
    const increment =
      tx.frequency === 'monthly' ? 1 : tx.frequency === 'quarterly' ? 3 : 12;
    let nextDate = addMonths(lastDate, increment);

    while (nextDate <= now) {
      const start = new Date(nextDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(nextDate);
      end.setHours(23, 59, 59, 999);

      const exists = await Transaction.exists({
        userId,
        recurring: true,
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        description: tx.description,
        date: { $gte: start, $lte: end },
      });

      if (exists) {
        skipped++;
      } else {
        inserts.push({
          userId,
          type: tx.type,
          vendor: tx.vendor,
          amount: tx.amount,
          category: tx.category,
          date: nextDate,
          recurring: true,
          frequency: tx.frequency,
          description: tx.description,
        });
        generated++;
      }

      lastDate = nextDate;
      nextDate = addMonths(lastDate, increment);
    }

    if (lastDate !== (tx.lastGenerated || tx.date)) {
      updates.push({
        updateOne: { filter: { _id: tx._id }, update: { lastGenerated: lastDate } },
      });
    }
  }

  if (inserts.length) {
    await Transaction.insertMany(inserts);
  }
  if (updates.length) {
    await Transaction.bulkWrite(updates);
  }

  return { generated, skipped };
}
