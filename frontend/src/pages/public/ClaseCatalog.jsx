import { useState, useEffect, useRef, useCallback } from 'react';
import { clasesAPI } from '../../api/clases';
import ClaseList from '../../clases/ClaseList';
import { FiSearch, FiX, FiCheckCircle, FiClock, FiUsers, FiBook } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NgrokImage from '../../components/common/NgrokImage';
import './ClaseCatalog.css';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    id: 'pilates-mat',
    label: 'Pilates Mat',
    desc: 'El método clásico. Trabajo de suelo puro con conciencia corporal.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&q=85',
    accent: '#b98967',
  },
  {
    id: 'stretching',
    label: 'Stretching',
    desc: 'Flexibilidad, movilidad articular y liberación de tensión.',
    image: 'https://images.unsplash.com/photo-1510894347713-fc3dc6166086?w=1600&q=85',
    accent: '#a07850',
  },
  {
    id: 'power-pilates',
    label: 'Power Pilates',
    desc: 'Intensidad y control. Pilates con mayor carga de trabajo.',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1600&q=85',
    accent: '#8c6544',
  },
  {
    id: 'power-workout',
    label: 'Power Workout',
    desc: 'Entrenamiento funcional de alta intensidad. Sudor y fuerza.',
    image: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=1600&q=85',
    accent: '#b98967',
  },
  {
    id: 'hipopresivos',
    label: 'Hipopresivos',
    desc: 'Trabajo postural profundo. Core hipopresivo y suelo pélvico.',
    image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=1600&q=85',
    accent: '#a07850',
  },
  {
    id: 'fuerza',
    label: 'Fuerza',
    desc: 'Ganancia muscular con técnica. Progresión controlada y segura.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=85',
    accent: '#8c6544',
  },
];

const LEVELS = [
  { value: '',             label: 'Nivel: Todos' },
  { value: 'beginner',     label: 'Nivel: Principiante' },
  { value: 'intermediate', label: 'Nivel: Intermedio' },
  { value: 'advanced',     label: 'Nivel: Avanzado' },
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
      <button className="cc-empty__btn" onClick={onReset}>Limpiar filtros</button>
    </div>
  );
}

function SplitWords({ text }) {
  return (
    <span aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span className="cat-hero-word-wrap" key={i}>
          <span className="cat-hero-word">{w}&nbsp;</span>
        </span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */

const ClaseCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [clases, setClases]                   = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [categoryStats, setCategoryStats]       = useState({});

  const [level, setLevel]           = useState('');
  const [sort, setSort]             = useState('');
  const [search, setSearch]         = useState('');
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  const heroRef = useRef(null);

  /* Cargar stats de categorías */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await clasesAPI.getCategoryStats();
        setCategoryStats(data || {});
      } catch { /* silencioso */ }
    };
    load();
  }, []);

  /* Cargar clases */
  const loadClases = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      if (level)        params.difficulty  = level;
      if (onlyFeatured) params.is_featured = true;
      if (search)       params.search      = search;
      if (sort === 'price_asc')  params.ordering = 'price';
      if (sort === 'price_desc') params.ordering = '-price';
      if (sort === 'newest')     params.ordering = '-created_at';
      
      const data = await clasesAPI.getAllClases(params);
      setClases(data.results ?? data);
    } catch { 
      setClases([]); 
    } finally { 
      setLoading(false); 
    }
  }, [selectedCategory, level, sort, search, onlyFeatured]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadClases();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadClases]);

  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
    if(id !== 'all') {
      setTimeout(() => {
        // Animaciones cinemáticas al entrar en categoría
        gsap.fromTo('.cat-hero-word',
          { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.95, ease: 'expo.out' }
        );
        gsap.fromTo('.cat-hero-desc', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.75, ease: 'expo.out' });
        gsap.fromTo('.cat-hero-meta-item', { opacity: 0, x: -12 }, { opacity: 1, x: 0, stagger: 0.06, duration: 0.5 });
      }, 50);
    }
  };

  const catData = selectedCategory !== 'all' ? CATEGORIES.find(c => c.id === selectedCategory) : null;
  const currentTotal = selectedCategory !== 'all' && categoryStats[selectedCategory] 
    ? categoryStats[selectedCategory].total 
    : Object.values(categoryStats).reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="cc-page">
      
      {/* ── ACTION BAR (Slim Header) ── */}
      <div className="cab-action-bar">
        <div className="cab-container">
          
          {/* Top row: Title & Categories */}
          <div className="cab-top-row">
            <h1 className="cab-title">Clases</h1>
            <div className="cab-categories">
              <button 
                onClick={() => handleCategorySelect('all')}
                className={`cab-chip ${selectedCategory === 'all' ? 'active' : ''}`}
              >
                Todas
              </button>
              {CATEGORIES.map(c => {
                const s = categoryStats[c.id];
                const count = s?.total || 0;
                return (
                  <button 
                    key={c.id} 
                    onClick={() => handleCategorySelect(c.id)}
                    className={`cab-chip ${selectedCategory === c.id ? 'active' : ''}`}
                  >
                    {c.label} {count > 0 && <span className="cab-chip-count">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom row: Search & Filters */}
          <div className="cab-bottom-row">
            <div className="cab-search">
              <FiSearch />
              <input 
                type="text" 
                placeholder="Buscar clases..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button onClick={() => setSearch('')}><FiX /></button>}
            </div>

            <div className="cab-filters">
              <button
                className={`cab-filter-btn ${onlyFeatured ? 'active' : ''}`}
                onClick={() => setOnlyFeatured(!onlyFeatured)}
              >
                ✦ Destacadas
              </button>

              <select 
                className="cab-select"
                value={level} 
                onChange={e => setLevel(e.target.value)}
              >
                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>

              <select 
                className="cab-select"
                value={sort} 
                onChange={e => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* ── CATEGORY CINEMATIC HERO (Aparece sólo si se selecciona una) ── */}
      {selectedCategory !== 'all' && catData && (
        <section className="cat-hero" ref={heroRef}>
          <div className="cat-hero-bg" aria-hidden="true">
            <NgrokImage src={catData.image} alt="" />
            <div className="cat-hero-bg__overlay" />
          </div>
          
          <div className="cat-hero-inner">
            <div className="cat-hero-info">
              <div className="cat-badges">
                <span className="cat-badge" style={{ '--badge-bg': catData.accent }}>{catData.label}</span>
              </div>

              <h1 className="cat-title">
                <SplitWords text={`Catálogo de ${catData.label}`} />
              </h1>

              <p className="cat-hero-desc">{catData.desc}</p>

              <div className="cat-meta">
                <span className="cat-hero-meta-item"><FiBook size={14} /> Colección exclusiva</span>
                <span className="cat-meta-sep">·</span>
                <span className="cat-hero-meta-item"><FiUsers size={14} /> Múltiples niveles</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CUERPO (Lista de Clases) ── */}
      <div className={`cc-body ${selectedCategory !== 'all' ? 'has-cat-hero' : ''}`}>
        <div className="cc-container-main">
          
          <div className="cc-results-header">
            <span className="cc-results-count">
              {loading ? 'Cargando...' : `${clases.length} resultado${clases.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {!loading && clases.length === 0 ? (
            <EmptyState
              msg="No encontramos clases con estos filtros."
              onReset={() => {
                setLevel(''); setSearch(''); setOnlyFeatured(false); setSort('');
              }}
            />
          ) : (
            <ClaseList clases={clases} loading={loading} viewMode="grid" />
          )}

        </div>
      </div>

    </div>
  );
};

export default ClaseCatalog;