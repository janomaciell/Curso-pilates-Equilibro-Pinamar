import { useState, useEffect, useRef, useCallback } from 'react';
import { coursesAPI } from '../../api/courses';
import CourseList from '../../courses/CourseList';
import { FiSearch, FiX, FiArrowRight, FiArrowLeft, FiSliders } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './CourseCatalog.css';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    id: 'pilates-mat',
    label: 'Pilates Mat',
    desc: 'El método clásico. Trabajo de suelo puro con conciencia corporal.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=85',
    accent: '#b98967',
  },
  {
    id: 'stretching',
    label: 'Stretching',
    desc: 'Flexibilidad, movilidad articular y liberación de tensión.',
    image: 'https://images.unsplash.com/photo-1510894347713-fc3dc6166086?w=900&q=85',
    accent: '#a07850',
  },
  {
    id: 'power-pilates',
    label: 'Power Pilates',
    desc: 'Intensidad y control. Pilates con mayor carga de trabajo.',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=900&q=85',
    accent: '#8c6544',
  },
  {
    id: 'power-workout',
    label: 'Power Workout',
    desc: 'Entrenamiento funcional de alta intensidad. Sudor y fuerza.',
    image: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=900&q=85',
    accent: '#b98967',
  },
  {
    id: 'hipopresivos',
    label: 'Hipopresivos',
    desc: 'Trabajo postural profundo. Core hipopresivo y suelo pélvico.',
    image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=900&q=85',
    accent: '#a07850',
  },
  {
    id: 'fuerza',
    label: 'Fuerza',
    desc: 'Ganancia muscular con técnica. Progresión controlada y segura.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=85',
    accent: '#8c6544',
  },
];

