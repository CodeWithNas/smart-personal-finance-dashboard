import { useEffect, useState } from 'react';
import api from '../services/api';
import { TextInput, NumberInput, DateInput } from '../components/forms';
import { formatDate } from '../utils';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: '',
    date: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchInvestments = async () => {
    try {
      const res = await api.get('/investments');
      setInvestments(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/investments/${editId}`, formData);
      } else {
        await api.post('/investments', formData);
      }
      fetchInvestments();
      setFormData({ name: '', amount: '', type: '', date: '' });
      setIsEditing(false);
      setEditId(null);
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleEdit = (inv) => {
    setFormData({
      name: inv.name,
      amount: inv.amount,
      type: inv.type,
      date: inv.date.slice(0, 10)
    });
    setIsEditing(true);
    setEditId(inv._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this investment?')) return;
    try {
      await api.delete(`/investments/${id}`);
      fetchInvestments();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit' : 'Add'} Investment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Investment name"
          required
        />
        <NumberInput
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          required
        />
        <TextInput
          name="type"
          value={formData.type}
          onChange={handleChange}
          placeholder="Type (e.g. ETF, Stock)"
          required
        />
        <DateInput
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <div className="flex gap-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {isEditing ? 'Update' : 'Save'}
          </button>
          {isEditing && (
            <button type="button" onClick={() => {
              setFormData({ name: '', amount: '', type: '', date: '' });
              setIsEditing(false);
              setEditId(null);
            }} className="bg-gray-300 text-black px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="text-xl font-semibold mt-8 mb-2">My Investments</h3>
      <ul className="space-y-3">
        {investments.map((inv) => (
          <li key={inv._id} className="border p-3 rounded shadow-sm">
            <div className="flex justify-between">
              <span className="font-medium">{inv.name} ({inv.type})</span>
              <span className="text-green-600 font-semibold">€{inv.amount}</span>
            </div>
            <div className="text-sm text-gray-600">{formatDate(inv.date)}</div>
            <div className="flex gap-2 text-sm mt-2">
              <button onClick={() => handleEdit(inv)} className="text-blue-500">Edit</button>
              <button onClick={() => handleDelete(inv._id)} className="text-red-500">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Investments;
