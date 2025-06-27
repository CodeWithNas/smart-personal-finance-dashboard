import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 flex space-x-4">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/budget">Budget</Link>
      </nav>
      <div className="p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budget" element={<Budget />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
