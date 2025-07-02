import { useState, useEffect } from 'react';
import api from '../services/api';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    'Food',
    'Rent',
    'Utilities',
    'Entertainment',
    'Health',
    'Transport',
    'Other',
  ];

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/transactions');
      const filtered = res.data.filter(
        (txn) => txn.type.toLowerCase() === 'expense'
      );
      setExpenses(filtered);
    } catch (err) {
      console.error('Failed to load expenses:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter((exp) => {
    const matchesMonth = !filterMonth || exp.date?.slice(0, 7) === filterMonth;
    const matchesCategory = !filterCategory || exp.category === filterCategory;
    return matchesMonth && matchesCategory;
  });

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Filter by Month</label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Filter by Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading expenses...</p>
      ) : filteredExpenses.length === 0 ? (
        <p className="text-gray-500">No expenses recorded.</p>
      ) : (
        <ul className="space-y-3">
          {filteredExpenses.map((exp) => (
            <li key={exp._id} className="border rounded p-4 shadow-sm">
              <div className="flex justify-between">
                <span className="font-medium">{exp.category}</span>
                <span className="text-red-600 font-semibold">-€{exp.amount}</span>
              </div>
              <div className="text-sm text-gray-600">
                {new Date(exp.date).toLocaleDateString()} – {exp.description}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Expenses;
