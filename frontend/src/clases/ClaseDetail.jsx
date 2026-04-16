import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiClock, FiUsers, FiBook, FiPlay, FiCheckCircle,
  FiLock, FiAward, FiShield, FiArrowRight,
} from 'react-icons/fi';
import NgrokImage from '../components/common/NgrokImage';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ClaseDetail.css';

gsap.registerPlugin(ScrollTrigger);

/* ─── helpers ──────────────────────────────────────────────────── */

function SplitWords({ text }) {
  return (
    <span aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span className="cd-word-wrap" key={i}>
          <span className="cd-word">{w}&nbsp;</span>
        </span>
      ))}
    </span>
  );
}

const DIFFICULTY = {
  beginner:     { label: 'Principiante', color: '#059669' },
  intermediate: { label: 'Intermedio',   color: '#d97706' },
  advanced:     { label: 'Avanzado',     color: '#dc2626' },
};

const formatPrice = (p) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p);

/* ─── component ────────────────────────────────────────────────── */

const ClaseDetail = ({ clase, hasAccess, onPurchase, loading, progress = {} }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ delay: 0.12, defaults: { ease: 'expo.out' } });
      tl
        .fromTo('.cd-badge',   { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo('.cd-title .cd-word',
          { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.95 }, '-=0.3')
        .fromTo('.cd-hero-desc', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.75 }, '-=0.5')
        .fromTo('.cd-meta-item', { opacity: 0, x: -12 }, { opacity: 1, x: 0, stagger: 0.06, duration: 0.5 }, '-=0.45')
        .fromTo('.cd-card', { opacity: 0, y: 22, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, '-=0.65');

      gsap.fromTo('.cd-module',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: 'expo.out',
          scrollTrigger: { trigger: '.cd-modules-list', start: 'top 84%', toggleActions: 'play none none none' } });

      gsap.fromTo('.cd-objective',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, stagger: 0.06, duration: 0.6, ease: 'expo.out',
          scrollTrigger: { trigger: '.cd-objectives-grid', start: 'top 84%', toggleActions: 'play none none none' } });
    });
    return () => { mm.revert(); ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  const getAllLessons = () => {
    const all = [];
    (clase.modules || []).forEach(m => (m.lessons || []).forEach(l => all.push(l)));
    return all;
  };
  const isUnlocked = (lesson) => {
    const all = getAllLessons();
    const idx = all.findIndex(l => l.id === lesson.id);
    if (idx <= 0) return true;
    return progress[all[idx - 1].id]?.completed === true;
  };
  const handleLessonClick = (lesson) => {
    if (!hasAccess || !isUnlocked(lesson)) return;
    navigate(`/clase/${clase.id}/player?lesson=${lesson.id}`);
  };

  const diff = DIFFICULTY[clase.difficulty] || { label: clase.difficulty, color: '#b98967' };

  return (
    <div className="cd-page">

      {/* ══ HERO ══════════════════════════════════════════════════════
          Imagen full-width con overlay oscuro.
          Max-width container adentro: info izquierda + card derecha.
      ══════════════════════════════════════════════════════════════ */}
      <section className="cd-hero">

        {/* Fondo */}
        <div className="cd-hero-bg" aria-hidden="true">
          <NgrokImage src={clase.cover_image} alt="" />
          <div className="cd-hero-bg__overlay" />
        </div>

        {/* Contenido centrado */}
        <div className="cd-hero-inner">

          {/* Info */}
          <div className="cd-hero-info">
            <div className="cd-badges">
              <span className="cd-badge" style={{ '--badge-bg': diff.color }}>{diff.label}</span>
              {hasAccess && (
                <span className="cd-badge cd-badge--access">
                  <FiCheckCircle size={12} /> Tenés acceso
                </span>
              )}
            </div>

            <h1 className="cd-title">
              <SplitWords text={clase.title} />
            </h1>

            <p className="cd-hero-desc">{clase.short_description}</p>

            <div className="cd-meta">
              <span className="cd-meta-item"><FiClock size={14} /> {clase.duration_hours}h</span>
              <span className="cd-meta-sep">·</span>
              <span className="cd-meta-item"><FiBook size={14} /> {clase.total_lessons} lecciones</span>
              <span className="cd-meta-sep">·</span>
              <span className="cd-meta-item"><FiUsers size={14} /> {clase.total_students} estudiantes</span>
              <span className="cd-meta-sep">·</span>
              <span className="cd-meta-item"><FiAward size={14} /> Certificado</span>
            </div>
          </div>

          {/* Card de compra */}
          <aside className="cd-hero-aside">
            <div className="cd-card">
              {hasAccess ? (
                <>
                  <div className="cd-access-msg">
                    <FiCheckCircle size={20} className="cd-access-msg__icon" />
                    <div>
                      <strong>Ya tenés acceso</strong>
                      <p>Entrá cuando quieras</p>
                    </div>
                  </div>
                  <button
                    className="cd-btn-buy"
                    onClick={() => navigate(`/clase/${clase.id}/player`)}
                  >
                    <FiPlay size={14} /> Comenzar clase
                  </button>
                </>
              ) : (
                <>
                  <div className="cd-price-block">
                    <span className="cd-price-label">Inversión única</span>
                    <span className="cd-price">{formatPrice(clase.price)}</span>
                  </div>

                  <button className="cd-btn-buy" onClick={onPurchase} disabled={loading}>
                    {loading
                      ? <><span className="cd-spinner" /> Procesando...</>
                      : <>Comprar ahora <FiArrowRight size={14} /></>
                    }
                  </button>

                  <ul className="cd-benefits">
                    {[
                      [FiCheckCircle, 'Acceso de por vida'],
                      [FiCheckCircle, 'Certificado al finalizar'],
                      [FiShield,      'Garantía 30 días'],
                      [FiCheckCircle, 'Actualizaciones gratuitas'],
                    ].map(([Icon, text]) => (
                      <li key={text}><Icon size={13} /> {text}</li>
                    ))}
                  </ul>

                  <div className="cd-trust">
                    <FiShield size={12} /> Pago 100% seguro
                  </div>
                </>
              )}
            </div>
          </aside>

        </div>
      </section>

      {/* ══ CUERPO ════════════════════════════════════════════════════ */}
      <div className="cd-body">
        <div className="cd-body-inner">

          {/* Objetivos */}
          {clase.learning_objectives?.length > 0 && (
            <section className="cd-section cd-section--tinted">
              <p className="cd-overline">Lo que aprenderás</p>
              <h2 className="cd-section-title">Objetivos del clase</h2>
              <div className="cd-objectives-grid">
                {clase.learning_objectives.map((obj, i) => (
                  <div key={i} className="cd-objective">
                    <FiCheckCircle size={15} className="cd-obj-icon" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Descripción */}
          <section className="cd-section">
            <p className="cd-overline">Descripción</p>
            <h2 className="cd-section-title">Sobre este clase</h2>
            <p className="cd-desc-text">{clase.description}</p>
          </section>

          {/* Módulos */}
          <section className="cd-section">
            <p className="cd-overline">Programa</p>
            <h2 className="cd-section-title">Contenido del clase</h2>

            {clase.modules?.length > 0 ? (
              <div className="cd-modules-list">
                {clase.modules.map((mod, mi) => (
                  <div key={mod.id} className="cd-module">
                    <div className="cd-module-head">
                      <span className="cd-module-num">Módulo {mi + 1}</span>
                      <div className="cd-module-info">
                        <h3 className="cd-module-title">{mod.title}</h3>
                        <div className="cd-module-stats">
                          <span>{mod.lessons.length} lecciones</span>
                          <span className="cd-dot">·</span>
                          <span>{mod.lessons.reduce((a, l) => a + (l.duration_minutes || 0), 0)} min</span>
                        </div>
                      </div>
                    </div>
                    {mod.description && <p className="cd-module-desc">{mod.description}</p>}
                    <ul className="cd-lessons">
                      {mod.lessons.map((lesson, li) => {
                        const unlocked  = !hasAccess ? false : isUnlocked(lesson);
                        const clickable = hasAccess && unlocked;
                        const locked    = hasAccess && !unlocked;
                        return (
                          <li
                            key={lesson.id}
                            className={[
                              'cd-lesson',
                              clickable         ? 'cd-lesson--click'   : '',
                              locked            ? 'cd-lesson--locked'  : '',
                              lesson.is_preview ? 'cd-lesson--preview' : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => handleLessonClick(lesson)}
                            title={locked ? 'Completá la lección anterior para desbloquear' : ''}
                          >
                            <span className="cd-lesson-num">{li + 1}</span>
                            <span className="cd-lesson-icon">
                              {locked ? <FiLock size={13} /> : <FiPlay size={13} />}
                            </span>
                            <div className="cd-lesson-body">
                              <span className="cd-lesson-title">{lesson.title}</span>
                              {lesson.description && (
                                <span className="cd-lesson-subdesc">{lesson.description}</span>
                              )}
                            </div>
                            <div className="cd-lesson-meta">
                              <span className="cd-lesson-dur">
                                <FiClock size={11} /> {lesson.duration_minutes} min
                              </span>
                              {lesson.is_preview && (
                                <span className="cd-lesson-free">Gratis</span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cd-empty">
                <FiBook size={36} />
                <p>El contenido estará disponible próximamente</p>
              </div>
            )}
          </section>

          {/* CTA bottom */}
          {!hasAccess && (
            <section className="cd-cta">
              <div className="cd-cta-copy">
                <p className="cd-overline cd-overline--light">¿Lista para empezar?</p>
                <h2 className="cd-cta-title">
                  Transformá tu práctica<br />
                  <em>desde el primer día.</em>
                </h2>
                <p className="cd-cta-sub">
                  Unite a {clase.total_students} estudiantes que ya están aprendiendo
                </p>
              </div>
              <div className="cd-cta-action">
                <span className="cd-cta-price">{formatPrice(clase.price)}</span>
                <button
                  className="cd-btn-buy cd-btn-buy--light"
                  onClick={onPurchase}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : <>Comprar clase <FiArrowRight size={14} /></>}
                </button>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default ClaseDetail;