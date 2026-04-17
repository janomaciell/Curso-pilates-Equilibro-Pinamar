import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import { FiUser, FiLogOut, FiMenu, FiX, FiShoppingBag } from 'react-icons/fi';
import gsap from 'gsap';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { count, openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const prevCountRef = useRef(count);
  const badgeRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animar badge cuando cambia la cantidad
  useEffect(() => {
    if (count > prevCountRef.current && badgeRef.current) {
      gsap.fromTo(badgeRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    }
    prevCountRef.current = count;
  }, [count]);

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

        <ul className={`navbar-menu ${menuOpen ? 'navbar-menu--open' : ''}`}>
          <li><Link to="/" onClick={closeMenu}>Inicio</Link></li>
          <li><Link to="/clases" onClick={closeMenu}>Clases</Link></li>

          {isAuthenticated ? (
            <>
              <li><Link to="/mis-clases" onClick={closeMenu}>Mis Clases</Link></li>
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

        <div className="navbar-right">
          {/* Ícono del carrito */}
          <button
            type="button"
            className="navbar-cart-btn"
            onClick={openCart}
            aria-label={`Carrito (${count} clases)`}
            title="Ver carrito"
          >
            <FiShoppingBag size={18} />
            {count > 0 && (
              <span ref={badgeRef} className="navbar-cart-badge">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>

          <button
            type="button"
            className="navbar-toggle"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;