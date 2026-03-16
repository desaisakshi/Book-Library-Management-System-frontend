import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isAuthor, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/'); setOpen(false); };
  const active = (p) => location.pathname === p ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">📚 Library</Link>
        <button className="navbar-toggle" onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
        <div className={`navbar-menu ${open ? 'active' : ''}`}>
          <Link to="/books" className={`navbar-link ${active('/books')}`} onClick={() => setOpen(false)}>Browse Books</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={`navbar-link ${active('/dashboard')}`} onClick={() => setOpen(false)}>Dashboard</Link>
              <Link to="/rentals"   className={`navbar-link ${active('/rentals')}`}   onClick={() => setOpen(false)}>My Rentals</Link>
              <Link to="/wishlist"  className={`navbar-link ${active('/wishlist')}`}  onClick={() => setOpen(false)}>Wishlist</Link>
              {isAdmin  && <Link to="/admin"  className={`navbar-link ${location.pathname.startsWith('/admin')  ? 'active' : ''}`} onClick={() => setOpen(false)}>Admin</Link>}
              {isAuthor && <Link to="/author" className={`navbar-link ${location.pathname.startsWith('/author') ? 'active' : ''}`} onClick={() => setOpen(false)}>Author</Link>}
              <div className="navbar-user">
                <span className="user-name">{user?.first_name || user?.email}</span>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login"    className="btn btn-outline"    onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-secondary"  onClick={() => setOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
