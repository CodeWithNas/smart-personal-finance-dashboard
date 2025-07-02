// src/components/Navbar.jsx
const Navbar = () => {
  return (
    <nav
      style={{
        background: '#333',
        color: '#fff',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <div>Welcome to SPFD</div>
      <div>
        <button style={{ background: '#555', color: '#fff', border: 'none', padding: '0.5rem' }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
