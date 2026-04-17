import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { paymentsAPI } from '../../api/payments';
import { clasesAPI } from '../../api/clases';
import VideoPlayer from '../../clases/VideoPlayer';
import Loader from '../../components/common/Loader';
import NgrokImage from '../../components/common/NgrokImage';
import { 
  FiPlay, 
  FiClock, 
  FiBook, 
  FiCheckCircle,
  FiFilter,
  FiGrid,
  FiList,
  FiTrendingUp,
  FiAward,
  FiTarget,
  FiAlertCircle
} from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../public/ClaseCatalog.css';
import './MyClases.css';

gsap.registerPlugin(ScrollTrigger);

const MyClases = () => {
  const [clases, setClases] = useState([]);
  const [filteredClases, setFilteredClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, in-progress, completed
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('recent'); // recent, progress, title
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerClase, setPlayerClase] = useState(null);
  const [playerLesson, setPlayerLesson] = useState(null);
  
  const statsRef = useRef([]);
  const cardsRef = useRef([]);

  useEffect(() => {
    loadMyClases();
  }, []);

  // Animación del hero (mismo estilo que /clases)
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.05 });
    tl.fromTo('.my-clases-hero .hero-eyebrow', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
      .fromTo('.my-clases-hero .catalog-hero-title-myclases', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      .fromTo('.my-clases-hero .hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.5');
    return () => tl.kill();
  }, []);

  useEffect(() => {
    // Animaciones de entrada para stats, filtros y cards
    if (!loading && clases.length > 0) {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo('.stats-grid',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
      .fromTo('.controls-bar',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.2'
      )
      .fromTo('.my-clase-card',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' },
        '-=0.1'
      );
    }
  }, [loading, clases]);

  useEffect(() => {
    // Filtrar y ordenar clases
    let filtered = [...clases];

    // Filtro
    if (filter === 'in-progress') {
      filtered = filtered.filter(c => c.progress > 0 && c.progress < 100);
    } else if (filter === 'completed') {
      filtered = filtered.filter(c => c.progress === 100);
    }

    // Ordenar
    if (sortBy === 'progress') {
      filtered.sort((a, b) => b.progress - a.progress);
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.clase.title.localeCompare(b.clase.title));
    } else {
      // recent - por fecha de compra
      filtered.sort((a, b) => new Date(b.purchased_at) - new Date(a.purchased_at));
    }

    setFilteredClases(filtered);

    // Animar cambio
    if (clases.length > 0) {
      gsap.fromTo('.my-clase-card',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [filter, sortBy, clases]);

  const loadMyClases = async () => {
    try {
      const data = await paymentsAPI.getMyClases();
      const list = Array.isArray(data) ? data : (data?.results ?? []);
      setClases(list);
      setFilteredClases(list);
    } catch (error) {
      console.error('Error al cargar clases:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (access) => {
    if (!access.expires_at) return null;
    const diff = new Date(access.expires_at) - new Date();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const calculateStats = () => {
    if (clases.length === 0) return null;

    const totalProgress = clases.reduce((sum, c) => sum + c.progress, 0);
    const avgProgress = Math.round(totalProgress / clases.length);
    const completed = clases.filter(c => c.progress === 100).length;
    const inProgress = clases.filter(c => c.progress > 0 && c.progress < 100).length;

    return {
      total: clases.length,
      avgProgress,
      completed,
      inProgress
    };
  };

  const findFirstIncompleteLesson = (modules, progressMap) => {
    for (const module of modules) {
      if (!module.lessons) continue;
      for (const lesson of module.lessons) {
        if (!progressMap[lesson.id]?.completed) return lesson;
      }
    }
    return null;
  };

  const openInlinePlayer = async (access) => {
    try {
      setPlayerOpen(true);
      setPlayerLoading(true);
      setPlayerClase(access.clase);
      setPlayerLesson(null);

      const [modulesData, progressData] = await Promise.all([
        clasesAPI.getClaseModules(access.clase.id),
        clasesAPI.getLessonProgress(access.clase.id)
      ]);

      const modulesList = Array.isArray(modulesData) ? modulesData : [];
      const progressList = Array.isArray(progressData) ? progressData : (progressData?.results ?? []);
      const progressMap = {};
      progressList.forEach((p) => { progressMap[p.lesson] = p; });

      const firstIncomplete = findFirstIncompleteLesson(modulesList, progressMap);
      setPlayerLesson(firstIncomplete || modulesList[0]?.lessons?.[0] || null);
    } catch (error) {
      console.error('Error al cargar lección para reproducir:', error);
      setPlayerLesson(null);
    } finally {
      setPlayerLoading(false);
    }
  };

  const closeInlinePlayer = () => {
    setPlayerOpen(false);
    setPlayerLesson(null);
    setPlayerClase(null);
  };

  const handleInlineProgress = async (progressPercentage) => {
    if (!playerLesson) return;
    const isCompleted = progressPercentage >= 90;

    try {
      await clasesAPI.updateLessonProgress({
        lesson: playerLesson.id,
        progress_percentage: progressPercentage,
        completed: isCompleted
      });

      if (isCompleted) {
        loadMyClases();
      }
    } catch (error) {
      console.error('Error al actualizar progreso desde Mis Clases:', error);
    }
  };

  const stats = calculateStats();

  return (
    <div className="my-clases-page">
      {/* Hero con mismo estilo que /clases */}
      <section className="catalog-hero my-clases-hero">
        <div className="hero-gradient" />
        <div className="hero-grain" />
        <div className="hero-inner">
          <span className="hero-eyebrow">— Equilibrio Pinamar</span>
          <h1 className="catalog-hero-title-myclases">
            Mis Clases<br />
            <em>Tu espacio personal de aprendizaje y crecimiento</em>
          </h1>
          <p className="hero-sub">
            Tus clases comprados, listos para continuar cuando quieras.
          </p>
        </div>
        <div className="hero-fade-bottom" />
      </section>

      <div className="my-clases-container">
        {loading ? (
          <Loader fullScreen={false} />
        ) : clases.length > 0 ? (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card" ref={el => statsRef.current[0] = el}>
                <div className="stat-icon total">
                  <FiBook />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Clases Activos</div>
                </div>
              </div>

              <div className="stat-card" ref={el => statsRef.current[1] = el}>
                <div className="stat-icon progress">
                  <FiTrendingUp />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.avgProgress}%</div>
                  <div className="stat-label">Progreso Promedio</div>
                </div>
              </div>

              <div className="stat-card" ref={el => statsRef.current[2] = el}>
                <div className="stat-icon in-progress">
                  <FiTarget />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.inProgress}</div>
                  <div className="stat-label">En Progreso</div>
                </div>
              </div>

              <div className="stat-card" ref={el => statsRef.current[3] = el}>
                <div className="stat-icon completed">
                  <FiAward />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.completed}</div>
                  <div className="stat-label">Completados</div>
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="controls-bar">
              <div className="filters">
                <button
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  Todos
                </button>
                <button
                  className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
                  onClick={() => setFilter('in-progress')}
                >
                  <FiTrendingUp />
                  En Progreso
                </button>
                <button
                  className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilter('completed')}
                >
                  <FiCheckCircle />
                  Completados
                </button>
              </div>

              <div className="controls">
                <div className="sort-select">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="recent">Más Recientes</option>
                    <option value="progress">Mayor Progreso</option>
                    <option value="title">Por Nombre</option>
                  </select>
                </div>

                <div className="view-toggle">
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Vista de cuadrícula"
                  >
                    <FiGrid />
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="Vista de lista"
                  >
                    <FiList />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="results-count">
              Mostrando <strong>{filteredClases.length}</strong> de <strong>{clases.length}</strong> clases
            </div>

            {/* Clases Grid/List */}
            <div className={`my-clases-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
              {filteredClases.map((access, index) => (
                <div 
                  key={access.id} 
                  className="my-clase-card" 
                  ref={el => cardsRef.current[index] = el}
                >
                  <Link to={`/clase/${access.clase.id}/player`} className="clase-image-wrapper">
                    <NgrokImage 
                      src={access.clase.cover_image}
                      alt={access.clase.title}
                    />
                    <div className="clase-overlay">
                      <div className="play-button">
                        <FiPlay />
                      </div>
                    </div>
                    {access.progress === 100 && (
                      <div className="completed-badge">
                        <FiCheckCircle />
                        <span>Completado</span>
                      </div>
                    )}
                    {access.progress === 0 && (
                      <div className="new-badge">
                        Nuevo
                      </div>
                    )}
                  </Link>

                  <div className="clase-info">
                    <Link to={`/clase/${access.clase.id}/player`}>
                      <h3 className="clase-title">{access.clase.title}</h3>
                    </Link>
                    
                    <p className="clase-short-desc">{access.clase.short_description}</p>

                    <div className="clase-meta">
                      <span className="meta-item">
                        <FiClock /> {access.clase.duration_hours}h
                      </span>
                      <span className="meta-item">
                        <FiBook /> {access.clase.total_lessons} lecciones
                      </span>
                    </div>

                    <div className="progress-section">
                      <div className="progress-header">
                        <span className="progress-label">Tu progreso</span>
                        <span className="progress-percentage">{access.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${access.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="clase-footer">
                      <span className="purchase-date">
                        <FiClock />
                        Comprado {formatDate(access.purchased_at)}
                      </span>

                      {/* Expiración sutil */}
                      {access.expires_at && (() => {
                        const days = getDaysRemaining(access);
                        const expiring = days !== null && days <= 7;
                        return (
                          <span className={`access-expiry ${expiring ? 'access-expiry--warning' : ''}`}>
                            {expiring
                              ? <><FiAlertCircle size={11} /> {days === 0 ? 'Vence hoy' : `Vence en ${days}d`}</>
                              : <><FiClock size={11} /> Acceso hasta {formatDate(access.expires_at)}</>
                            }
                          </span>
                        );
                      })()}

                      <button
                        type="button"
                        className="continue-btn"
                        onClick={() => openInlinePlayer(access)}
                      >
                        {access.progress === 0 ? (
                          <>
                            <FiPlay />
                            Empezar Clase
                          </>
                        ) : access.progress === 100 ? (
                          <>
                            <FiCheckCircle />
                            Ver de Nuevo
                          </>
                        ) : (
                          <>
                            <FiPlay />
                            Continuar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-clases">
            <div className="empty-illustration">
              <div className="empty-icon">
                <FiBook />
              </div>
              <div className="empty-circle circle-1"></div>
              <div className="empty-circle circle-2"></div>
              <div className="empty-circle circle-3"></div>
            </div>
            <h2 className="empty-title">Aún no tienes clases</h2>
            <p className="empty-text">
              Explora nuestro catálogo y comienza tu camino en el Pilates hoy mismo.<br />
              Más de 500 alumnas ya están practicando.
            </p>
            <Link to="/clases" className="browse-button">
              <FiBook />
              Explorar Clases
            </Link>
          </div>
        )}
      </div>
      {playerOpen && (
        <div className="myclases-player-overlay">
          <div
            className="myclases-player-backdrop"
            onClick={closeInlinePlayer}
          ></div>
          <div className="myclases-player-modal">
            <button
              type="button"
              className="myclases-player-close"
              onClick={closeInlinePlayer}
              aria-label="Cerrar reproductor"
            >
              ×
            </button>
            {playerClase && (
              <div className="myclases-player-header">
                <h2>{playerClase.title}</h2>
                {playerLesson && (
                  <p>{playerLesson.title}</p>
                )}
              </div>
            )}
            <div className="myclases-player-body">
              {playerLoading || !playerLesson ? (
                <div className="myclases-player-loading">
                  <Loader />
                  <p>Cargando lección...</p>
                </div>
              ) : (
                <VideoPlayer
                  lessonId={playerLesson.id}
                  onProgress={handleInlineProgress}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClases;