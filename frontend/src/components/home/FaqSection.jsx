import { useState } from 'react';

const faqs = [
  {
    q: '¿Cómo puedo acceder a las clases?',
    a: 'Solo necesitas crear tu cuenta y comprar la clase que quieras realizar. Una vez adquirida, tendrás acceso inmediato a todas las clases incluidas en esa clase para realizarlas a tu propio ritmo desde tu navegador o dispositivo.',
  },
  {
    q: 'Soy nueva en Pilates, ¿por dónde empiezo?',
    a: 'Si es tu primera vez, te recomendamos comenzar con una clase para principiantes. Estos programas están diseñados para enseñarte los fundamentos del Pilates paso a paso: respiración, alineación y activación del core.',
  },
  {
    q: '¿Cómo funcionan los pagos?',
    a: 'Nuestras clases se compran de forma individual. Cada clase tiene su propio precio y, una vez que la adquieres, puedes acceder a todas sus clases sin necesidad de pagar una suscripción mensual.',
  },
  {
    q: '¿Hay clases de Pilates prenatal?',
    a: 'Sí. Disponemos de clases diseñadas especialmente para acompañarte durante el embarazo, con ejercicios suaves y seguros enfocados en movilidad, respiración y bienestar.',
  },
  {
    q: '¿Necesito equipamiento para practicar?',
    a: 'La mayoría de las clases se pueden realizar solo con una colchoneta. Algunas clases pueden incluir accesorios opcionales como bandas elásticas, pelota o aro de Pilates, pero no son obligatorios para empezar.',
  },
  {
    q: '¿Cuántas veces por semana debería practicar?',
    a: 'Para notar resultados, recomendamos practicar entre 3 y 5 veces por semana. La constancia es más importante que la duración de cada sesión, y con el tiempo notarás mejoras en tu fuerza, postura y movilidad.',
  },
];

const FaqSection = () => {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="faq-section">
      <div className="container faq-container">
        <div className="faq-block fade-up">
          <p className="overline faq-overline">Preguntas frecuentes</p>
          <h2 className="h2 faq-title">FAQ</h2>
        </div>
        <div className="faq-list">
          {faqs.map((item, idx) => (
            <div
              key={idx}
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
  );
};

export default FaqSection;
