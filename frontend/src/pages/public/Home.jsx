import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiArrowLeft,
  FiPlay,
  FiCheckCircle,
  FiShield,
} from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */

const GALLERY_IMAGES = [
  { src: '/img/revez-bordo-amplio.jpg',               alt: 'Pilates — extensión de espalda' },
  { src: '/img/revez-bordo.jpg',                      alt: 'Pilates — postura lateral' },
  { src: '/img/pierna-arriba-completa.jpg',           alt: 'Pilates — pierna arriba' },
  { src: '/img/parada-de-mano-piernas-con-forma.jpg', alt: 'Pilates — parada de mano' },
  { src: '/img/manosarriba-sentada.jpg',              alt: 'Pilates — manos arriba' },
  { src: '/img/manosabajo-sentada.jpg',               alt: 'Pilates — manos abajo' },
];

const challenges = [
  {
    title: 'Calming',
    tag: 'Para cuando necesitás bajar revoluciones',
    desc: 'Rutinas suaves para ayudarte a aterrizar y relajarte después de un día largo.',
    image: '/img/manosabajo-sentada.jpg',
  },
  {
    title: 'Posture',
    tag: 'Para cuidar tu espalda',
    desc: 'Secuencias enfocadas en alineación, core y estabilidad para prevenir molestias.',
    image: '/img/manosarriba-sentada.jpg',
  },
  {
    title: 'Small Equipment',
    tag: 'Con elementos en casa',
    desc: 'Pelota, bandas y aro mágico para darle un giro nuevo a tus clases.',
    image: '/img/pierna-arriba-pelota.jpg',
  },
  {
    title: 'Dynamic',
    tag: 'Energía y sudor',
    desc: 'Flujos más atléticos para cuando querés un reto que te encienda.',
    image: '/img/parada-de-manos.jpg',
  },
  {
    title: 'Prenatal',
    tag: 'Durante el embarazo',
    desc: 'Clases cuidadas para acompañarte en cada trimestre con seguridad.',
    image: '/img/parada-de-mano-piernas-con-forma.jpg',
  },
  {
    title: 'Return to You',
    tag: 'Volver a tu centro',
    desc: 'Un camino de regreso a tu fuerza, calma y conexión contigo misma.',
    image: '/img/revez-bordo.jpg',
  },
];

const collections = [
  { title: 'Calming',          desc: 'Secuencias suaves para calmar el sistema nervioso y aterrizar el día.' },
  { title: 'Posture',          desc: 'Clases enfocadas en alineación y prevención de dolores crónicos.' },
  { title: 'Small Equipment',  desc: 'Usa pelota, bandas, aro mágico y más para desafiar tu cuerpo.' },
  { title: 'Signature Classes',desc: 'Flujos creativos que combinan técnica clásica y secuencias modernas.' },
  { title: 'Dynamic',          desc: 'Pilates más atlético y enérgico para cuando querés sudar.' },
  { title: 'Meditación',       desc: 'Prácticas breves para acompañar tu movimiento con presencia.' },
];

const communityTestimonials = [
  {
    text: 'Completar una clase casi todos los días me trajo alegría, satisfacción y una forma física que no imaginaba posible.',
    name: 'Alumna Equilibrio',
  },
  {
    text: 'A los 47 años estoy en la mejor forma de mi vida. No puedo imaginar un día sin mi práctica.',
    name: 'Alumna Equilibrio',
  },
  {
    text: 'La calidad y variedad de las clases hace que nunca me aburra. Es un espacio realmente amable.',
    name: 'Alumna Equilibrio',
  },
];

const courseModel = {
  title: 'Un solo pago por curso',
  desc: 'Elegí el curso que quieras y accedé a todas sus clases cuando quieras. Sin pagos recurrentes ni compromisos.',
  features: [
    'Acceso completo al curso que compres',
    'Todas las clases en video, a tu ritmo',
    'Disponible desde tu navegador o dispositivo',
    'Sin suscripciones ni renovaciones',
  ],
};

