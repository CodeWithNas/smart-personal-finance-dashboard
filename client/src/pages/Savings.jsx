import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Savings = ({ onChange }) => {
  const [savings, setSavings] = useState([]);
  const [formData, setFormData] = useState({
    goal: '',
    targetAmount: '',
    contribution: '',
    dueDate: '',
    editingId: null
  });

  const fetchSavings = async () => {
    try {
      const res = await api.get('/savings');
      setSavings(res.data);
    } catch (err) {
      console.error('Failed to fetch savings:', err.response?.data || err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        goal: formData.goal,
        targetAmount: Number(formData.targetAmount),
        contribution: Number(formData.contribution),
        dueDate: formData.dueDate
      };

      if (formData.editingId) {
        await api.put(`/savings/${formData.editingId}`, {
          goal: payload.goal,
          targetAmount: payload.targetAmount,
          dueDate: payload.dueDate
        });
      } else {
        const existing = savings.find((s) => s.goal.toLowerCase() === formData.goal.toLowerCase());
        if (existing) {
          await api.post(`/savings/${existing._id}/contribute`, { amount: payload.contribution });
        } else {
          await api.post('/savings', payload);
        }
      }

      setFormData({ goal: '', targetAmount: '', contribution: '', dueDate: '', editingId: null });
      await fetchSavings();
      if (onChange) onChange();
    } catch (err) {
      console.error('Failed to save:', err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saving goal?')) return;
    try {
      await api.delete(`/savings/${id}`);
      await fetchSavings();
      if (onChange) onChange();
    } catch (err) {
      console.error('Failed to delete saving:', err.response?.data || err.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      goal: item.goal,
      targetAmount: item.targetAmount,
      contribution: '',
      dueDate: item.dueDate.slice(0, 10),
      editingId: item._id
    });
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  const daysLeft = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#a1e3a1'];
  const pieData = savings.map((s) => ({
    name: s.goal,
    value: s.totalSaved || 0
  }));

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Savings Goals</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">Goal Name</label>
          <input
            type="text"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Target Amount (€)</label>
            <input
              type="number"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Contribution (€)</label>
            <input
              type="number"
              name="contribution"
              value={formData.contribution}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              disabled={formData.editingId !== null}
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {formData.editingId ? 'Update Goal' : 'Save Goal'}
        </button>
      </form>

      {savings.length === 0 ? (
        <p className="text-gray-500">No savings added yet.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-8">
            {savings.map((item) => {
              const isComplete = item.totalSaved >= item.targetAmount;
              return (
                <li key={item._id} className="border p-4 rounded shadow-sm">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold">
                      {item.goal}{' '}
                      {isComplete && <span className="text-green-600 text-sm">(Completed)</span>}
                    </h3>
                    <span className="text-sm text-gray-500">{daysLeft(item.dueDate)} days left</span>
                  </div>

                  <div className="w-full bg-gray-200 h-3 rounded">
                    <div
                      className="bg-green-500 h-3 rounded"
                      style={{ width: `${(item.totalSaved / item.targetAmount) * 100}%` }}
                    ></div>
                  </div>

                  <div className="text-sm text-gray-600 mt-1">
                    €{item.totalSaved} saved of €{item.targetAmount}
                  </div>

                  {item.contributions?.length > 0 && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p className="font-medium mb-1">Contributions:</p>
                      <ul className="list-disc ml-4">
                        {item.contributions
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((c, idx) => (
                            <li key={idx}>
                              €{c.amount} on {new Date(c.date).toLocaleDateString()}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-2 flex gap-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Savings Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Savings;
