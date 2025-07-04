import { useState, useEffect } from 'react';
import api from '../services/api';
import { TextInput, NumberInput, DateInput } from '../components/forms';
import { formatDate } from '../utils';

const Goals = () => {
  const [formData, setFormData] = useState({
    goalName: '',
    targetAmount: '',
    deadline: '',
  });
  const [goals, setGoals] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals');
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error.response?.data || error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', formData);
      setFormData({ goalName: '', targetAmount: '', deadline: '' });
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error.response?.data || error.message);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Delete this goal?');
    if (!confirm) return;

    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Set a Financial Goal</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Goal Name"
          name="goalName"
          value={formData.goalName}
          onChange={handleChange}
          required
        />
        <NumberInput
          label="Target Amount"
          name="targetAmount"
          value={formData.targetAmount}
          onChange={handleChange}
          required
        />
        <DateInput
          label="Deadline"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Goal
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Your Goals</h2>
        {goals.length === 0 ? (
          <p className="text-gray-700">No goals yet.</p>
        ) : (
          <ul className="space-y-4">
            {goals.map((goal) => (
              <li key={goal._id} className="border p-4 rounded relative">
                <div className="font-medium text-lg">{goal.goalName}</div>
                <div className="text-gray-600 text-sm">
                  Target: €{goal.targetAmount}
                  {goal.deadline && (
                    <> | Deadline: {formatDate(goal.deadline)}</>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(goal._id)}
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

export default Goals;