const faqs = [
  {
    q: '¿Cómo puedo acceder a los cursos?',
    a: 'Solo necesitas crear tu cuenta y comprar el curso que quieras realizar. Una vez adquirido, tendrás acceso inmediato a todas las clases incluidas en ese curso para realizarlas a tu propio ritmo desde tu navegador o dispositivo.',
  },
  {
    q: 'Soy nueva en Pilates, ¿por dónde empiezo?',
    a: 'Si es tu primera vez, te recomendamos comenzar con un curso para principiantes. Estos programas están diseñados para enseñarte los fundamentos del Pilates paso a paso: respiración, alineación y activación del core.',
  },
  {
    q: '¿Cómo funcionan los pagos?',
    a: 'Nuestros cursos se compran de forma individual. Cada curso tiene su propio precio y, una vez que lo adquieres, puedes acceder a todas sus clases sin necesidad de pagar una suscripción mensual.',
  },
  {
    q: '¿Hay clases de Pilates prenatal?',
    a: 'Sí. Disponemos de cursos diseñados especialmente para acompañarte durante el embarazo, con ejercicios suaves y seguros enfocados en movilidad, respiración y bienestar.',
  },
  {
    q: '¿Necesito equipamiento para practicar?',
    a: 'La mayoría de las clases se pueden realizar solo con una colchoneta. Algunos cursos pueden incluir accesorios opcionales como bandas elásticas, pelota o aro de Pilates, pero no son obligatorios para empezar.',
  },
  {
    q: '¿Cuántas veces por semana debería practicar?',
    a: 'Para notar resultados, recomendamos practicar entre 3 y 5 veces por semana. La constancia es más importante que la duración de cada sesión, y con el tiempo notarás mejoras en tu fuerza, postura y movilidad.',
  },
];

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */

