import { useState } from 'react';
import PropTypes from 'prop-types';
import { NumberInput, CategorySelect, DateInput, TextInput } from './forms';
import { incomeCategories, expenseCategories, formatDate } from '../utils';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const TransactionItem = ({ transaction, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    amount: transaction.amount,
    category: transaction.category,
    date: formatDate(transaction.date),
    description: transaction.description || '',
  });

  // TODO: Inline Edit Logic

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await api.patch(`/transactions/${transaction._id}`, {
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        description: form.description,
      });
      toast.success('Transaction updated');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleTogglePause = async () => {
    try {
      await api.patch(`/transactions/${transaction._id}`, {
        recurringPaused: !transaction.recurringPaused,
      });
      toast.success(
        transaction.recurringPaused ? 'Recurring resumed' : 'Recurring paused'
      );
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Toggle pause error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const categories =
    transaction.type === 'income' ? incomeCategories : expenseCategories;

  const truncated =
    transaction.description && transaction.description.length > 30
      ? `${transaction.description.slice(0, 30)}...`
      : transaction.description;

  const formattedDate = new Date(transaction.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <li className="border rounded-lg p-4 shadow-sm relative">
      {isEditing ? (
        <div className="space-y-2">
          <NumberInput name="amount" value={form.amount} onChange={handleChange} />
          <CategorySelect
            name="category"
            value={form.category}
            onChange={handleChange}
            options={categories}
          />
          <DateInput name="date" value={form.date} onChange={handleChange} />
          <TextInput
            name="description"
            value={form.description}
            onChange={handleChange}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Save
            </button>
            <button
              onClick={() => {
                setForm({
                  amount: transaction.amount,
                  category: transaction.category,
                  date: formatDate(transaction.date),
                  description: transaction.description || '',
                });
                setIsEditing(false);
              }}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between">
            <span className="font-medium">
              {transaction.category} ({transaction.type})
            </span>
            <span
              className={
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }
            >
              €{transaction.amount}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {formattedDate} - <span title={transaction.description}>{truncated}</span>
            {transaction.recurring && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                ♻️ Recurring
              </span>
            )}
            {transaction.recurringPaused && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                ⏸ Paused
              </span>
            )}
          </div>
          {transaction.lastGenerated && (
            <div className="text-xs text-gray-500 mt-1">
              Last generated:{' '}
              {new Date(transaction.lastGenerated).toLocaleDateString()}
            </div>
          )}
          {transaction.recurring && (
            <button
              onClick={handleTogglePause}
              className="absolute top-2 right-32 text-yellow-500 hover:text-yellow-700 text-sm"
            >
              {transaction.recurringPaused ? 'Resume' : 'Pause'}
            </button>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-16 text-blue-500 hover:text-blue-700 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(transaction._id)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </>
      )}
    </li>
  );
};

TransactionItem.propTypes = {
  transaction: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
};

export default TransactionItem;
