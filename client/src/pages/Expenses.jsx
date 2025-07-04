import { useState, useEffect } from 'react';
import api from '../services/api';
import { CategorySelect } from '../components/forms';
import { toast } from 'react-hot-toast';
import { Spinner } from '../components/loading';
import { expenseCategories, formatDate } from '../utils';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions');
      const filtered = res.data.filter(
        (txn) => txn.type.toLowerCase() === 'expense'
      );
      setExpenses(filtered);
    } catch (err) {
      console.error('Failed to load expenses:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || err.message);
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
    <div
      className="max-w-2xl mx-auto bg-white p-6 rounded shadow"
      aria-busy={loading}
    >
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label htmlFor="expensesFilterMonth" className="block text-sm font-medium mb-1">Filter by Month</label>
          <input
            id="expensesFilterMonth"
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <CategorySelect
          label="Filter by Category"
          name="filterCategory"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          options={expenseCategories}
          placeholder="All"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : filteredExpenses.length === 0 ? (
        <p className="text-gray-700">No expenses recorded.</p>
      ) : (
        <ul className="space-y-3">
          {filteredExpenses.map((exp) => (
            <li key={exp._id} className="border rounded p-4 shadow-sm">
              <div className="flex justify-between">
                <span className="font-medium">{exp.category}</span>
                <span className="text-red-600 font-semibold">-€{exp.amount}</span>
              </div>
              <div className="text-sm text-gray-600">
                {formatDate(exp.date)} – {exp.description}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Expenses;