/** Divide un string en palabras, cada una envuelta en spans para GSAP */
function SplitWords({ text, className }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span className="word-wrap" key={i}>
          <span className="word">{w}&nbsp;</span>
        </span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SCROLL GALLERY — horizontal scrub con GSAP pin
   Reemplaza las secciones .loop-images y .section2
───────────────────────────────────────────────────────────────── */

function ScrollGallery() {
  const sectionRef = useRef(null);
  const trackRef   = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 641px)', () => {
      const section = sectionRef.current;
      const track   = trackRef.current;
      if (!section || !track) return;

      // Tween principal: mueve el track hacia la izquierda con el scroll
      const tween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth + window.innerHeight * 0.4}`,
          scrub: 1.4,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Parallax interno de cada imagen
      track.querySelectorAll('.sg-img').forEach(img => {
        gsap.fromTo(img,
          { scale: 1.1 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: img,
              containerAnimation: tween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          }
        );
      });

      // Caption fade-in por slide
      track.querySelectorAll('.sg-caption').forEach(cap => {
        gsap.fromTo(cap,
          { opacity: 0, y: 12 },
          {
            opacity: 1, y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cap.closest('.sg-slide'),
              containerAnimation: tween,
              start: 'left 65%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="sg-section">

      {/* Label fijo top-left */}
      <div className="sg-label" aria-hidden="true">
        <span>Galería</span>
        <span className="sg-label__line" />
        <span>{GALLERY_IMAGES.length} momentos</span>
      </div>

      {/* Track que se desplaza horizontalmente */}
      <div ref={trackRef} className="sg-track">

        {/* Slide de intro */}
        <div className="sg-intro">
          <p className="sg-intro__overline">En movimiento</p>
          <h2 className="sg-intro__heading">
            Cada clase,<br />
            <em>un momento tuyo.</em>
          </h2>
          <div className="sg-intro__hint">
            <svg className="sg-hint-icon" width="28" height="12" viewBox="0 0 28 12" fill="none" aria-hidden="true">
              <path d="M0 6h26M20 1l6 5-6 5" stroke="currentColor" strokeWidth="1.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="sg-hint-text sg-hint-text--desktop">Seguí scrolleando</span>
            <span className="sg-hint-text sg-hint-text--mobile">Deslizá para ver más</span>
          </div>
        </div>

        {/* Slides de imágenes */}
        {GALLERY_IMAGES.map((img, i) => (
          <div className="sg-slide" key={i}>
            <div className="sg-img-wrap">
              <img
                className="sg-img"
                src={img.src}
                alt={img.alt}
                loading="lazy"
                draggable="false"
              />
              <div className="sg-img-overlay" aria-hidden="true" />
            </div>
            <div className="sg-caption">
              <span className="sg-caption__num">0{i + 1}</span>
              <span className="sg-caption__text">{img.alt}</span>
            </div>
          </div>
        ))}

        {/* Slide de outro */}
        <div className="sg-outro">
          <p className="sg-outro__label">¿Lista para empezar?</p>
          <Link to="/cursos" className="sg-outro__btn">
            Ver cursos
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
              <path d="M0 5h14M9 1l5 4-5 4" stroke="currentColor" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   HOME
───────────────────────────────────────────────────────────────── */

const Home = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq]                     = useState(0);
  const challengesCarouselRef                     = useRef(null);
  const heroRef                                   = useRef(null);
  const ctx                                       = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      ctx.current = gsap.context(() => {

        /* ── Hero — entrada kinética ── */
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
        tl
          .fromTo('.hero-kicker',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1 }
          )
          .fromTo('.hero-title .word',
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, stagger: 0.06, duration: 1.1 },
            '-=0.6'
          )
          .fromTo('.hero-tagline',
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 1 },
            '-=0.5'
          )
          .fromTo('.hero-ctas',
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.8 },
            '-=0.4'
          )
          .fromTo('.hero-line',
            { scaleX: 0 },
            { scaleX: 1, duration: 1.2, ease: 'power4.out', transformOrigin: 'left center' },
            '-=0.6'
          )
          .fromTo('.hero-scroll-hint',
            { opacity: 0 },
            { opacity: 1, duration: 1 },
            '-=0.3'
          );

        /* ── Letras desde la izquierda ── */
        gsap.utils.toArray('.reveal-left .word').forEach((w, i) => {
          gsap.fromTo(w,
            { xPercent: -120, opacity: 0 },
            {
              xPercent: 0, opacity: 1,
              duration: 1.1, ease: 'expo.out',
              delay: i * 0.04,
              scrollTrigger: {
                trigger: w.closest('.reveal-left'),
                start: 'top 82%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        /* ── Letras desde la derecha ── */
        gsap.utils.toArray('.reveal-right .word').forEach((w, i) => {
          gsap.fromTo(w,
            { xPercent: 120, opacity: 0 },
            {
              xPercent: 0, opacity: 1,
              duration: 1.1, ease: 'expo.out',
              delay: i * 0.04,
              scrollTrigger: {
                trigger: w.closest('.reveal-right'),
                start: 'top 82%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        /* ── Fade-up genérico ── */
        gsap.utils.toArray('.fade-up').forEach(el => {
          gsap.fromTo(el,
            { opacity: 0, y: 40 },
            {
              opacity: 1, y: 0, duration: 1.1, ease: 'expo.out',
              scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
            }
          );
        });

        /* ── Stagger cards ── */
        gsap.utils.toArray('.stagger-group').forEach(group => {
          const items = group.querySelectorAll('.stagger-item');
          gsap.fromTo(items,
            { opacity: 0, y: 36 },
            {
              opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1,
              scrollTrigger: { trigger: group, start: 'top 80%', toggleActions: 'play none none none' },
            }
          );
        });

        /* ── SVG figura pilates — respiración ── */
        gsap.to('.pilates-figure', {
          scale: 1.035,
          duration: 3.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          transformOrigin: 'center bottom',
        });

        /* ── SVG line draw — hero y anatomy ── */
        gsap.utils.toArray('.draw-line').forEach(path => {
          const length = path.getTotalLength?.() || 300;
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 2.2, ease: 'power2.out',
            scrollTrigger: { trigger: path, start: 'top 80%' },
          });
        });

        /* ── Marquee scrub con scroll ── */
        gsap.to('.marquee-inner', {
          xPercent: -50, ease: 'none',
          scrollTrigger: {
            trigger: '.marquee-section',
            start: 'top bottom', end: 'bottom top',
            scrub: 1.2,
          },
        });

        /* ── Parallax lento en hero ── */
        gsap.to('.hero-bg-img', {
          yPercent: 18, ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top', end: 'bottom top',
            scrub: true,
          },
        });

        /* ── Contadores animados ── */
        gsap.utils.toArray('.counter-num').forEach(el => {
          const target = parseInt(el.dataset.target, 10);
          ScrollTrigger.create({
            trigger: el, start: 'top 85%', once: true,
            onEnter: () => {
              gsap.fromTo({ val: 0 }, { val: target }, {
                duration: 2, ease: 'power2.out',
                onUpdate: function () {
                  el.textContent = Math.round(this.targets()[0].val);
                },
              });
            },
          });
        });

      });
    });

    /* ── Testimonial auto-rotate ── */
    const id = setInterval(
      () => setActiveTestimonial(p => (p + 1) % communityTestimonials.length),
      6000
    );

    return () => {
      mm.revert();
      ctx.current?.revert();
      clearInterval(id);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="home-page">

      {/* ════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════ */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-bg">
          <img className="hero-bg-img" src="/img/fit.jpg" alt="" aria-hidden="true" />
          <div className="hero-overlay" />
        </div>

        <div className="hero-inner-home">
          <p className="hero-kicker">
            <span className="kicker-dot" />
            Tu estudio de Pilates online
          </p>

          <h1 className="hero-title">
            <SplitWords text="Equilibrio"  className="hero-title__line" />
            <SplitWords text="Pinamar"     className="hero-title__line hero-title__line--italic" />
          </h1>

          <div className="hero-line" />

          <p className="hero-tagline">
            La coordinación completa de mente, cuerpo y espíritu.
            Pilates online con precisión clínica desde casa.
          </p>

          <div className="hero-ctas">
            <Link to="/cursos" className="btn-primary">
              Ver cursos <FiArrowRight size={15} />
            </Link>
            <Link to="/como-funciona" className="btn-ghost">
              <FiPlay size={14} />
              Cómo funciona
            </Link>
          </div>

          <div className="hero-scroll-hint" aria-hidden="true">
            {'SCROLL'.split('').map((l, i) => (
              <span key={i} className="scroll-word">{l}</span>
            ))}
          </div>
        </div>


      </section>

      {/* ════════════════════════════════════════════════
          MARQUEE / MANIFESTO
      ════════════════════════════════════════════════ */}
      <section className="marquee-section" aria-hidden="true">
        <div className="marquee-inner">
          {[
            'Precisión','·','Método','·','Respiración','·','Fuerza','·',
            'Equilibrio','·','Movimiento','·','Presencia','·',
            'Precisión','·','Método','·','Respiración','·','Fuerza','·',
            'Equilibrio','·','Movimiento','·','Presencia','·',
          ].map((w, i) => (
            <span key={i} className={w === '·' ? 'marquee-dot' : 'marquee-word'}>{w}</span>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          STATS
      ════════════════════════════════════════════════ */}
      <section className="stats-section">
        <div className="container stats-grid fade-up">
          {[
            { num: 400, suffix: '+',    label: 'Clases en video' },
            { num: 12,  suffix: '',     label: 'Programas diseñados' },
            { num: 8,   suffix: ' años',label: 'De experiencia online' },
            { num: 100, suffix: '%',    label: 'Sin contratos' },
          ].map(({ num, suffix, label }) => (
            <div className="stat-item" key={label}>
              <span className="stat-num">
                <span className="counter-num" data-target={num}>0</span>
                {suffix}
              </span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          METHOD STATEMENT
      ════════════════════════════════════════════════ */}
      <section className="method-section">
        <div className="container method-layout">
          <div className="method-copy">
            <p className="overline fade-up">El método</p>
            <h2 className="method-heading">
              <SplitWords text="Precisión"         className="reveal-left" />
              <SplitWords text="sobre tendencias." className="reveal-right" />
            </h2>
            <p className="method-body fade-up">
              No seguimos modas. Trabajamos desde adentro hacia afuera —
              el <em>mecanismo interno</em> que Joseph Pilates describió
              y que Nadia D'Angelo lleva a cada clase online.
            </p>
            <p className="method-body fade-up">
              Respiración, alineación, activación del core. Cada clase
              pensada para tu estructura anatómica y tu momento de vida.
            </p>
            <Link to="/como-funciona" className="link-arrow fade-up">
              Conocé el método <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="method-visual fade-up">
            <div className="method-img-frame">
              <img src="/img/revez-bordo-amplio.jpg" alt="Instructora de Pilates" />
              <div className="method-img-caption">
                <span>Nadia D'Angelo</span>
                <span className="method-img-caption__role">Instructora certificada</span>
              </div>
            </div>
            <div className="method-badge">
              <svg viewBox="0 0 100 100" className="method-badge__svg" aria-hidden="true">
                <path id="circle-text"
                  d="M50,50 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0" fill="none" />
                <text fontSize="9" fill="currentColor" letterSpacing="2">
                  <textPath href="#circle-text">
                    MÉTODO · PRECISIÓN · BIENESTAR · PILATES ·
                  </textPath>
                </text>
              </svg>
              <span className="method-badge__center">EP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CHALLENGES CAROUSEL
      ════════════════════════════════════════════════ */}
      <section id="challenges" className="challenges-section">
        <div className="container">
          <div className="section-heading section-heading--split fade-up">
            <div>
              <p className="overline">Empezá con un programa</p>
              <h2 className="h2">
                <SplitWords text="Elegí tu reto" className="reveal-left" />
              </h2>
            </div>
            <p className="section-heading__text">
              Tanto si sos nueva en el método como si ya tenés experiencia,
              hay un programa pensado para acompañar tu próximo capítulo.
            </p>
          </div>
        </div>

        <div className="challenges-carousel-wrapper">
          <button
            type="button"
            className="challenges-arrow challenges-arrow--left"
            onClick={() => challengesCarouselRef.current?.scrollBy({
              left: -(challengesCarouselRef.current.offsetWidth * 0.8),
              behavior: 'smooth',
            })}
          >
            <span className="visually-hidden">Anterior</span>
            <FiArrowLeft size={18} />
          </button>

          <div className="challenges-carousel stagger-group" ref={challengesCarouselRef}>
            {challenges.map(c => (
              <article key={c.title} className="challenge-slide stagger-item">
                <div className="challenge-slide__image">
                  <img src={c.image} alt={c.title} loading="lazy" />
                </div>
                <div className="challenge-slide__overlay">
                  <span className="challenge-slide__badge">{c.tag}</span>
                  <h3 className="challenge-slide__title">{c.title}</h3>
                  <p className="challenge-slide__desc">{c.desc}</p>
                  <button className="challenge-slide__link">
                    Explorar <FiArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="challenges-arrow challenges-arrow--right"
            onClick={() => challengesCarouselRef.current?.scrollBy({
              left: challengesCarouselRef.current.offsetWidth * 0.8,
              behavior: 'smooth',
            })}
          >
            <span className="visually-hidden">Siguiente</span>
            <FiArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          TEACHER / ABOUT
      ════════════════════════════════════════════════ */}
      <section className="about-section">
        <div className="container about-layout">
          <div className="about-photo fade-up">
            <div className="about-photo__frame">
              <img src="/img/foto-pc2.jpg" alt="Instructora de Pilates" />
            </div>
            <div className="about-photo__tag">
              <FiCheckCircle size={16} />
              <span>Instructora certificada · Comunidad real</span>
            </div>
          </div>

          <div className="about-copy">
            <p className="overline fade-up">Conocé a tu profesora</p>
            <h2 className="about-heading">
              <SplitWords text="Hola,"      className="reveal-left" />
              <br />
              <SplitWords text="soy Nadia." className="reveal-right" />
            </h2>
            <p className="body-text fade-up">
              Creo que el Pilates es mucho más que ejercicio. Es una práctica diaria
              de presencia, de cuidado y de conexión contigo misma.
            </p>
            <p className="body-text fade-up">
              Mi intención es que cada clase se sienta como un espacio seguro donde
              puedas llegar tal como estás. No busco perfección — busco compromiso suave.
            </p>
            <ul className="about-list stagger-group">
              {[
                'Clases para todos los niveles, desde principiante absoluto.',
                'Cursos organizados por nivel, duración y enfoque.',
                'Una comunidad amable que te acompaña en cada paso.',
              ].map(t => (
                <li key={t} className="stagger-item">
                  <FiCheckCircle size={16} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          ANATOMY
      ════════════════════════════════════════════════ */}
      <section className="anatomy-section">
        <div className="anatomy-bg" aria-hidden="true">
          <svg className="anatomy-svg" viewBox="0 0 800 600" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M400 50 Q380 150 400 250 Q420 350 400 500"
              stroke="rgba(185,137,103,0.25)" strokeWidth="2" fill="none" className="draw-line" />
            {[130, 155, 180, 205, 230, 255].map((y, i) => (
              <g key={y}>
                <path
                  d={`M400 ${y} Q${340 - i * 4} ${y + 20} ${310 - i * 3} ${y + 10}`}
                  stroke="rgba(185,137,103,0.18)" strokeWidth="1.2" fill="none" className="draw-line" />
                <path
                  d={`M400 ${y} Q${460 + i * 4} ${y + 20} ${490 + i * 3} ${y + 10}`}
                  stroke="rgba(185,137,103,0.18)" strokeWidth="1.2" fill="none" className="draw-line" />
              </g>
            ))}
            <path d="M340 330 Q400 360 460 330 Q490 360 460 390 Q400 420 340 390 Q310 360 340 330Z"
              stroke="rgba(185,137,103,0.2)" strokeWidth="1.5" fill="none" className="draw-line" />
            <circle cx="400" cy="300" r="180" stroke="rgba(185,137,103,0.06)" strokeWidth="1" />
            <circle cx="400" cy="300" r="240" stroke="rgba(185,137,103,0.04)" strokeWidth="1" />
          </svg>
        </div>

        <div className="container anatomy-content">
          <h2 className="anatomy-heading">
            <SplitWords text="Tu cuerpo,"    className="reveal-left" />
            <br />
            <SplitWords text="tu práctica."  className="reveal-right" />
          </h2>
          <p className="anatomy-body fade-up">
            Desde el core hasta la respiración — cada clase está construida
            sobre la anatomía real, no sobre tendencias de fitness.
          </p>
          <div className="anatomy-pillars stagger-group">
            {[
              { title: 'Respiración',  desc: 'El fundamento de todo movimiento consciente.' },
              { title: 'Core profundo',desc: 'Activación desde adentro, no fuerza superficial.' },
              { title: 'Alineación',   desc: 'Postura como hábito, no como esfuerzo.' },
              { title: 'Control',      desc: 'Precisión antes que velocidad. Siempre.' },
            ].map(p => (
              <div className="anatomy-pillar stagger-item" key={p.title}>
                <span className="anatomy-pillar__num" aria-hidden="true">—</span>
                <h3 className="anatomy-pillar__title">{p.title}</h3>
                <p className="anatomy-pillar__desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          COLLECTIONS
      ════════════════════════════════════════════════ */}
      <section id="collections" className="collections-section">
        <div className="container">
          <div className="section-heading section-heading--center fade-up">
            <p className="overline">Explorá las colecciones</p>
            <h2 className="h2">
              <SplitWords text="Clases para cada"   className="reveal-left" />
              <br />
              <SplitWords text="estado de ánimo."   className="reveal-right" />
            </h2>
          </div>
          <div className="collections-grid stagger-group">
            {collections.map(col => (
              <article key={col.title} className="collection-card stagger-item">
                <h3 className="collection-card__title">{col.title}</h3>
                <p className="collection-card__desc">{col.desc}</p>
                <button className="collection-card__link">
                  Ver clases <FiArrowRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SCROLL GALLERY — reemplaza .loop-images y .section2
      ════════════════════════════════════════════════ */}
      <ScrollGallery />

      {/* ════════════════════════════════════════════════
          COMMUNITY / TESTIMONIALS
      ════════════════════════════════════════════════ */}
      <section id="community" className="community-section">
        <div className="container">
          <div className="section-heading section-heading--center fade-up">
            <p className="overline">La comunidad más amable</p>
            <h2 className="h2">
              <SplitWords text="Cuidamos tu cuerpo" className="reveal-left" />
              <br />
              <SplitWords text="y tu bienestar."    className="reveal-right" />
            </h2>
          </div>
          <div className="community-layout">
            <div className="community-highlight fade-up">
              <p className="community-lead">
                "Siento que practico junto a una amiga al otro lado de la pantalla.
                Las clases son técnicas, efectivas y, sobre todo, amables."
              </p>
              <p className="community-note">
                Correos de motivación, chat de comunidad y eventos especiales
                hacen que tu práctica se sienta acompañada, aunque estés en casa.
              </p>
            </div>
            <div className="community-testimonials fade-up">
              {communityTestimonials.map((t, idx) => (
                <div
                  key={idx}
                  className={`community-quote ${idx === activeTestimonial ? 'is-active' : ''}`}
                >
                  <p>"{t.text}"</p>
                  <span>— {t.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          TEXT BREAK — cita Joseph Pilates
      ════════════════════════════════════════════════ */}
      <section className="text-break-section">
        <div className="container">
          <p className="text-break-quote">
            <SplitWords text='"La coordinación completa' className="reveal-left" />
            <br />
            <SplitWords text="de mente, cuerpo"          className="reveal-right" />
            <br />
            <SplitWords text='y espíritu."'               className="reveal-left" />
          </p>
          <p className="text-break-attr fade-up">— Joseph Pilates</p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          PRICING
      ════════════════════════════════════════════════ */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="section-heading section-heading--center fade-up">
            <p className="overline">Cómo funciona</p>
            <h2 className="h2">
              <SplitWords text="Elegí tu curso"          className="reveal-left" />
              <br />
              <SplitWords text="y practicá a tu ritmo."  className="reveal-right" />
            </h2>
          </div>
          <div className="pricing-grid pricing-grid--single stagger-group">
            <article className="pricing-card pricing-card--highlight stagger-item">
              <h3 className="pricing-card__name">{courseModel.title}</h3>
              <p className="pricing-card__desc">{courseModel.desc}</p>
              <ul className="pricing-card__features">
                {courseModel.features.map(f => (
                  <li key={f}>
                    <FiCheckCircle size={14} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/cursos" className="btn-primary">
                Ver cursos disponibles <FiArrowRight />
              </Link>
            </article>
          </div>
          <p className="pricing-fineprint fade-up">
            Cada curso tiene su precio. Un solo pago, acceso para siempre a ese curso.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════════ */}
      <section className="faq-section">
        <div className="container faq-container">
          <div className="faq-block fade-up">
            <p className="overline faq-overline">Preguntas frecuentes</p>
            <h2 className="h2 faq-title">FAQ</h2>
          </div>
          <div className="faq-list">
            {faqs.map((item, idx) => (
              <div
                key={item.q}
                className={`faq-item ${openFaq === idx ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="faq-item__question"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                >
                  <span>{item.q}</span>
                  <span className="faq-item__icon">{openFaq === idx ? '–' : '+'}</span>
                </button>
                <div className="faq-item__answer">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════════════════ */}
      <section className="cta-section">
        <div className="container cta-section__body">
          <p className="overline cta-overline fade-up">Listas cuando vos lo estés</p>
          <h2 className="cta-heading">
            <SplitWords text="Tu práctica"  className="reveal-left" />
            <br />
            <SplitWords text="empieza hoy." className="reveal-right" />
          </h2>
          <p className="cta-text fade-up">
            Elegí el curso que más te motive y accedé a sus clases cuando quieras,
            con una comunidad que te acompaña en cada movimiento.
          </p>
          <div className="cta-actions fade-up">
            <Link to="/cursos" className="btn-primary btn-primary--lg">
              Ver cursos disponibles <FiArrowRight />
            </Link>
            <Link to="/login" className="btn-ghost">
              Ya tengo cuenta <FiArrowRight size={14} />
            </Link>
          </div>
          <p className="cta-fine fade-up">
            <FiShield size={13} /> Un solo pago · Sin compromisos · Comunidad amable
          </p>
        </div>
      </section>

    </div>
  );
};

export default Home;