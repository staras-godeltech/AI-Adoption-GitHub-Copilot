import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'text-indigo-600 font-semibold'
      : 'text-gray-600 hover:text-indigo-600 transition-colors';

  return (
    <nav className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <NavLink to="/" className="text-2xl font-bold text-indigo-600">
          Cosmetology Booking
        </NavLink>

        {/* Hamburger button for mobile */}
        <button
          className="md:hidden p-2 rounded text-gray-600 hover:text-indigo-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/services" className={linkClass}>Services</NavLink>

          {!user && (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink to="/register" className={linkClass}>Register</NavLink>
            </>
          )}

          {user?.role === 'Customer' && (
            <>
              <NavLink to="/customer/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/customer/book-appointment" className={linkClass}>Book Appointment</NavLink>
              <NavLink to="/customer/appointments" className={linkClass}>My Appointments</NavLink>
            </>
          )}

          {(user?.role === 'Admin' || user?.role === 'Cosmetologist') && (
            <>
              <NavLink to="/admin/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/admin/appointments" className={linkClass}>Manage Appointments</NavLink>
              <NavLink to="/admin/services" className={linkClass}>Manage Services</NavLink>
            </>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 pb-2 border-t pt-4">
          <NavLink to="/" className={linkClass} end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/services" className={linkClass} onClick={() => setMenuOpen(false)}>Services</NavLink>

          {!user && (
            <>
              <NavLink to="/login" className={linkClass} onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink to="/register" className={linkClass} onClick={() => setMenuOpen(false)}>Register</NavLink>
            </>
          )}

          {user?.role === 'Customer' && (
            <>
              <NavLink to="/customer/dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to="/customer/book-appointment" className={linkClass} onClick={() => setMenuOpen(false)}>Book Appointment</NavLink>
              <NavLink to="/customer/appointments" className={linkClass} onClick={() => setMenuOpen(false)}>My Appointments</NavLink>
            </>
          )}

          {(user?.role === 'Admin' || user?.role === 'Cosmetologist') && (
            <>
              <NavLink to="/admin/dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to="/admin/appointments" className={linkClass} onClick={() => setMenuOpen(false)}>Manage Appointments</NavLink>
              <NavLink to="/admin/services" className={linkClass} onClick={() => setMenuOpen(false)}>Manage Services</NavLink>
            </>
          )}

          {user && (
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="text-left text-gray-600 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavMenu;