const LEVELS = [
  { value: '',             label: 'Todos los niveles' },
  { value: 'beginner',     label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced',     label: 'Avanzado' },
];

const SORT_OPTIONS = [
  { value: '',            label: 'Relevancia' },
  { value: 'price_asc',  label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'newest',     label: 'Más nuevos' },
];

/* ─────────────────────────────────────────────────────────────────
   SUB-COMPONENTES
───────────────────────────────────────────────────────────────── */

function EmptyState({ msg, onReset }) {
  return (
    <div className="cc-empty">
      <span className="cc-empty__icon" aria-hidden="true">✦</span>
      <h3 className="cc-empty__title">Sin resultados</h3>
      <p className="cc-empty__msg">{msg}</p>
      <button className="cc-empty__btn" onClick={onReset}>Ver todos</button>
    </div>
  );
}

/* Contador de cursos con dots de carga */
function CourseCount({ loading, count }) {
  if (loading) {
    return (
      <span className="cc-count">
        <span className="cc-dots">
          <span /><span /><span />
        </span>
      </span>
    );
  }
  return (
    <span className="cc-count">
      <strong>{count}</strong> curso{count !== 1 ? 's' : ''}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */

const CourseCatalog = () => {
  /* ── Estado principal ── */
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [courses, setCourses]                   = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [categoryStats, setCategoryStats]       = useState({});

  /* ── Filtros dentro de categoría ── */
  const [level, setLevel]           = useState('');
  const [sort, setSort]             = useState('');
  const [search, setSearch]         = useState('');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [filtersOpen, setFiltersOpen]   = useState(false);

  /* ── Búsqueda global (sin categoría) ── */
  const [globalSearch, setGlobalSearch]   = useState('');
  const [globalResults, setGlobalResults] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [searchMode, setSearchMode]       = useState(false);

  const heroRef     = useRef(null);
  const detailRef   = useRef(null);
  const searchTimer = useRef(null);

  /* ── Animación hero ── */
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.05 });
    tl.fromTo('.cc-hero-eyebrow',
        { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
      .fromTo('.cc-hero-title .cc-word',
        { yPercent: 105, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.07, duration: 0.9, ease: 'expo.out' },
        '-=0.4'
      )
      .fromTo('.cc-hero-sub',
        { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 },
        '-=0.45'
      )
      .fromTo('.cc-cat-item',
        { opacity: 0, y: 32, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.7, ease: 'expo.out' },
        '-=0.3'
      );
    return () => tl.kill();
  }, []);

  /* ── Cargar stats de categorías ── */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await coursesAPI.getCategoryStats();
        setCategoryStats(data || {});
      } catch { /* silencioso */ }
    };
    load();
  }, []);

  /* ── Cargar cursos de categoría ── */
  const loadCourses = useCallback(async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      if (level)        params.difficulty  = level;
      if (onlyFeatured) params.is_featured = true;
      if (search)       params.search      = search;
      if (sort === 'price_asc')  params.ordering = 'price';
      if (sort === 'price_desc') params.ordering = '-price';
      if (sort === 'newest')     params.ordering = '-created_at';
      const data = await coursesAPI.getAllCourses(params);
      setCourses(data.results ?? data);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  }, [selectedCategory, level, sort, search, onlyFeatured]);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  /* ── Búsqueda global con debounce ── */
  useEffect(() => {
    if (!searchMode) return;
    clearTimeout(searchTimer.current);
    if (!globalSearch.trim()) { setGlobalResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setGlobalLoading(true);
      try {
        const data = await coursesAPI.getAllCourses({ search: globalSearch });
        setGlobalResults(data.results ?? data);
      } catch { setGlobalResults([]); }
      finally { setGlobalLoading(false); }
    }, 380);
    return () => clearTimeout(searchTimer.current);
  }, [globalSearch, searchMode]);

  /* ── Seleccionar categoría ── */
  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
    setLevel(''); setSort(''); setSearch(''); setOnlyFeatured(false);
    setSearchMode(false); setGlobalSearch('');
    // Scroll suave al detalle
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    // Animación premium de entrada
    const tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo('.cc-detail', 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.4 }
      )
      .fromTo('.cc-detail-header__info > *', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power4.out' },
        '-=0.2'
      )
      .fromTo('.cc-detail-header__visual',
        { opacity: 0, x: 40, rotate: 8, scale: 0.95 },
        { opacity: 1, x: 0, rotate: 2, scale: 1, duration: 1.2, ease: 'expo.out' },
        '-=0.7'
      )
      .fromTo('.cc-filter-strip',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.8'
      );
  };

  /* ── Volver a categorías ── */
  const handleBack = () => {
    setSelectedCategory(null);
    setLevel(''); setSort(''); setSearch(''); setOnlyFeatured(false);
    heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    gsap.fromTo('.cc-cat-item',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: 'expo.out' }
    );
  };

  /* ── Activar modo búsqueda global ── */
  const handleGlobalSearchMode = () => {
    setSearchMode(true);
    setSelectedCategory(null);
  };

  const cat = selectedCategory === 'all'
    ? {
        id: 'all',
        label: 'Todos los cursos',
        desc: 'Explorá nuestra biblioteca completa de clases de Pilates, Stretching e Hipopresivos.',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=85',
        accent: '#8c6544'
      }
    : CATEGORIES.find(c => c.id === selectedCategory);

  const getStats = (id) => {
    const s = categoryStats[id];
    if (!s) return null;
    return s.total > 0 ? `${s.total} clase${s.total !== 1 ? 's' : ''}` : 'Próximamente';
  };

  return (
    <div className="cc-page">

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="cc-hero" ref={heroRef}>
        <div className="cc-hero-grain" aria-hidden="true" />
        <div className="cc-hero-glow"  aria-hidden="true" />

        <div className="cc-hero-inner">
          <span className="cc-hero-eyebrow">— Equilibrio Pinamar</span>

          <h1 className="cc-hero-title">
            {['Explorá',  <br/>,'nuestros', 'cursos'].map((w, i) => (
              <span className="cc-word-wrap" key={i}>
                <span className={`cc-word${i === 2 ? ' cc-word--accent' : ''}`}>{w} </span>
              </span>
            ))}
          </h1>

          <p className="cc-hero-sub">
            6 categorías · niveles básico, intermedio y avanzado
          </p>

          {/* Acciones del hero */}
          <div className="cc-hero-actions">
            <button
              className="cc-global-search-trigger"
              onClick={handleGlobalSearchMode}
            >
              <FiSearch size={15} />
              Buscar un curso específico...
            </button>

            <button 
              className="cc-all-trigger"
              onClick={() => handleCategorySelect('all')}
            >
              Ver todos los cursos
            </button>
          </div>
        </div>

        <div className="cc-hero-fade" aria-hidden="true" />
      </section>

      {/* ════════════════════════════════════════════
          BÚSQUEDA GLOBAL (overlay)
      ════════════════════════════════════════════ */}
      {searchMode && (
        <div className="cc-search-overlay">
          <div className="cc-search-overlay__inner">
            <div className="cc-search-bar">
              <FiSearch className="cc-search-bar__icon" />
              <input
                autoFocus
                type="text"
                className="cc-search-bar__input"
                placeholder="Buscar cursos..."
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
              />
              <button
                className="cc-search-bar__close"
                onClick={() => { setSearchMode(false); setGlobalSearch(''); setGlobalResults([]); }}
              >
                <FiX size={16} />
              </button>
            </div>

            {globalSearch && (
              <div className="cc-search-results">
                {globalLoading ? (
                  <div className="cc-search-results__loading">
                    <span className="cc-dots"><span /><span /><span /></span>
                    Buscando...
                  </div>
                ) : globalResults.length === 0 ? (
                  <p className="cc-search-results__empty">
                    Sin resultados para "{globalSearch}"
                  </p>
                ) : (
                  <>
                    <p className="cc-search-results__count">
                      {globalResults.length} resultado{globalResults.length !== 1 ? 's' : ''}
                    </p>
                    <CourseList courses={globalResults} loading={false} viewMode="grid" />
                  </>
                )}
              </div>
            )}

            {!globalSearch && (
              <p className="cc-search-results__hint">
                Escribí para buscar en todos los cursos
              </p>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          GRID DE CATEGORÍAS
      ════════════════════════════════════════════ */}
      {!searchMode && (
        <section className="cc-categories-section">
          <div className="cc-container">

            {!selectedCategory && (
              <>
                <div className="cc-section-header">
                  <p className="cc-overline">Elegí tu práctica</p>
                  <h2 className="cc-section-title">
                    ¿Qué querés trabajar hoy?
                  </h2>
                </div>

                <div className="cc-cat-grid">
                  {CATEGORIES.map((c, i) => {
                    const stats = getStats(c.id);
                    return (
                      <button
                        key={c.id}
                        className="cc-cat-item"
                        onClick={() => handleCategorySelect(c.id)}
                        style={{ '--cat-accent': c.accent, animationDelay: `${i * 0.04}s` }}
                      >
                        <div
                          className="cc-cat-item__img"
                          style={{ backgroundImage: `url(${c.image})` }}
                        />
                        <div className="cc-cat-item__fog" />
                        <div className="cc-cat-item__body">
                          <div className="cc-cat-item__top">
                            {stats && (
                              <span className="cc-cat-item__count">{stats}</span>
                            )}
                          </div>
                          <div className="cc-cat-item__bottom">
                            <h3 className="cc-cat-item__title">{c.label}</h3>
                            <p className="cc-cat-item__desc">{c.desc}</p>
                            <span className="cc-cat-item__cta">
                              Ver clases <FiArrowRight size={13} />
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="cc-section-footer">
                  <button 
                    className="cc-btn-outline"
                    onClick={() => handleCategorySelect('all')}
                  >
                    Ver todos los cursos <FiArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {/* ════════════════════════════════════════
                DETALLE DE CATEGORÍA
            ════════════════════════════════════════ */}
            {selectedCategory && cat && (
              <div className="cc-detail" ref={detailRef}>

                {/* Editorial Header */}
                <header className="cc-detail-header">
                  <div className="cc-detail-header__info">
                    <button className="cc-back-btn-minimal" onClick={handleBack}>
                      <FiArrowLeft size={16} /> Volver a categorías
                    </button>
                    <div className="cc-detail-header__content">
                      <span className="cc-detail-header__eyebrow">
                        Equilibrio Pinamar — {cat.id === 'all' ? 'Biblioteca' : 'Categoría'}
                      </span>
                      <h2 className="cc-detail-header__title">{cat.label}</h2>
                      <p className="cc-detail-header__desc">{cat.desc}</p>
                    </div>
                  </div>
                  <div className="cc-detail-header__visual">
                    <div className="cc-detail-header__image-frame">
                      <img src={cat.image} alt={cat.label} className="cc-detail-header__img" />
                      <div className="cc-detail-header__badge">✦ {cat.label}</div>
                    </div>
                  </div>
                </header>

                {/* ── Barra de filtros ── */}
                <div className="cc-filter-strip">

                  {/* Niveles como chips */}
                  <div className="cc-filter-strip__levels">
                    {LEVELS.map(l => (
                      <button
                        key={l.value}
                        className={`cc-chip ${level === l.value ? 'cc-chip--active' : ''}`}
                        onClick={() => setLevel(l.value)}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>

                  {/* Separador */}
                  <div className="cc-filter-strip__sep" aria-hidden="true" />

                  {/* Filtros extra: toggle */}
                  <div className="cc-filter-strip__extras">
                    <button
                      className={`cc-chip cc-chip--icon ${onlyFeatured ? 'cc-chip--active' : ''}`}
                      onClick={() => setOnlyFeatured(v => !v)}
                    >
                      ✦ Destacados
                    </button>

                    {/* Sort select */}
                    <div className="cc-sort-wrap">
                      <select
                        className="cc-sort-select"
                        value={sort}
                        onChange={e => setSort(e.target.value)}
                        aria-label="Ordenar por"
                      >
                        {SORT_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Búsqueda dentro de categoría */}
                    <div className="cc-cat-search">
                      <FiSearch size={13} className="cc-cat-search__icon" />
                      <input
                        type="text"
                        className="cc-cat-search__input"
                        placeholder="Buscar en esta categoría..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                      {search && (
                        <button className="cc-cat-search__clear" onClick={() => setSearch('')}>
                          <FiX size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contador */}
                  <CourseCount loading={loading} count={courses.length} />
                </div>

                {/* ── Cursos ── */}
                <div className="cc-courses-wrap">
                  {!loading && courses.length === 0 ? (
                    <EmptyState
                      msg={
                        level || search || onlyFeatured
                          ? 'Probá ajustando los filtros'
                          : 'Esta categoría no tiene cursos todavía'
                      }
                      onReset={() => {
                        setLevel(''); setSearch(''); setOnlyFeatured(false); setSort('');
                      }}
                    />
                  ) : (
                    <CourseList courses={courses} loading={loading} viewMode="grid" />
                  )}
                </div>

                {/* Navegar entre categorías */}
                <div className="cc-cat-nav">
                  <p className="cc-cat-nav__label">Otras categorías</p>
                  <div className="cc-cat-nav__pills">
                    {CATEGORIES.filter(c => c.id !== selectedCategory).map(c => (
                      <button
                        key={c.id}
                        className="cc-cat-nav__pill"
                        onClick={() => handleCategorySelect(c.id)}
                      >
                        {c.label} <FiArrowRight size={11} />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        </section>
      )}

    </div>
  );
};

export default CourseCatalog;