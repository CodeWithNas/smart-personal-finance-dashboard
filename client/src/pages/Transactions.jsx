import { useState, useEffect } from 'react';
import api from '../services/api';

const Transactions = () => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: '',
    description: '',
  });

  const [transactions, setTransactions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const incomeCategories = ['Salary', 'Freelance', 'Bonus', 'Gift', 'Other'];
  const expenseCategories = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Health', 'Transport', 'Other'];

  const dynamicCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.message);
    }
  };

  const handleEdit = (txn) => {
    setFormData({
      type: txn.type,
      amount: txn.amount,
      category: txn.category,
      date: txn.date.slice(0, 10),
      description: txn.description,
    });
    setIsEditing(true);
    setEditId(txn._id);
  };

  const cancelEdit = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      date: '',
      description: '',
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      type: formData.type.toLowerCase(),
    };

    try {
      if (isEditing) {
        await api.put(`/transactions/${editId}`, payload);
      } else {
        await api.post('/transactions', payload);
      }

      cancelEdit();
      fetchTransactions();
    } catch (err) {
      console.error('Error submitting transaction:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">
        {isEditing ? 'Edit Transaction' : 'Add Transaction'}
      </h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Amount (€)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Category --</option>
            {dynamicCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. Netflix, Aldi"
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isEditing ? 'Update Transaction' : 'Save Transaction'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Recent Transactions</h2>

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
              {[...incomeCategories, ...expenseCategories].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {transactions
              .filter((txn) => {
                const txnMonth = txn.date?.slice(0, 7);
                return (
                  (filterMonth === '' || txnMonth === filterMonth) &&
                  (filterCategory === '' || txn.category === filterCategory)
                );
              })
              .map((txn) => (
                <li key={txn._id} className="border rounded p-4 shadow-sm relative">
                  <div className="flex justify-between">
                    <span className="font-medium">{txn.category} ({txn.type})</span>
                    <span className={txn.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      €{txn.amount}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(txn.date).toLocaleDateString()} - {txn.description}
                  </div>
                  <button
                    onClick={() => handleEdit(txn)}
                    className="absolute top-2 right-16 text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(txn._id)}
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

export default Transactions;
