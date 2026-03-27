import { useState, useEffect, useRef, useCallback } from 'react';
import { coursesAPI } from '../../api/courses';
import CourseList from '../../courses/CourseList';
import CourseFilter from '../../courses/CourseFilter';
import { FiSearch, FiX, FiChevronDown, FiSliders } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './CourseCatalog.css';

gsap.registerPlugin(ScrollTrigger);

// IDs fijos de categorías — el label y la imagen son de presentación.
// El conteo real viene del backend.
const PILATES_CATEGORIES = [
  {
    id: 'pilates-mat',
    label: 'Pilates Mat',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
  },
  {
    id: 'stretching',
    label: 'Stretching',
    image: 'https://images.unsplash.com/photo-1510894347713-fc3dc6166086?w=800&q=80',
  },
  {
    id: 'power-pilates',
    label: 'Power Pilates',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
  },
  {
    id: 'power-workout',
    label: 'Power Workout',
    image: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=800&q=80',
  },
  {
    id: 'hipopresivos',
    label: 'Trabajos hipopresivos',
    image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&q=80',
  },
  {
    id: 'fuerza',
    label: 'Fuerza',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  },
];

const DIFFICULTY_OPTIONS = [
  { value: '',             label: 'Todos los niveles' },
  { value: 'beginner',     label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced',     label: 'Avanzado' },
];

// ─── Empty state reutilizable ────────────────────────────────────────────────
const EmptyState = ({ msg, onReset, resetLabel }) => (
  <div className="empty-state">
    <span className="empty-star">✦</span>
    <h3>Sin resultados</h3>
    <p>{msg}</p>
    <button className="empty-btn" onClick={onReset}>{resetLabel}</button>
  </div>
);

// ─── CourseCatalog ───────────────────────────────────────────────────────────
const CourseCatalog = () => {
  // Tab activo: 'todos' | 'categorias'
  const [activeTab, setActiveTab]               = useState('todos');

  // Cursos cargados
  const [courses, setCourses]                   = useState([]);
  const [loading, setLoading]                   = useState(true);

  // Búsqueda (solo tab "todos")
  const [searchTerm, setSearchTerm]             = useState('');

  // Filtros compartidos entre CourseFilter (todos) y filtro interno de categoría
  const [filters, setFilters]                   = useState({
    difficulty: '',
    min_price: '',
    max_price: '',
    is_featured: false,
  });

  // Categoría seleccionada (tab "categorias")
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filtro de dificultad dentro de la categoría (dropdown compacto)
  const [catDifficulty, setCatDifficulty]       = useState('');
  const [catDiffOpen, setCatDiffOpen]           = useState(false);

  // Conteos reales por categoría: { 'pilates-mat': { total: 12, beginner: 4, ... } }
  const [categoryStats, setCategoryStats]       = useState({});
  const [statsLoading, setStatsLoading]         = useState(true);

  const heroRef = useRef(null);

  // ── Animación de entrada hero ──────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.05 });
    tl.fromTo('.hero-eyebrow', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
      .fromTo('.catalog-hero-title',   { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      .fromTo('.hero-sub',     { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.5')
      .fromTo('.main-tabs-wrap', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.35');
    return () => tl.kill();
  }, []);

  // ── Cargar stats reales de todas las categorías ────────────────────────────
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const data = await coursesAPI.getCategoryStats();
        setCategoryStats(data || {});
      } catch {
        setCategoryStats({});
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  // ── Cargar cursos (tab "todos" o categoria seleccionada) ───────────────────
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};

      // Filtros comunes
      if (filters.difficulty) params.difficulty    = filters.difficulty;
      if (filters.min_price)  params.min_price     = filters.min_price;
      if (filters.max_price)  params.max_price     = filters.max_price;
      if (filters.is_featured) params.is_featured  = true;

      if (activeTab === 'todos') {
        if (searchTerm) params.search = searchTerm;
      } else if (activeTab === 'categorias' && selectedCategory) {
        params.category = selectedCategory;
        // En categoría usamos catDifficulty (filtro propio del tab), no el de CourseFilter
        delete params.difficulty;
        if (catDifficulty) params.difficulty = catDifficulty;
      }

      const data = await coursesAPI.getAllCourses(params);
      setCourses(data.results ?? data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCategory, searchTerm, filters, catDifficulty]);

  useEffect(() => {
    if (activeTab === 'todos' || (activeTab === 'categorias' && selectedCategory)) {
      loadCourses();
    }
  }, [loadCourses]);

  // ── Cambio de tab ──────────────────────────────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedCategory(null);
    setSearchTerm('');
    setCatDifficulty('');
    setFilters({ difficulty: '', min_price: '', max_price: '', is_featured: false });
    gsap.fromTo('.tab-body', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
  };

  // ── Seleccionar categoría ──────────────────────────────────────────────────
  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
    setCatDifficulty('');
    gsap.fromTo('.cat-detail', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' });
  };

  // ── Callback de CourseFilter (tab "todos") ─────────────────────────────────
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const selectedCat = PILATES_CATEGORIES.find(c => c.id === selectedCategory);

  // Helper: texto del subtítulo de categoría
  const getCatSubtitle = (catId) => {
    const stats = categoryStats[catId];
    if (!stats) return statsLoading ? 'cargando...' : '0 clases';
    const parts = [];
    if (stats.total > 0) parts.push(`${stats.total} clase${stats.total !== 1 ? 's' : ''}`);
    if (stats.beginner)    parts.push(`${stats.beginner} básico${stats.beginner !== 1 ? 's' : ''}`);
    if (stats.intermediate) parts.push(`${stats.intermediate} intermedio${stats.intermediate !== 1 ? 's' : ''}`);
    if (stats.advanced)    parts.push(`${stats.advanced} avanzado${stats.advanced !== 1 ? 's' : ''}`);
    return parts.length ? parts.join(' · ') : 'Sin clases aún';
  };

  return (
    <div className="catalog-page">

      {/* ══ HERO ══ */}
      <section className="catalog-hero catalog-hero-explore" ref={heroRef}>
        <div className="hero-gradient" />
        <div className="hero-grain" />
        <div className="hero-inner">
          <span className="hero-eyebrow">— Equilibrio Pinamar</span>
          <h1 className="catalog-hero-title">
            Explorá<br /><em>nuestros cursos</em>
          </h1>
          <p className="hero-sub">
            6 categorías · niveles básico, intermedio y avanzado
          </p>
        </div>
        <div className="hero-fade-bottom" />
      </section>

      {/* ══ TABS ══ */}
      <div className="main-tabs-wrap">
        <div className="page-container">
          <nav className="main-tabs">
            <button
              className={`tab-btn ${activeTab === 'todos' ? 'active' : ''}`}
              onClick={() => handleTabChange('todos')}
            >Todos</button>
            <button
              className={`tab-btn ${activeTab === 'categorias' ? 'active' : ''}`}
              onClick={() => handleTabChange('categorias')}
            >Categorías</button>
          </nav>
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="tab-body">

        {/* ── TAB: TODOS ─────────────────────────────────────────────────── */}
        {activeTab === 'todos' && (
          <div className="page-container todos-layout">

            {/* Fila de filtros horizontal justo debajo de los tabs */}
            <div className="todos-filter-row">
              <CourseFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Main: búsqueda + cursos */}
            <main className="catalog-main">

              {/* Barra de búsqueda + contador */}
              <div className="search-row">
                <div className="fb-search">
                  <FiSearch className="fb-search-icon" />
                  <input
                    type="text"
                    className="fb-search-input"
                    placeholder="Buscar curso..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="fb-clear" onClick={() => setSearchTerm('')}><FiX /></button>
                  )}
                </div>

                <span className="fb-count">
                  {loading
                    ? <span className="fb-dots"><span /><span /><span /></span>
                    : <><strong>{courses.length}</strong> curso{courses.length !== 1 ? 's' : ''}</>
                  }
                </span>
              </div>

              {/* CourseList — maneja el grid internamente */}
              {!loading && courses.length === 0 ? (
                <EmptyState
                  msg={searchTerm ? `Sin resultados para "${searchTerm}"` : 'Probá ajustar los filtros'}
                  onReset={() => {
                    setSearchTerm('');
                    setFilters({ difficulty: '', min_price: '', max_price: '', is_featured: false });
                  }}
                  resetLabel="Ver todos"
                />
              ) : (
                <CourseList courses={courses} loading={loading} viewMode="grid" />
              )}

            </main>
          </div>
        )}

        {/* ── TAB: CATEGORÍAS ────────────────────────────────────────────── */}
        {activeTab === 'categorias' && (
          <div className="page-container">

            {/* Grid de tarjetas de categoría */}
            {!selectedCategory && (
              <div className="cat-grid-wrap">
                <p className="cat-grid-hint">
                  Elegí una categoría para explorar sus clases por nivel
                </p>
                <div className="cat-grid">
                  {PILATES_CATEGORIES.map((cat, i) => (
                    <button
                      key={cat.id}
                      className="cat-card"
                      onClick={() => handleCategorySelect(cat.id)}
                      style={{ animationDelay: `${i * 0.035}s` }}
                    >
                      <div className="cat-card-img" style={{ backgroundImage: `url(${cat.image})` }} />
                      <div className="cat-card-fog" />
                      <span className="cat-card-name">
                        {cat.label}
                        <small className="cat-card-detail">
                          {getCatSubtitle(cat.id)}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Vista de categoría seleccionada */}
            {selectedCategory && selectedCat && (
              <div className="cat-detail">

                {/* Banner */}
                <div className="cat-banner" style={{ backgroundImage: `url(${selectedCat.image})` }}>
                  <div className="cat-banner-overlay" />
                  <div className="cat-banner-content">
                    <button className="cat-back" onClick={() => setSelectedCategory(null)}>
                      ← Categorías
                    </button>
                    <h2 className="cat-banner-title">{selectedCat.label}</h2>
                    {categoryStats[selectedCategory] && (
                      <p className="cat-banner-sub">
                        {getCatSubtitle(selectedCategory)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Filtro de dificultad dentro de la categoría */}
                <div className="cat-filter-bar">
                  <span className="cat-filter-label">Nivel:</span>
                  <div className="cat-diff-tabs">
                    {DIFFICULTY_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        className={`cat-diff-tab ${catDifficulty === opt.value ? 'active' : ''}`}
                        onClick={() => setCatDifficulty(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cursos de la categoría */}
                <div className="courses-section">
                  {!loading && courses.length === 0 ? (
                    <EmptyState
                      msg={catDifficulty
                        ? `Sin cursos de nivel "${DIFFICULTY_OPTIONS.find(o => o.value === catDifficulty)?.label}" en esta categoría`
                        : 'Sin cursos disponibles en esta categoría'}
                      onReset={() => setCatDifficulty('')}
                      resetLabel="Ver todos los niveles"
                    />
                  ) : (
                    <CourseList courses={courses} loading={loading} viewMode="grid" />
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Backdrop para cerrar dropdowns */}
      {catDiffOpen && (
        <div className="global-backdrop" onClick={() => setCatDiffOpen(false)} />
      )}

    </div>
  );
};

export default CourseCatalog;