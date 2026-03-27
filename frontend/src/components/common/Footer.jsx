import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Equilibrio Pinamar</h3>
          <p>Centro de pilates y medicina estética en Pinamar, fundado por Nadia D'Angelo.</p>
        </div>

        <div className="footer-section">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li><a href="/cursos">Cursos</a></li>
            <li><a href="/nosotros">Nosotros</a></li>
            <li><a href="/contacto">Contacto</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contacto</h4>
          <ul className="contact-list">
            <li><FiMapPin /> Bunge N° 1473, Aguamarina, Pinamar</li>
            <li><FiMail /> fb.com/EquilibrioPinamar</li>
            <li><FiPhone /> Instagram: @equilibriopinamar</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Equilibrio Pinamar. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;