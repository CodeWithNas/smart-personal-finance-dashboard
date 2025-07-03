import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { CategorySelect, NumberInput } from '../components/forms';
import { PieChartWidget, LineChartWidget, ChartPlaceholder } from '../components/charts';
import { Spinner } from '../components/loading';
import { incomeCategories, formatDate } from '../utils';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#a1e3a1', '#ffd700'];

const getPreviousMonths = (count, base) => {
  const months = [];
  const d = base ? new Date(base + '-01') : new Date();
  for (let i = count - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1)
      .toISOString()
      .slice(0, 7);
    months.push(m);
  }
  return months;
};

const Income = () => {
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [topSource, setTopSource] = useState('');
  const [prevMonthTotal, setPrevMonthTotal] = useState(0);

  const [filterMonth, setFilterMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [filterCategory, setFilterCategory] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [notes, setNotes] = useState(() => localStorage.getItem('incomeNotes') || '');

  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem('incomeNotes', val);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!filterMonth) {
        const res = await api.get(
          `/transactions?type=income&month=${filterMonth}&category=${filterCategory}&min=${minAmount}&max=${maxAmount}`
        );
        const data = res.data || [];
        console.log('Fetched income data with filters:', data);
        setIncomes(data);

        const months = getPreviousMonths(6);
        const monthly = {};
        months.forEach((m) => {
          monthly[m] = [];
        });
        data.forEach((tx) => {
          const m = tx.date?.slice(0, 7);
          if (!monthly[m]) monthly[m] = [];
          monthly[m].push(tx);
        });

        const prev = getPreviousMonths(2)[0];
        const prevData = monthly[prev] || [];
        setPrevMonthTotal(prevData.reduce((s, t) => s + t.amount, 0));

        setTrendData(
          months.map((m) => ({
            month: m,
            total: (monthly[m] || []).reduce((sum, t) => sum + t.amount, 0),
          }))
        );

        const totals = {};
        data.forEach((tx) => {
          if (tx.category)
            totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
        });
        setTopSource(
          Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
        );
      } else {
        const months = getPreviousMonths(6, filterMonth);
        const responses = await Promise.all(
          months.map((m) =>
            api.get(
              `/transactions?type=income&month=${m}&category=${filterCategory}&min=${minAmount}&max=${maxAmount}`
            )
          )
        );
        console.log('Fetched income data with filters:', responses.map((r) => r.data));
        const monthly = {};
        responses.forEach((res, idx) => {
          monthly[months[idx]] = res.data;
        });
        setIncomes(monthly[filterMonth] || []);
        const prev = getPreviousMonths(2, filterMonth)[0];
        const prevData = monthly[prev] || [];
        setPrevMonthTotal(prevData.reduce((s, t) => s + t.amount, 0));

        setTrendData(
          months.map((m) => ({
            month: m,
            total: (monthly[m] || []).reduce((sum, t) => sum + t.amount, 0),
          }))
        );

        const totals = {};
        Object.values(monthly)
          .flat()
          .forEach((tx) => {
            if (tx.category)
              totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
          });
        setTopSource(
          Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
        );
      }
    } catch (err) {
      console.error('Error loading income data:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterMonth, filterCategory, minAmount, maxAmount]);

  const filtered = incomes.filter((inc) => {
    const cat = !filterCategory || inc.category === filterCategory;
    const min = !minAmount || inc.amount >= parseFloat(minAmount);
    const max = !maxAmount || inc.amount <= parseFloat(maxAmount);
    return cat && min && max;
  });

  const totalIncome = filtered.reduce((sum, t) => sum + t.amount, 0);
  const changePct =
    prevMonthTotal > 0 ? ((totalIncome - prevMonthTotal) / prevMonthTotal) * 100 : null;

  const byCategory = {};
  filtered.forEach((txn) => {
    const cat = txn.category || 'Other';
    byCategory[cat] = (byCategory[cat] || 0) + txn.amount;
  });
  const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  const latestEntries = [...filtered]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto p-4" aria-busy={loading}>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Income Overview &amp; Insights</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-100 p-4 rounded">
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-700">€{totalIncome.toFixed(2)}</p>
              {changePct !== null && (
                <p className={changePct >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {changePct >= 0 ? '+' : ''}
                  {changePct.toFixed(1)}% vs prev month
                </p>
              )}
            </div>
        <div className="bg-blue-100 p-4 rounded">
          <p className="text-sm text-gray-600">Top Source</p>
          <p className="text-lg font-semibold">{topSource || '—'}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm text-gray-600 mb-1">Notes</p>
          <textarea
            value={notes}
            onChange={handleNoteChange}
            className="w-full border p-2 rounded h-24 resize-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Income by Category</h2>
          {pieData.length === 0 ? (
            <ChartPlaceholder height={200} />
          ) : (
            <PieChartWidget data={pieData} colors={COLORS} outerRadius={80} />
          )}
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Monthly Trend</h2>
          {trendData.length === 0 ? (
            <p className="text-gray-700">No data</p>
          ) : (
            <LineChartWidget data={trendData} xKey="month" lineKey="total" color="#8884d8" />
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-3">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="filterMonth" className="block text-sm font-medium mb-1">
              Month
            </label>
            <input
              id="filterMonth"
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <CategorySelect
            label="Category"
            name="filterCategory"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={incomeCategories}
            placeholder="All"
          />
          <NumberInput
            label="Min Amount"
            name="minAmount"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
          <NumberInput
            label="Max Amount"
            name="maxAmount"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>
      </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Recent Entries</h2>
            {incomes.length === 0 || latestEntries.length === 0 ? (
              <p className="text-gray-700">No income data found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 px-1">Date</th>
                      <th className="py-2 px-1">Amount</th>
                      <th className="py-2 px-1">Category</th>
                      <th className="py-2 px-1">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestEntries.map((inc) => (
                      <tr key={inc._id} className="border-t">
                        <td className="py-2 px-1 whitespace-nowrap">{formatDate(inc.date)}</td>
                        <td className="py-2 px-1">€{inc.amount}</td>
                        <td className="py-2 px-1">{inc.category}</td>
                        <td className="py-2 px-1">{inc.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Income;
