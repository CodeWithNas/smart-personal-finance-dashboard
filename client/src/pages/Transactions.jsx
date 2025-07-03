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
import { incomeCategories, expenseCategories, formatDate } from '../utils';

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
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);


  const dynamicCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
      toast.success('Transaction deleted');
    } catch (error) {
      console.error('Error deleting transaction:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
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
        toast.success('Transaction updated');
      } else {
        await api.post('/transactions', payload);
        toast.success('Transaction saved');
      }

      cancelEdit();
      fetchTransactions();
    } catch (err) {
      console.error('Error submitting transaction:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div
      className="max-w-xl mx-auto bg-white p-6 rounded shadow"
      aria-busy={loading}
    >
      <h1 className="text-3xl font-bold mb-6">Track Income &amp; Expenses</h1>

      <h2 className="text-2xl font-bold mb-4">
        {isEditing ? 'Edit Transaction' : 'Add Transaction'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="transactionType" className="block mb-1 font-medium">Type</label>
          <select
            id="transactionType"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

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
          options={dynamicCategories}
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
          placeholder="e.g. Netflix, Aldi"
        />

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
            <label htmlFor="txnFilterMonth" className="block text-sm font-medium mb-1">Filter by Month</label>
            <input
              id="txnFilterMonth"
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="txnFilterCategory" className="block text-sm font-medium mb-1">Filter by Category</label>
            <select
              id="txnFilterCategory"
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

          <div>
            <label htmlFor="txnFilterType" className="block text-sm font-medium mb-1">Filter by Type</label>
            <select
              id="txnFilterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : transactions.length === 0 ? (
          <p className="text-gray-700">No transactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {transactions
              .filter((txn) => {
                const txnMonth = txn.date?.slice(0, 7);
                return (
                  (filterMonth === '' || txnMonth === filterMonth) &&
                  (filterCategory === '' || txn.category === filterCategory) &&
                  (filterType === '' || txn.type === filterType)
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
                    {formatDate(txn.date)} - {txn.description}
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
