import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiArrowLeft,
  FiStar,
  FiPlay,
  FiCheckCircle,
  FiShield,
  FiMail,
} from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

// Imágenes del carrusel — se mantienen para .loop-images
const CAROUSEL_IMAGES = [
  '/img/revez-bordo-amplio.jpg',
  '/img/revez-bordo.jpg',
  '/img/pierna-arriba-completa.jpg',
  '/img/parada-de-mano-piernas-con-forma.jpg',
  '/img/manosarriba-sentada.jpg',
  '/img/manosabajo-sentada.jpg',
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
  { title: 'Calming', desc: 'Secuencias suaves para calmar el sistema nervioso y aterrizar el día.' },
  { title: 'Posture', desc: 'Clases enfocadas en alineación y prevención de dolores crónicos.' },
  { title: 'Small Equipment', desc: 'Usa pelota, bandas, aro mágico y más para desafiar tu cuerpo.' },
  { title: 'Signature Classes', desc: 'Flujos creativos que combinan técnica clásica y secuencias modernas.' },
  { title: 'Dynamic', desc: 'Pilates más atlético y enérgico para cuando querés sudar.' },
  { title: 'Meditación', desc: 'Prácticas breves para acompañar tu movimiento con presencia.' },
];

const communityTestimonials = [
  {
    text: 'Completar una clase casi todos los días me trajo alegría, satisfacción y una forma física que no imaginaba posible.',
    name: 'Alumna Equilibro',
  },
  {
    text: 'A los 47 años estoy en la mejor forma de mi vida. No puedo imaginar un día sin mi práctica.',
    name: 'Alumna Equilibro',
  },
  {
    text: 'La calidad y variedad de las clases hace que nunca me aburra. Es un espacio realmente amable.',
    name: 'Alumna Equilibro',
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

const Home = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const imageMotionRef = useRef(null);
  const challengesCarouselRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Hero
    gsap.fromTo(
      '.hero-main',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );

    gsap.fromTo(
      '.hero-tagline',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, delay: 0.2, duration: 0.9 }
    );

    gsap.fromTo(
      '.hero-ctas',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, delay: 0.35, duration: 0.8 }
    );

    // Challenges
    gsap.fromTo(
      '.challenge-slide',
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        scrollTrigger: {
          trigger: '.challenges-section',
          start: 'top 80%',
        },
      }
    );

    // Collections
    gsap.fromTo(
      '.collection-card',
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        scrollTrigger: {
          trigger: '.collections-section',
          start: 'top 80%',
        },
      }
    );

    // Pricing
    gsap.fromTo(
      '.pricing-card',
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.pricing-section',
          start: 'top 80%',
        },
      }
    );

    // image-motion: se mantiene animación existente
    if (imageMotionRef.current) {
      gsap.set(imageMotionRef.current, { rotateX: 90 });
      gsap.to(imageMotionRef.current, {
        rotateX: 0,
        scrollTrigger: {
          trigger: '.section2',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setActiveTestimonial((prev) => (prev + 1) % communityTestimonials.length),
      6000
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="home-page">


      {/* HERO */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-inner hero-main">
          <p className="hero-kicker">Tu estudio de Pilates online</p>
          <h1 className="hero-title">
            Equilibrio Pinamar
            <span className="hero-title__accent"> pilates y medicina estética</span>
          </h1>
          <p className="hero-tagline">
            Únete a mujeres de todo el mundo practicando Pilates desde casa.
            Clases técnicas, amables y efectivas para sentirte bien en mente y cuerpo.
          </p>

          <div className="hero-ctas">
            <Link to="/cursos" className="btn-pill btn-pill--accent">
              Ver cursos disponibles <FiArrowRight />
            </Link>
            <Link to="/como-funciona" className="hero-ghost-cta">
              <FiPlay size={16} />
              Como Funciona?
            </Link>
          </div>

          <div className="hero-social-proof">
            <div className="hero-stars">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} />
              ))}
            </div>
            <span>Cursos con clases en video · A tu ritmo · Comunidad amable</span>
          </div>
        </div>
      </section>

      {/* START WITH A CHALLENGE */}
      <section id="challenges" className="challenges-section">
        <div className="container">
          <div className="section-heading section-heading--center">
            <p className="overline">Empezá con un programa</p>
            <h2 className="h2">
              Elige tu reto <em>para comenzar</em>
            </h2>
            <p className="section-heading__text section-heading__text--center">
              Tanto si sos nueva en el método como si ya tenés experiencia,
              hay un programa pensado para acompañar tu próximo capítulo.
            </p>
          </div>

          <div className="challenges-carousel-wrapper">
            <button
              type="button"
              className="challenges-arrow challenges-arrow--left"
              onClick={() => {
                if (!challengesCarouselRef.current) return;
                const width = challengesCarouselRef.current.offsetWidth;
                challengesCarouselRef.current.scrollBy({
                  left: -width * 0.8,
                  behavior: 'smooth',
                });
              }}
            >
              <span className="visually-hidden">Anterior</span>
              <FiArrowLeft size={18} />
            </button>

            <div className="challenges-carousel" ref={challengesCarouselRef}>
              {challenges.map((c) => (
                <article key={c.title} className="challenge-slide">
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
              onClick={() => {
                if (!challengesCarouselRef.current) return;
                const width = challengesCarouselRef.current.offsetWidth;
                challengesCarouselRef.current.scrollBy({
                  left: width * 0.8,
                  behavior: 'smooth',
                });
              }}
            >
              <span className="visually-hidden">Siguiente</span>
              <FiArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* MEET YOUR TEACHER */}
      <section className="about-section">
        <div className="container about-layout">
          <div className="about-photo">
            <div className="about-photo__frame">
              <img
                src="/img/foto-pc2.jpg"
                alt="Instructora de Pilates"
              />
            </div>
            <div className="about-photo__tag">
              <FiCheckCircle size={16} />
              <span>Instructora certificada · Comunidad real</span>
            </div>
          </div>

          <div className="about-copy">
            <p className="overline">Conoce a tu profesora</p>
            <h2 className="h2">
              Hola, soy
              <em> Nadia D&apos;Angelo</em>
            </h2>
            <p className="body-text">
              Creo que el Pilates es mucho más que ejercicio. Es una práctica diaria de presencia,
              de cuidado y de conexión contigo misma. Mi intención es que cada clase se sienta como
              un espacio seguro donde puedas llegar tal como estás.
            </p>
            <p className="body-text">
              No busco perfección, busco compromiso suave: extender tu mat, respirar,
              moverte un poco y salir sintiéndote mejor que cuando entraste.
            </p>
            <ul className="about-list">
              <li>
                <FiCheckCircle size={16} />
                <span>Clases para todos los niveles, desde principiante absoluto.</span>
              </li>
              <li>
                <FiCheckCircle size={16} />
                <span>Cursos organizados por nivel, duración y enfoque.</span>
              </li>
              <li>
                <FiCheckCircle size={16} />
                <span>Una comunidad amable que te acompaña en cada paso.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* EXPLORE OUR COLLECTIONS */}
      <section id="collections" className="collections-section">
        <div className="container">
          <div className="section-heading section-heading--center">
            <p className="overline">Explora las colecciones</p>
            <h2 className="h2">
              Clases para cada
              <em> estado de ánimo</em>
            </h2>
            <p className="section-heading__text section-heading__text--center">
              Filtra por lo que necesitas hoy: calma, energía, postura, reto,
              embarazo, meditación y más.
            </p>
          </div>
          <div className="collections-grid">
            {collections.map((col) => (
              <article key={col.title} className="collection-card">
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

      {/* LOOP IMAGES — NO TOCAR */}
      <section className="loop-images" style={{ '--bg': 'var(--white)' }}>
        <div
          className="carousel-track"
          style={{ '--time': '60s', '--total': CAROUSEL_IMAGES.length }}
        >
          {CAROUSEL_IMAGES.map((src, i) => (
            <div
              key={src}
              className="carousel-item"
              style={{ '--i': i + 1 }}
            >
              <img src={src} alt={`pilates ${i + 1}`} loading="lazy" />
            </div>
          ))}
        </div>
        <span className="carousel-scroll-hint">
          Scroll <span className="carousel-arrow">↓</span>
        </span>
      </section>

      {/* SECTION 2 IMAGE-MOTION — NO TOCAR */}
      <section className="section2" style={{ '--bg': 'black' }}>
        <div className="image-motion" ref={imageMotionRef}>
          <picture>
            <img
              src="https://i.postimg.cc/1ztkf4hX/moveimage.png"
              alt="Pilates en movimiento"
            />
          </picture>
        </div>
      </section>

      {/* COMMUNITY / TESTIMONIALS */}
      <section id="community" className="community-section">
        <div className="container">
          <div className="section-heading section-heading--center">
            <p className="overline">La comunidad más amable</p>
            <h2 className="h2">
              Cuidamos tu cuerpo y
              <em> tu bienestar</em>
            </h2>
          </div>
          <div className="community-layout">
            <div className="community-highlight">
              <p className="community-lead">
                “Siento que practico junto a una amiga al otro lado de la pantalla.
                Las clases son técnicas, efectivas y, sobre todo, amables.”
              </p>
              <p className="community-note">
                Correos de motivación, chat de comunidad, clases en vivo y eventos especiales
                hacen que tu práctica se sienta acompañada, aunque estés en casa.
              </p>
            </div>
            <div className="community-testimonials">
              {communityTestimonials.map((t, idx) => (
                <div
                  key={idx}
                  className={`community-quote ${
                    idx === activeTestimonial ? 'is-active' : ''
                  }`}
                >
                  <p>"{t.text}"</p>
                  <span>— {t.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA — CURSOS INDIVIDUALES */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="section-heading section-heading--center">
            <p className="overline">Cómo funciona</p>
            <h2 className="h2">
              Elegí tu curso
              <em> y practicá a tu ritmo</em>
            </h2>
          </div>
          <div className="pricing-grid pricing-grid--single">
            <article className="pricing-card pricing-card--highlight">
              <h3 className="pricing-card__name">{courseModel.title}</h3>
              <p className="pricing-card__desc">{courseModel.desc}</p>
              <ul className="pricing-card__features">
                {courseModel.features.map((f) => (
                  <li key={f}>
                    <FiCheckCircle size={14} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/cursos" className="btn-pill btn-pill--dark">
                Ver cursos disponibles <FiArrowRight />
              </Link>
            </article>
          </div>
          <p className="pricing-fineprint">
            Cada curso tiene su precio. Un solo pago, acceso para siempre a ese curso.
          </p>
        </div>
      </section>

      {/* FAQ + NEWSLETTER */}
      <section className="faq-section">
        <div className="container faq-container">
          <div className="faq-block">
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

      {/* CTA FINAL */}
      <section className="cta-section">
        <div className="container cta-section__body">
          <p className="overline cta-overline">Listas cuando vos lo estés</p>
          <h2 className="h2 cta-h2">
            Tu práctica de Pilates
            <em> empieza hoy</em>
          </h2>
          <p className="cta-text">
            Elegí el curso que más te motive y accedé a sus clases cuando quieras,
            con una comunidad que te acompaña en cada movimiento.
          </p>
          <div className="cta-actions">
            <Link to="/cursos" className="btn-pill btn-pill--accent btn-pill--lg">
              Ver cursos disponibles <FiArrowRight />
            </Link>
            <Link to="/login" className="btn-text-arrow">
              Ya tengo cuenta <FiArrowRight size={14} />
            </Link>
          </div>
          <p className="cta-fine">
            <FiShield size={13} /> Un solo pago por curso · Sin compromisos · Comunidad amable
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;