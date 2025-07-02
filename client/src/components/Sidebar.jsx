// src/components/Sidebar.jsx
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside style={{ width: '220px', background: '#f5f5f5', padding: '1rem' }}>
      <h2>SPFD</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
