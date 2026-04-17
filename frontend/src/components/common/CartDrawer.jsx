import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiX, FiTrash2, FiClock, FiArrowRight } from 'react-icons/fi';
import gsap from 'gsap';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { usePayment } from '../../hooks/usePayment';
import NgrokImage from './NgrokImage';
import './CartDrawer.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p);

const CartDrawer = () => {
  const { cartItems, count, total, isOpen, closeCart, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { createCartPayment, loading: paymentLoading } = usePayment();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Animar ítems cuando el drawer abre
  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      gsap.fromTo('.cd-item',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, stagger: 0.06, duration: 0.4, ease: 'expo.out', delay: 0.06 }
      );
    }
  }, [isOpen, cartItems.length]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      closeCart();
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) return;

    const claseIds = cartItems.map(item => item.id);
    const result = await createCartPayment(claseIds, { openInPopup: true });

    if (result.success && result.status === 'approved') {
      clearCart();
      closeCart();
      navigate('/mis-clases');
    } else if (result.error) {
      alert(result.error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="cd-overlay"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={`cd-drawer cd-drawer--open`}
        role="dialog"
        aria-label="Carrito de compras"
        aria-modal="true"
      >
        {/* Header */}
        <div className="cd-drawer__header">
          <div className="cd-drawer__title">
            <FiShoppingBag size={18} />
            Carrito
            {count > 0 && (
              <span className="cd-drawer__count">{count}</span>
            )}
          </div>
          <button
            className="cd-drawer__close"
            onClick={closeCart}
            aria-label="Cerrar carrito"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Contenido */}
        {cartItems.length === 0 ? (
          <div className="cd-drawer__empty">
            <FiShoppingBag size={40} className="cd-drawer__empty-icon" />
            <h3>Tu carrito está vacío</h3>
            <p>Explorá nuestras clases y agregá las que te interesen</p>
            <Link to="/clases" className="cd-drawer__empty-link" onClick={closeCart}>
              Ver clases <FiArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <>
            {/* Lista de ítems */}
            <div className="cd-drawer__items">
              {cartItems.map(item => (
                <div key={item.id} className="cd-item">
                  <NgrokImage
                    src={item.cover_image}
                    alt={item.title}
                    className="cd-item__img"
                  />
                  <div className="cd-item__body">
                    <div className="cd-item__title">{item.title}</div>
                    <div className="cd-item__meta">
                      {item.duration_hours}h · {item.total_lessons} lecciones
                    </div>
                  </div>
                  <span className="cd-item__price">{formatPrice(item.price)}</span>
                  <button
                    className="cd-item__remove"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Quitar ${item.title} del carrito`}
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="cd-drawer__footer">
              <div className="cd-drawer__summary">
                <span className="cd-drawer__label">Total</span>
                <span className="cd-drawer__total">{formatPrice(total)}</span>
              </div>

              {/* Nota discreta de 30 días */}
              <div className="cd-drawer__note">
                <FiClock size={12} />
                <span>Cada clase incluye 30 días de acceso desde la compra</span>
              </div>

              <button
                className="cd-drawer__buy"
                onClick={handleCheckout}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <><span className="cd-drawer__spinner" /> Procesando...</>
                ) : (
                  <>Comprar {count > 1 ? `${count} clases` : 'clase'} <FiArrowRight size={14} /></>
                )}
              </button>

              {count > 1 && (
                <button
                  className="cd-drawer__clear"
                  onClick={clearCart}
                >
                  <FiTrash2 size={12} /> Vaciar carrito
                </button>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
