import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import RegisterForm from '../../components/auth/RegisterForm';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import { FiArrowRight, FiCheck, FiShield, FiClock, FiAward } from 'react-icons/fi';
import gsap from 'gsap';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo('.auth-left',
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.auth-right',
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.6'
    )
    .fromTo('.feature-card',
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.5, ease: 'back.out(1.2)' },
      '-=0.4'
    );
    return () => tl.kill();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError('');
      const result = await register(formData);
      if (result.success) {
        gsap.to('.auth-right', {
          scale: 0.98,
          opacity: 0.5,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => navigate('/'),
        });
      } else {
        setError(result.error);
        gsap.fromTo('.auth-form-container',
          { x: -10 },
          { x: 10, duration: 0.1, repeat: 3, yoyo: true, ease: 'power1.inOut' }
        );
      }
    } catch (err) {
      setError('Error al crear la cuenta. Por favor intenta nuevamente.');
      gsap.fromTo('.auth-form-container',
        { x: -10 },
        { x: 10, duration: 0.1, repeat: 3, yoyo: true, ease: 'power1.inOut' }
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <FiClock />,  title: 'Acceso de por vida',  description: 'Aprendé a tu ritmo sin vencimientos' },
    { icon: <FiAward />,  title: 'Certificado incluido', description: 'Validá tus nuevas habilidades' },
    { icon: <FiShield />, title: 'Garantía 30 días',     description: 'Probá sin riesgo' },
  ];

  const steps = [
    { number: '1', text: 'Creá tu cuenta' },
    { number: '2', text: 'Elegí tu curso' },
    { number: '3', text: 'Comenzá a aprender' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="floating-shape shape-1" />
        <div className="floating-shape shape-2" />
        <div className="floating-shape shape-3" />
      </div>

      <div className="auth-container">
        <div className="auth-grid">

          {/* ── LEFT ── */}
          <div className="auth-left">

            <div className="auth-brand">
              <div className="brand-icon">
                <svg width="28" height="28" viewBox="0 0 60 60" fill="none">
                  <circle cx="30" cy="30" r="28" fill="white" fillOpacity="0.15"/>
                  <path d="M30 15L35 25H25L30 15Z" fill="white"/>
                  <path d="M30 45L35 35H25L30 45Z" fill="white"/>
                  <circle cx="30" cy="30" r="5" fill="white"/>
                </svg>
              </div>
              <h1 className="brand-title">Equilibrio<br />Pinamar</h1>
              <p className="brand-tagline">Transformá tu cuerpo con movimiento consciente</p>
            </div>

            <div className="register-value">
              <p className="value-title">Comenzá tu práctica hoy</p>
              <p className="value-text">
                Unite a más de 500 alumnas que ya están practicando Pilates y construyendo un hábito de bienestar diario.
              </p>
            </div>

            <div className="register-steps">
              <p className="steps-title">Es muy simple:</p>
              <div className="steps-list">
                {steps.map((step, index) => (
                  <div key={index} className="step-item">
                    <div className="step-number">{step.number}</div>
                    <span className="step-text">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="auth-features">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-content">
                    <h4 className="feature-title">{feature.title}</h4>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="trust-badges">
              <div className="trust-badge"><FiCheck /><span>Sin tarjeta de crédito</span></div>
              <div className="trust-badge"><FiShield /><span>100% seguro</span></div>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="auth-right">
            <div className="auth-form-container">

              <div className="form-header">
                <h2 className="form-title">Creá tu<br />cuenta gratis</h2>
                <p className="form-subtitle">Empezá a aprender en menos de 2 minutos</p>
              </div>

              <RegisterForm onSubmit={handleSubmit} loading={loading} error={error} />

              <div className="form-divider">
                <span>O registrate con</span>
              </div>

              <div className="social-login social-login-single">
                <GoogleLoginButton
                  onSuccess={async (credential) => {
                    setGoogleError('');
                    const result = await loginWithGoogle(credential);
                    if (result.success) {
                      gsap.to('.auth-right', {
                        scale: 0.98,
                        opacity: 0.5,
                        duration: 0.3,
                        ease: 'power2.in',
                        onComplete: () => navigate('/'),
                      });
                    } else {
                      setGoogleError(result.error);
                    }
                  }}
                  onError={(msg) => setGoogleError(msg)}
                  disabled={loading}
                />
                {googleError && <p className="social-error">{googleError}</p>}
              </div>

              <div className="form-footer">
                <p className="footer-text">
                  ¿Ya tenés cuenta?{' '}
                  <Link to="/login" className="footer-link">
                    Iniciá sesión <FiArrowRight />
                  </Link>
                </p>
              </div>

              <p className="terms-text">
                Al registrarte aceptás nuestros{' '}
                <a href="/terms" className="terms-link">Términos de Servicio</a>
                {' '}y{' '}
                <a href="/privacy" className="terms-link">Política de Privacidad</a>
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;