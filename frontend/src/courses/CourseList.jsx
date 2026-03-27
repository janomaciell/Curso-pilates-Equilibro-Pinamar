import CourseCard from './CourseCard';
import Loader from '../components/common/Loader';
import './CourseList.css';

/**
 * CourseList — componente liviano.
 * El manejo de estado vacío (EmptyState) y loading
 * queda en CourseCatalog para evitar mensajes duplicados.
 * Este componente solo renderiza el grid cuando hay cursos.
 */
const CourseList = ({ courses, loading, viewMode = 'grid' }) => {
  const list = Array.isArray(courses) ? courses : [];

  if (loading) {
    return (
      <div className="courses-loading">
        <Loader size="large" />
        <p>Cargando cursos...</p>
      </div>
    );
  }

  if (list.length === 0) return null;

  return (
    <div className={viewMode === 'list' ? 'courses-list' : 'courses-grid'}>
      {list.map(course => (
        <CourseCard key={course.id} course={course} viewMode={viewMode} />
      ))}
    </div>
  );
};

export default CourseList;