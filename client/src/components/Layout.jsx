// src/components/Layout.jsx
import { Outlet, Link } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-gray-100 p-4 flex flex-col gap-3 w-56 md:relative md:translate-x-0 md:flex ${sidebarOpen ? 'flex fixed inset-y-0 left-0 z-20' : 'hidden'}`}
      >
        <h2 className="mb-2 font-semibold">SPFD</h2>
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
      <div className="flex flex-col flex-1">
        <Navbar toggleSidebar={() => setSidebarOpen((o) => !o)} />
        <main className="p-6 overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
