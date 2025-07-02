import { useEffect, useState } from 'react';
import api from '../services/api';

const Insights = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    byCategory: {}
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/transactions');
        setTransactions(res.data);
        calculateInsights(res.data);
      } catch (err) {
        console.error('Failed to fetch transactions:', err.response?.data || err.message);
      }
    };

    fetchData();
  }, []);

  const calculateInsights = (data) => {
    let income = 0;
    let expenses = 0;
    const categoryTotals = {};

    data.forEach((txn) => {
      if (txn.type === 'income') {
        income += txn.amount;
      } else {
        expenses += txn.amount;
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + txn.amount;
      }
    });

    setSummary({
      income,
      expenses,
      balance: income - expenses,
      byCategory: categoryTotals
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Financial Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded">
          <p className="text-sm text-gray-600">Total Income</p>
          <p className="text-xl font-bold text-green-700">€{summary.income.toFixed(2)}</p>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-xl font-bold text-red-700">€{summary.expenses.toFixed(2)}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded">
          <p className="text-sm text-gray-600">Net Balance</p>
          <p className="text-xl font-bold text-blue-700">€{summary.balance.toFixed(2)}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Spending by Category</h2>
        {Object.keys(summary.byCategory).length === 0 ? (
          <p className="text-gray-500">No expense data yet.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(summary.byCategory).map(([category, amount]) => (
              <li key={category} className="flex justify-between border-b pb-2">
                <span>{category}</span>
                <span className="text-red-600">€{amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Insights;
