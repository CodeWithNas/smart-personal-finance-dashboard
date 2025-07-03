// src/components/Navbar.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <button
        className="md:hidden mr-2"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 5.25h16.5m-16.5 7.5h16.5m-16.5 7.5h16.5"
          />
        </svg>
      </button>
      <div className="flex-1">Welcome to SPFD</div>
      <div>
        <button
          className="bg-gray-600 text-white border-none p-2"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
