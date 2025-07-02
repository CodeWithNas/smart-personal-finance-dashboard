// src/components/Sidebar.jsx
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-56 bg-gray-100 p-4">
      <h2 className="mb-2 font-semibold">SPFD</h2>
      <nav className="flex flex-col gap-2">
        <Link to="/">Dashboard</Link>
        <Link to="/income">Income</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/budget">Budget</Link>
        <Link to="/savings">Savings</Link>
        <Link to="/investments">Investments</Link>
        <Link to="/goals">Goals</Link>
        <Link to="/insights">Insights</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
