import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }>= ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div>
      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="brand">
            <div className="logo" />
            <Link to="/">Sweet Shop</Link>
          </div>
          <div className="spacer" />
          <div className="nav-links">
            <Link to="/">Sweets</Link>
            {user?.roles.includes('ROLE_ADMIN') && <Link to="/admin">Admin</Link>}
            {user ? (
              <>
                <span className="muted">Hi {user.username}</span>
                <button className="btn ghost" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="container page">{children}</main>
      <footer className="footer">
        <div className="container">© {new Date().getFullYear()} Sweet Shop • Crafted with React</div>
      </footer>
    </div>
  );
};
