// src/routes.jsx
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Savings from './pages/Savings';
import Investments from './pages/Investments';
import Goals from './pages/Goals';
import Insights from './pages/Insights';
import Login from './pages/Login';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import NotFound from './pages/NotFound';

const routes = [
  {
    path: '/',
    element: <Layout />,
    protected: true,
    children: [
      { path: '', element: <Dashboard /> },           // Root route ("/")
      { path: 'dashboard', element: <Dashboard /> },  // Accessible via "/dashboard"
      { path: 'income', element: <Income /> },
      { path: 'expenses', element: <Expenses /> },
      { path: 'budget', element: <Budget /> },
      { path: 'savings', element: <Savings /> },
      { path: 'investments', element: <Investments /> },
      { path: 'goals', element: <Goals /> },
      { path: 'insights', element: <Insights /> },
      { path: 'transactions', element: <Transactions /> },
    ],
  },
  {
    path: '/login',
    element: <Login />,
    protected: false,
  },
  {
    path: '/register',
    element: <Register />,
    protected: false,
  },
  {
    path: '*',
    element: <NotFound />,
    protected: false,
  },
];

export default routes;
