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
import { incomeCategories, expenseCategories } from '../utils';
import TransactionItem from '../components/TransactionItem';

const Transactions = () => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: '',
    description: '',
    recurring: false,
    frequency: 'monthly',
  });

  const [transactions, setTransactions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRecurring, setFilterRecurring] = useState('');
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ income: 0, expenses: 0, net: 0 });
  const [totalsLoading, setTotalsLoading] = useState(false);


  const dynamicCategories =
    formData.type === 'income' ? incomeCategories : expenseCategories;

  const isFormValid =
    formData.type &&
    formData.amount &&
    formData.category &&
    formData.date;

  const filterTransactions = (txns) =>
    txns.filter((txn) => {
      const txnMonth = txn.date?.slice(0, 7);
      const recMatch =
        filterRecurring === '' ||
        (filterRecurring === 'recurring' && txn.recurring) ||
        (filterRecurring === 'one-time' && !txn.recurring);
      return (
        (filterMonth === '' || txnMonth === filterMonth) &&
        (filterCategory === '' || txn.category === filterCategory) &&
        (filterType === '' || txn.type === filterType) &&
        recMatch
      );
    });

  const handleChange = (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
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
      recurring: txn.recurring || false,
      frequency: txn.frequency || 'monthly',
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
      recurring: false,
      frequency: 'monthly',
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

  const clearFilters = () => {
    setFilterMonth('');
    setFilterCategory('');
    setFilterType('');
    setFilterRecurring('');
  };

  const applyRecurringExpenses = async () => {
    try {
      const res = await api.post('/transactions/recurring');
      toast.success(`Applied ${res.data.generated} recurring transactions`);
      fetchTransactions();
    } catch (error) {
      console.error(
        'Error applying recurring transactions:',
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    setTotalsLoading(true);
    const filtered = filterTransactions(transactions);
    let incomeTotal = 0;
    let expenseTotal = 0;
    filtered.forEach((txn) => {
      if (txn.type === 'income') {
        incomeTotal += txn.amount;
      } else {
        expenseTotal += txn.amount;
      }
    });
    setTotals({ income: incomeTotal, expenses: expenseTotal, net: incomeTotal - expenseTotal });
    setTotalsLoading(false);
  }, [transactions, filterMonth, filterCategory, filterType, filterRecurring]);

  const filteredTransactions = filterTransactions(transactions);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8" aria-busy={loading}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Track Income &amp; Expenses</h1>
        <button
          type="button"
          onClick={applyRecurringExpenses}
          className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600"
        >
          Apply Recurring Expenses
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          {isEditing ? 'Edit Transaction' : 'Add Transaction'}
        </h2>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <NumberInput
            label="Amount (€)"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            autoFocus
            required
          />

          <div>
            <label htmlFor="transactionType" className="block mb-1 font-medium">
              Type
            </label>
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
            placeholder="e.g. Rent, Groceries"
          />

          <div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="recurring"
                  checked={formData.recurring}
                  onChange={handleChange}
                />
                Mark as Recurring
              </label>
              {formData.recurring && (
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="border p-2 rounded"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Recurring expenses repeat regularly. Future versions will automate
              this.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
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
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-3">Recent Transactions</h2>

        {totalsLoading ? (
          <Spinner />
        ) : (
          <div className="bg-green-100 p-4 rounded text-lg mb-4">
            💰 Total Income: €{totals.income.toFixed(2)} | 💸 Total Expenses: €{totals.expenses.toFixed(2)} | 🧮 Net: €{totals.net.toFixed(2)}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-4 items-end">
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

          <div>
            <label htmlFor="txnFilterRecurring" className="block text-sm font-medium mb-1">Filter by Recurring</label>
            <select
              id="txnFilterRecurring"
              value={filterRecurring}
              onChange={(e) => setFilterRecurring(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All</option>
              <option value="one-time">One-Time</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : filteredTransactions.length === 0 ? (
          <p className="text-gray-700">No transactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {filteredTransactions.map((txn) => (
              <TransactionItem
                key={txn._id}
                transaction={txn}
                onDelete={handleDelete}
                onUpdate={fetchTransactions}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Transactions;
