import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import {
  FiArrowRight,
  FiBook,
  FiVideo,
  FiEdit2,
  FiHeadphones,
  FiTrendingUp,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiMessageCircle,
  FiPlay,
  FiStar,
  FiAward,
  FiUsers,
  FiPlus,
  FiMinus,
} from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useState } from 'react';
import './ComoFunciona.css';

gsap.registerPlugin(ScrollTrigger);

const ComoFunciona = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const steps = [
    { number: '01', title: 'Inscribite', desc: 'Elegí el programa de Pilates que quieras empezar hoy.', icon: <FiBook /> },
    { number: '02', title: 'Accedé', desc: 'Disfrutá de todo el contenido y videos las 24/7.', icon: <FiVideo /> },
    { number: '03', title: 'Movete', desc: 'Practicá Pilates con clases claras, guiadas y progresivas.', icon: <FiEdit2 /> },
    { number: '04', title: 'Consultá', desc: 'Recibí soporte personalizado si tenés dudas sobre tu práctica.', icon: <FiHeadphones /> },
    { number: '05', title: 'Progresá', desc: 'Sentí los cambios en tu postura, energía y bienestar día a día.', icon: <FiTrendingUp /> },
  ];

  const benefits = [
    { icon: <FiVideo />, title: 'Videos HD de calidad', desc: 'Clases grabadas con total nitidez para que veas cada detalle de cada movimiento.' },
    { icon: <FiClock />, title: 'Acceso por 30 días', desc: 'Aprendé a tu ritmo durante 30 días desde la compra, con acceso completo a todo el contenido.' },
    { icon: <FiDownload />, title: 'Material descargable', desc: 'PDFs con secuencias y guías de ejercicios listas para imprimir.' },
    { icon: <FiMessageCircle />, title: 'Soporte directo', desc: 'Respondo todas tus dudas personalmente vía WhatsApp para que nunca te trabes en tu práctica.' },
    { icon: <FiUsers />, title: 'Comunidad activa', desc: 'Conectá con otras alumnas de Pilates, compartí tus logros y unite a nuestro grupo.' },
    { icon: <FiAward />, title: 'Técnica profesional', desc: 'Dominá el método Pilates con principios claros que garantizan resultados seguros y efectivos.' },
  ];

  const faqs = [
    {
      q: '¿Necesito experiencia previa para empezar?',
      a: 'No, para nada. Las clases están diseñadas desde cero, pensadas para personas que nunca practicaron Pilates. Andrea te guía paso a paso desde los movimientos más básicos.',
    },
    {
      q: '¿Cómo accedo al contenido una vez que compro?',
      a: 'Una vez confirmado el pago, la clase aparece de inmediato en tu sección "Mis clases". Podés empezar a ver las clases en el momento que quieras, desde cualquier dispositivo.',
    },
    {
      q: '¿Por cuánto tiempo tengo acceso a la clase?',
      a: 'Por 30 días desde el momento de la compra. Durante ese período podés ver las clases cuantas veces quieras, a tu ritmo, en cualquier dispositivo.',
    },
    {
      q: '¿Puedo hacer consultas si tengo dudas mientras practico?',
      a: 'Sí. Andrea brinda soporte personalizado vía WhatsApp para que ninguna duda te frene. Estás acompañada en cada etapa de tu práctica.',
    },
    {
      q: '¿Necesito muchos elementos para practicar?',
      a: 'No. En cada clase se indica exactamente qué elementos necesitás (colchoneta, bandas, aro, etc.) y siempre se ofrecen alternativas para que puedas practicar con lo que tengas en casa.',
    },
    {
      q: '¿Las clases incluyen material en PDF?',
      a: 'Sí. Cada clase incluye guías y secuencias en PDF descargables para que puedas imprimirlas o tenerlas a mano mientras practicás.',
    },
  ];

  useEffect(() => {
    const triggers = [];

    gsap.fromTo(
      '.cf2-hero-content',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
    );

    gsap.fromTo(
      '.cf2-step-item',
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1, y: 0, scale: 1,
        stagger: 0.12, duration: 0.6, ease: 'back.out(1.3)',
        scrollTrigger: {
          trigger: '.cf2-steps-section',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      }
    );

    gsap.fromTo(
      '.cf2-benefit-card',
      { opacity: 0, y: 40, scale: 0.88 },
      {
        opacity: 1, y: 0, scale: 1,
        stagger: 0.1, duration: 0.6, ease: 'elastic.out(1, 0.75)',
        scrollTrigger: {
          trigger: '.cf2-benefits-section',
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
      }
    );

    gsap.fromTo(
      '.cf2-andrea-content',
      { opacity: 0, x: -50 },
      {
        opacity: 1, x: 0,
        duration: 0.9, ease: 'power2.out',
        scrollTrigger: {
          trigger: '.cf2-andrea-section',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      }
    );

    gsap.fromTo(
      '.cf2-andrea-visual',
      { opacity: 0, x: 50 },
      {
        opacity: 1, x: 0,
        duration: 0.9, ease: 'power2.out',
        scrollTrigger: {
          trigger: '.cf2-andrea-section',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      }
    );

    gsap.fromTo(
      '.cf2-faq-item',
      { opacity: 0, y: 25 },
      {
        opacity: 1, y: 0,
        stagger: 0.08, duration: 0.5, ease: 'power2.out',
        scrollTrigger: {
          trigger: '.cf2-faq-section',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );

    gsap.fromTo(
      '.cf2-cta-content',
      { opacity: 0, scale: 0.92, y: 30 },
      {
        opacity: 1, scale: 1, y: 0,
        duration: 0.9, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.cf2-cta-section',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );

    return () => triggers.forEach((t) => t && t.kill());
  }, []);

  return (
    <div className="cf2-page">

      {/* Hero */}
      <section className="cf2-hero-section">
        <div className="cf2-hero-content">
          <p className="cf2-hero-eyebrow">Equilibrio Pinamar</p>
          <h1 className="cf2-hero-title">¿Cómo funcionan<br />nuestras clases de Pilates?</h1>
          <p className="cf2-hero-desc">
            Todo lo que necesitás saber para empezar a practicar Pilates hoy. Sin complicaciones, sin experiencia previa, a tu ritmo.
          </p>
          <div className="cf2-hero-buttons">
            <Link to="/clases">
              <Button size="large" className="btn-primary">
                Ver Clases
                <FiArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="cf2-trust-banner">
        <div className="cf2-trust-items">
          <div className="cf2-trust-item">
            <FiMessageCircle />
            <span>Soporte directo por WhatsApp</span>
          </div>
          <div className="cf2-trust-item">
            <FiClock />
            <span>Aprendizaje a tu propio ritmo</span>
          </div>
          <div className="cf2-trust-item">
            <FiDownload />
            <span>Guías PDF descargables</span>
          </div>
          <div className="cf2-trust-item">
            <FiCheckCircle />
            <span>Acceso por 30 días</span>
          </div>
        </div>
      </section>

      {/* Pasos */}
      <section className="cf2-steps-section">
        <div className="cf2-section-container">
          <h2 className="cf2-section-title">Tu camino hacia la maestría</h2>
          <p className="cf2-section-subtitle">Un proceso simple y comprobado, paso a paso</p>
          <div className="cf2-steps-grid">
            {steps.map((step, i) => (
              <div key={i} className="cf2-step-item">
                <div className="cf2-step-icon-wrap">
                  <div className="cf2-step-icon">{step.icon}</div>
                  <div className="cf2-step-number">{step.number}</div>
                </div>
                <h3 className="cf2-step-title">{step.title}</h3>
                <p className="cf2-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Qué incluye / Beneficios */}
      <section className="cf2-benefits-section">
        <div className="cf2-section-container">
          <h2 className="cf2-section-title">¿Qué incluye cada clase?</h2>
          <p className="cf2-section-subtitle">Todo lo que necesitás para aprender está incluido</p>
          <div className="cf2-benefits-grid">
            {benefits.map((b, i) => (
              <div key={i} className="cf2-benefit-card">
                <div className="cf2-benefit-icon">{b.icon}</div>
                <h3 className="cf2-benefit-title">{b.title}</h3>
                <p className="cf2-benefit-desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Andrea - Nosotros */}
      <section className="cf2-andrea-section">
        <div className="cf2-andrea-container">
          <div className="cf2-andrea-content">
            <p className="cf2-andrea-eyebrow">Conocé a tu instructora</p>
            <h2 className="cf2-andrea-title">Soy Andrea, y el movimiento es mi vida</h2>
            <p className="cf2-andrea-text">
              Tengo 54 años y practico movimiento consciente desde que era chica. Pilates siempre fue parte de mi vida: primero como un descubrimiento personal, luego como una pasión, y hoy como una forma de compartir, conectar y acompañar a otras personas.
            </p>
            <p className="cf2-andrea-text">
              Estoy creando clases simples, claras y accesibles para todos. Creo profundamente que cualquiera puede empezar a moverse mejor, sin importar la edad o la experiencia previa.
            </p>
            <p className="cf2-andrea-text">
              Para mí, Pilates es un momento de calma y presencia, una pausa en el día. Mi deseo es que, a través de estas clases, puedas cuidar tu cuerpo, tu mente y regalarte ese momento tan especial para vos.
            </p>
            <div className="cf2-andrea-values">
              <span className="cf2-value-tag">Pasión</span>
              <span className="cf2-value-tag">Compromiso</span>
              <span className="cf2-value-tag">Comunidad</span>
              <span className="cf2-value-tag">30 años de experiencia</span>
            </div>
          </div>
          <div className="cf2-andrea-visual">
            <img src="/img/andy-instructor.jpg" alt="Nadia - Instructora de Pilates de Equilibrio Pinamar" className="cf2-andrea-img" />
          </div>
        </div>
      </section>

      {/* Comprar con confianza */}
      <section className="cf2-trust-section">
        <div className="cf2-section-container">
          <h2 className="cf2-section-title">Comprá con confianza</h2>
          <p className="cf2-section-subtitle">
            Tu tranquilidad es lo primero. Por eso trabajamos con pagos seguros y políticas claras.
          </p>
          <div className="cf2-trust-cards">
            <div className="cf2-trust-card">
              <div className="cf2-trust-card-icon"><FiShield /></div>
              <h4>Pago 100% seguro</h4>
              <p>Tu información de pago está protegida. No guardamos datos de tarjetas en nuestros servidores.</p>
            </div>
            <div className="cf2-trust-card">
              <div className="cf2-trust-card-icon"><FiCheckCircle /></div>
              <h4>Acceso inmediato</h4>
              <p>Una vez confirmado el pago, la clase queda disponible en tu cuenta al instante. Empezá hoy.</p>
            </div>
            <div className="cf2-trust-card">
              <div className="cf2-trust-card-icon"><FiMessageCircle /></div>
              <h4>Soporte humano</h4>
              <p>Ante cualquier duda antes o después de comprar, podés escribirme y te respondo personalmente.</p>
            </div>
            <div className="cf2-trust-card">
              <div className="cf2-trust-card-icon"><FiStar /></div>
              <h4>Calidad garantizada</h4>
              <p>Cada clase está pensado, grabado y editado con cuidado para que el aprendizaje sea claro y efectivo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="cf2-faq-section">
        <div className="cf2-section-container cf2-faq-container">
          <h2 className="cf2-section-title">Preguntas frecuentes</h2>
          <p className="cf2-section-subtitle">Las dudas más comunes, resueltas</p>
          <div className="cf2-faq-list">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`cf2-faq-item ${openFaq === i ? 'cf2-faq-open' : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="cf2-faq-question">
                  <span>{faq.q}</span>
                  {openFaq === i ? <FiMinus /> : <FiPlus />}
                </div>
                {openFaq === i && (
                  <div className="cf2-faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cf2-cta-section">
        <div className="cf2-cta-content">
          <h2 className="cf2-cta-title">¿Lista para empezar a moverte mejor?</h2>
          <p className="cf2-cta-text">
            Únete a nuestra comunidad de alumnas de Pilates y descubrí el placer de habitar tu cuerpo con conciencia.<br />
            <strong>Inscribite hoy y accedé de inmediato a todo el contenido.</strong>
          </p>
          <Link to="/clases">
            <Button size="large" className="btn-cta-final">
              Comenzar Ahora
              <FiArrowRight />
            </Button>
          </Link>
          <p className="cf2-cta-disclaimer">
            <FiCheckCircle /> Soporte por WhatsApp · 30 días de acceso · Guías PDF incluidas
          </p>
        </div>
      </section>

    </div>
  );
};

export default ComoFunciona;
