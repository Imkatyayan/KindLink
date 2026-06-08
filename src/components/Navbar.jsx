import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../constants/areas';
import { APP_NAME } from '../constants/brand';
import ThemeToggle from './ThemeToggle';
import logo from '../assets/logo.svg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navLink = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setMobileOpen(false)}>
          <img src={logo} alt={APP_NAME} className="brand-logo" />
          <span>{APP_NAME}</span>
        </Link>

        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          <NavLink to="/" end className={navLink} onClick={() => setMobileOpen(false)}>Home</NavLink>
          <NavLink to="/posts" className={navLink} onClick={() => setMobileOpen(false)}>Browse SOPs</NavLink>

          {user && user.role !== USER_ROLES.ADMIN && (
            <>
              <NavLink to="/dashboard" className={navLink} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
              <NavLink to="/matches" className={navLink} onClick={() => setMobileOpen(false)}>Matches</NavLink>
              <NavLink to="/messages" className={navLink} onClick={() => setMobileOpen(false)}>Messages</NavLink>
              <NavLink to="/transactions" className={navLink} onClick={() => setMobileOpen(false)}>Transactions</NavLink>
              <NavLink to="/profile" className={navLink} onClick={() => setMobileOpen(false)}>Profile</NavLink>
            </>
          )}

          {user?.role === USER_ROLES.ADMIN && (
            <NavLink to="/admin" className={navLink} onClick={() => setMobileOpen(false)}>Admin Panel</NavLink>
          )}
        </nav>

        <div className={`nav-actions ${mobileOpen ? 'open' : ''}`}>
          <ThemeToggle />
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          ) : (
            <div className="user-menu">
              <span className="user-badge">
                <span className="user-avatar-sm">{user.fullName.charAt(0)}</span>
                {user.fullName.split(' ')[0]}
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
