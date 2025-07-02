import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
  TextInput,
  NumberInput,
  DateInput,
  CategorySelect,
} from '../components/forms';
import { Spinner } from '../components/loading';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    category: '',
    date: '',
    description: '',
  });

  const [filterMonth, setFilterMonth] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const categories = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions');
      const onlyIncomes = res.data.filter((txn) => txn.type === 'income');
      setIncomes(onlyIncomes);
    } catch (err) {
      console.error('Error fetching incomes:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, type: 'income' };

    try {
      await api.post('/transactions', payload);
      setFormData({
        type: 'income',
        amount: '',
        category: '',
        date: '',
        description: '',
      });
      fetchIncomes();
      toast.success('Income saved');
    } catch (err) {
      console.error('Error saving income:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchIncomes();
      toast.success('Income deleted');
    } catch (err) {
      console.error('Error deleting income:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const filtered = incomes.filter((txn) => {
    const txnMonth = txn.date?.slice(0, 7);
    return (
      (filterMonth === '' || txnMonth === filterMonth) &&
      (filterCategory === '' || txn.category === filterCategory)
    );
  });

  useEffect(() => {
    fetchIncomes();
  }, []);

  return (
    <div
      className="max-w-2xl mx-auto bg-white p-6 rounded shadow"
      aria-busy={loading}
    >
      <h1 className="text-2xl font-bold mb-4">Income Tracker</h1>

      {/* Income Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <NumberInput
          label="Amount (€)"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />

        <CategorySelect
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={categories}
          required
        />

        <DateInput
          label="Date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <TextInput
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g. Bonus or payment note"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save Income
        </button>
      </form>

      {/* Filter & Income List */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Recent Income</h2>

        <div className="flex flex-wrap gap-4 mb-4">
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
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No income added yet.</p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((item) => (
              <li key={item._id} className="border p-4 rounded shadow-sm relative">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{item.category}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString()} – {item.description || '—'}
                    </div>
                  </div>
                  <div className="text-green-600 font-semibold">€{item.amount}</div>
                </div>
                <button
                  onClick={() => handleDelete(item._id)}
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

export default Income;
