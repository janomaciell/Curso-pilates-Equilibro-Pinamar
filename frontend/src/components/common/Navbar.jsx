import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  const isHome = location.pathname === '/';
  const navbarMode = isHome ? (isScrolled ? 'navbar--scrolled' : 'navbar--transparent') : 'navbar--scrolled';

  return (
    <nav className={`navbar ${navbarMode}`}>
      {menuOpen && (
        <button
          type="button"
          className="navbar-backdrop"
          aria-label="Cerrar menú"
          onClick={closeMenu}
        />
      )}
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src="/img/logo.png" alt="Equilibrio Pinamar" className="navbar-logo-img" />
        </Link>

        <button
          type="button"
          className="navbar-toggle"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <ul className={`navbar-menu ${menuOpen ? 'navbar-menu--open' : ''}`}>
          <li><Link to="/" onClick={closeMenu}>Inicio</Link></li>
          <li><Link to="/cursos" onClick={closeMenu}>Cursos</Link></li>
          
          {isAuthenticated ? (
            <>
              <li><Link to="/mis-cursos" onClick={closeMenu}>Mis Cursos</Link></li>
              <li className="navbar-dropdown">
                <button className="dropdown-toggle" type="button">
                  <FiUser />
                  <span>{user?.first_name || 'Usuario'}</span>
                </button>
                <ul className="dropdown-menu">
                  <li><Link to="/perfil" onClick={closeMenu}>Mi Perfil</Link></li>
                  <li><Link to="/historial" onClick={closeMenu}>Historial de Compras</Link></li>
                  <li>
                    <button type="button" onClick={handleLogout} className="logout-btn">
                      <FiLogOut /> Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="btn-login" onClick={closeMenu}>Iniciar Sesión</Link></li>
              <li><Link to="/register" className="btn-register" onClick={closeMenu}>Registrarse</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;