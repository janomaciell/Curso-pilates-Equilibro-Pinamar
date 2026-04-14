import { useState, useEffect } from 'react';

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

const TestimonialsSection = ({ SplitWords }) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActiveTestimonial(p => (p + 1) % communityTestimonials.length),
      6000
    );
    return () => clearInterval(id);
  }, []);

  return (
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
                onClick={() => setActiveTestimonial(idx)}
                style={{ cursor: 'pointer' }}
              >
                <p>"{t.text}"</p>
                <span>— {t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
