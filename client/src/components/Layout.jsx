// src/components/Layout.jsx
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import './Layout.css'; // Optional for styling

const Layout = () => {
  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '220px',
          background: '#f4f4f4',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <h2>SPFD</h2>
        <Link to="/">Dashboard</Link>
        <Link to="/income">Income</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/budget">Budget</Link>
        <Link to="/savings">Savings</Link>
        <Link to="/investments">Investments</Link>
        <Link to="/goals">Goals</Link>
        <Link to="/insights">Insights</Link>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
