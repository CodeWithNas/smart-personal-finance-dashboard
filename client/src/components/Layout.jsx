// src/components/Layout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-gray-100 p-4 flex flex-col gap-3 w-56 md:relative md:translate-x-0 md:flex ${sidebarOpen ? 'flex fixed inset-y-0 left-0 z-20' : 'hidden'}`}
      >
        <h2 className="mb-2 font-semibold">SPFD</h2>
        <Link to="/">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/income">Income</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/budget">Budget</Link>
        <Link to="/savings">Savings</Link>
        <Link to="/investments">Investments</Link>
        <Link to="/goals">Goals</Link>
        <Link to="/insights">Insights</Link>
      </aside>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <Navbar toggleSidebar={() => setSidebarOpen((o) => !o)} />
        <main className="p-6 overflow-y-auto flex-1">
          <Outlet />
          <Link
            to="/transactions"
            className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-blue-700"
            aria-label="Add transaction"
          >
            +
          </Link>
        </main>
      </div>
    </div>
  );
};

export default Layout;
