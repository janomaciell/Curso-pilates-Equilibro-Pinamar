import ClaseCard from './ClaseCard';
import Loader from '../components/common/Loader';
import './ClaseList.css';

/**
 * ClaseList — componente liviano.
 * El manejo de estado vacío (EmptyState) y loading
 * queda en ClaseCatalog para evitar mensajes duplicados.
 * Este componente solo renderiza el grid cuando hay clases.
 */
const ClaseList = ({ clases, loading, viewMode = 'grid' }) => {
  const list = Array.isArray(clases) ? clases : [];

  if (loading) {
    return (
      <div className="clases-loading">
        <Loader size="large" />
        <p>Cargando clases...</p>
      </div>
    );
  }

  if (list.length === 0) return null;

  return (
    <div className={viewMode === 'list' ? 'clases-list' : 'clases-grid'}>
      {list.map(clase => (
        <ClaseCard key={clase.id} clase={clase} viewMode={viewMode} />
      ))}
    </div>
  );
};

export default ClaseList;