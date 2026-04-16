import { Link } from 'react-router-dom';
import { FiClock, FiUsers, FiBook } from 'react-icons/fi';
import Card from '../components/common/Card';
import NgrokImage from '../components/common/NgrokImage';
import './ClaseCard.css';

const ClaseCard = ({ clase }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: '#10b981',
      intermediate: '#f59e0b',
      advanced: '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  };

  const getDifficultyText = (difficulty) => {
    const texts = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado'
    };
    return texts[difficulty] || difficulty;
  };

  return (
    <Card hover className="clase-card">
      <Link to={`/clases/${clase.slug}`} className="clase-card-link">
        <div className="clase-image">
          <NgrokImage 
            src={clase.cover_image}
            alt={clase.title}
          />
          {clase.is_featured && (
            <span className="featured-badge">Destacado</span>
          )}
          <span 
            className="difficulty-badge"
            style={{ background: getDifficultyColor(clase.difficulty) }}
          >
            {getDifficultyText(clase.difficulty)}
          </span>
        </div>

        <div className="clase-content">
          <h3 className="clase-title">{clase.title}</h3>
          <p className="clase-description">{clase.short_description}</p>

          <div className="clase-stats">
            <div className="stat">
              <FiClock />
              <span>{clase.duration_hours}h</span>
            </div>
            <div className="stat">
              <FiBook />
              <span>{clase.total_lessons} lecciones</span>
            </div>
            <div className="stat">
              <FiUsers />
              <span>{clase.total_students} estudiantes</span>
            </div>
          </div>

          <div className="clase-footer">
            <span className="clase-price">{formatPrice(clase.price)}</span>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default ClaseCard;