import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  TextInput,
  NumberInput,
  DateInput,
  CategorySelect,
} from '../components/forms';

const categories = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Health', 'Transport', 'Other'];

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({ category: '', amount: '', month: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/budget');
      setBudgets(res.data);
    } catch (err) {
      console.error('Error loading budgets:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/budget/${editId}`, formData);
      } else {
        await api.post('/budget', formData);
      }
      setFormData({ category: '', amount: '', month: '' });
      setIsEditing(false);
      setEditId(null);
      fetchBudgets();
    } catch (err) {
      console.error('Error saving budget:', err.response?.data || err.message);
    }
  };

  const handleEdit = (b) => {
    setFormData({ category: b.category, amount: b.amount, month: b.month });
    setIsEditing(true);
    setEditId(b._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await api.delete(`/budget/${id}`);
      fetchBudgets();
    } catch (err) {
      console.error('Error deleting budget:', err.response?.data || err.message);
    }
  };

  const filtered = budgets.filter((b) =>
    filterMonth === '' ? true : b.month?.slice(0, 7) === filterMonth
  );

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Monthly Budgets</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <CategorySelect
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={categories}
          required
        />

        <NumberInput
          label="Amount (€)"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />

        <DateInput
          label="Month"
          type="month"
          name="month"
          value={formData.month}
          onChange={handleChange}
          required
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isEditing ? 'Update Budget' : 'Save Budget'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setFormData({ category: '', amount: '', month: '' });
                setIsEditing(false);
                setEditId(null);
              }}
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Budgets</h2>

        <div className="mb-4">
          <DateInput
            label="Filter by Month"
            type="month"
            name="filterMonth"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500">No budget entries found.</p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((b) => (
              <li key={b._id} className="border p-4 rounded shadow-sm relative">
                <div className="flex justify-between">
                  <span className="font-medium">{b.category}</span>
                  <span className="text-blue-600 font-semibold">€{b.amount}</span>
                </div>
                <div className="text-sm text-gray-600">{b.month}</div>
                <button
                  onClick={() => handleEdit(b)}
                  className="absolute top-2 right-16 text-blue-500 hover:text-blue-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b._id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Budget;
