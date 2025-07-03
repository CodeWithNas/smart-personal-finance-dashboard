import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  BarChartWidget,
  PieChartWidget,
  LineChartWidget,
} from '../components/charts';
import { Spinner } from '../components/loading';
import { formatDate } from '../utils';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#a1e3a1', '#ffd700', '#a1cfff'];

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [txnRes, savingsRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/savings'),
      ]);
      setTransactions(txnRes.data);
      setSavings(savingsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const income = transactions.filter((t) => t.type === 'income');
  const expenses = transactions.filter((t) => t.type === 'expense');

  const incomeTotal = income.reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = expenses.reduce((sum, t) => sum + t.amount, 0);

  // ✅ FIXED: Calculate savingsTotal from contributions
  const savingsTotal = savings.reduce((sum, s) => {
    const total = s.contributions?.reduce((acc, c) => acc + c.amount, 0) || 0;
    return sum + total;
  }, 0);

  const netBalance = incomeTotal - expenseTotal;
  const availableBalance = netBalance - savingsTotal;

  const latestCount = Math.min(Math.max(transactions.length, 5), 10);
  const latestFive = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, latestCount);

  const expenseByCategory = expenses.reduce((acc, txn) => {
    const category = txn.category || 'Other';
    acc[category] = (acc[category] || 0) + txn.amount;
    return acc;
  }, {});

  const savingsByGoal = savings.reduce((acc, item) => {
    const goal = item.goal || 'Other';
    const total = item.contributions?.reduce((acc, c) => acc + c.amount, 0) || 0;
    acc[goal] = (acc[goal] || 0) + total;
    return acc;
  }, {});

  const pieData = Object.entries(expenseByCategory).map(([key, value]) => ({
    name: key,
    value,
  }));

  const savingsPieData = Object.entries(savingsByGoal).map(([key, value]) => ({
    name: key,
    value,
  }));

  const balanceOverTime = transactions
    .filter((txn) => txn.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .reduce((acc, txn) => {
      const date = txn.date.slice(0, 10);
      const prevBalance = acc.length ? acc[acc.length - 1].balance : 0;
      const newBalance = txn.type === 'income' ? prevBalance + txn.amount : prevBalance - txn.amount;
      acc.push({ date, balance: newBalance });
      return acc;
    }, []);

  return (
    <div
      className="max-w-5xl mx-auto bg-white p-6 rounded shadow"
      aria-busy={loading}
    >
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 text-center">
            <div className="p-4 bg-green-100 rounded">
              <p className="text-lg font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-600">€{incomeTotal}</p>
            </div>
            <div className="p-4 bg-red-100 rounded">
              <p className="text-lg font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">€{expenseTotal}</p>
            </div>
            <div className="p-4 bg-yellow-100 rounded">
              <p className="text-lg font-medium">Saved</p>
              <p className="text-2xl font-bold text-yellow-600">€{savingsTotal}</p>
            </div>
            <div className="p-4 bg-blue-100 rounded">
              <p className="text-lg font-medium">Net Balance</p>
              <p className="text-2xl font-bold text-blue-600">€{netBalance}</p>
            </div>
            <div className="p-4 bg-purple-100 rounded">
              <p className="text-lg font-medium">Available Balance</p>
              <p className="text-2xl font-bold text-purple-600">€{availableBalance}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-100 p-4 rounded">
              <h2 className="text-xl font-semibold mb-3">Income vs Expenses</h2>
              <BarChartWidget
                data={[{ name: 'Totals', income: incomeTotal, expenses: expenseTotal }]}
                xKey="name"
                bars={[
                  { dataKey: 'income', fill: '#82ca9d' },
                  { dataKey: 'expenses', fill: '#ff7f7f' },
                ]}
              />
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <h2 className="text-xl font-semibold mb-3">Expenses by Category</h2>
              <PieChartWidget data={pieData} colors={COLORS} outerRadius={80} />
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <h2 className="text-xl font-semibold mb-3">Savings by Goal</h2>
              <PieChartWidget data={savingsPieData} colors={COLORS} outerRadius={80} />
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <h2 className="text-xl font-semibold mb-3">Balance Over Time</h2>
              <LineChartWidget
                data={balanceOverTime}
                xKey="date"
                lineKey="balance"
                color="#8884d8"
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-3">Recent Transactions</h2>
          <ul className="space-y-3">
            {latestFive.map((txn) => (
              <li key={txn._id} className="border p-3 rounded shadow-sm">
                <div className="flex justify-between">
                  <span>{txn.category} - {txn.description}</span>
                  <span className={txn.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {txn.type === 'income' ? '+' : '-'}€{txn.amount}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {formatDate(txn.date)}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Dashboard;
