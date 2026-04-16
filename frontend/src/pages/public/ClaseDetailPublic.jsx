import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiCheck, FiX, FiClock, FiArrowRight, FiArrowLeft,
} from 'react-icons/fi';
import { clasesAPI } from '../../api/clases';
import { usePayment } from '../../hooks/usePayment';
import { useAuth } from '../../hooks/useAuth';
import ClaseDetail from '../../clases/ClaseDetail';
import Loader from '../../components/common/Loader';
import gsap from 'gsap';
import './ClaseDetailPublic.css';

/* ─────────────────────────────────────────────────────────────────
   PAYMENT BANNER
───────────────────────────────────────────────────────────────── */

function PaymentBanner({ result, bannerRef, onDismiss, onAction }) {
  const cls =
    result.status === 'approved' ? 'cdp-banner--approved'
    : result.status === 'pending' ? 'cdp-banner--pending'
    : 'cdp-banner--rejected';

  return (
    <div ref={bannerRef} className={`cdp-banner ${cls}`}>
      <div className="cdp-banner__inner">
        <span className="cdp-banner__icon" aria-hidden="true">
          {result.status === 'approved' ? <FiCheck /> : <FiClock />}
          <span className="cdp-banner__pulse" />
        </span>

        <div className="cdp-banner__body">
          <p className="cdp-banner__title">{result.title}</p>
          <p className="cdp-banner__msg">{result.message}</p>
        </div>

        {onAction && (
          <button className="cdp-banner__action" onClick={onAction.onClick}>
            {onAction.text} <FiArrowRight size={13} />
          </button>
        )}

        <button
          className="cdp-banner__close"
          onClick={onDismiss}
          aria-label="Cerrar notificación"
        >
          <FiX size={15} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   NOT FOUND
───────────────────────────────────────────────────────────────── */

function ClaseNotFound({ onBack }) {
  return (
    <div className="cdp-notfound">
      <div className="cdp-notfound__card">
        <span className="cdp-notfound__symbol" aria-hidden="true">✦</span>
        <h2 className="cdp-notfound__title">Clase no encontrada</h2>
        <p className="cdp-notfound__msg">
          La clase que buscás no existe o fue eliminado.
        </p>
        <button className="cdp-notfound__btn" onClick={onBack}>
          <FiArrowLeft size={14} /> Volver al catálogo
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────────────── */

const ClaseDetailPublic = () => {
  const { slug }                          = useParams();
  const navigate                          = useNavigate();
  const [searchParams]                    = useSearchParams();
  const { isAuthenticated }               = useAuth();
  const { createPayment, checkPendingPayment, cancelPolling, loading: paymentLoading } = usePayment();

  const [clase, setClase]               = useState(null);
  const [hasAccess, setHasAccess]         = useState(false);
  const [loading, setLoading]             = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});

  const bannerRef = useRef(null);

  /* ── Carga inicial ── */
  useEffect(() => {
    loadClaseDetail();
    checkReturnFromPayment();
    return () => cancelPolling();
  }, [slug]);

  /* ── Animar banner de pago ── */
  useEffect(() => {
    if (paymentResult && bannerRef.current) {
      gsap.fromTo(bannerRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'expo.out' }
      );
    }
  }, [paymentResult]);

  /* ── Fade entrada del contenido ── */
  useEffect(() => {
    if (!loading && clase) {
      gsap.fromTo('.cdp-page',
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [loading, clase]);

  const loadClaseDetail = async () => {
    try {
      setLoading(true);
      const data = await clasesAPI.getClaseBySlug(slug);
      setClase(data);

      if (isAuthenticated) {
        const accessData = await clasesAPI.checkClaseAccess(data.id);
        setHasAccess(accessData.has_access);

        if (accessData.has_access) {
          try {
            const progressData = await clasesAPI.getLessonProgress(data.id);
            const list = Array.isArray(progressData) ? progressData : (progressData?.results ?? []);
            const map = {};
            list.forEach(p => { map[p.lesson] = p; });
            setLessonProgress(map);
          } catch { /* silencioso */ }
        }
      }
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  };

  const checkReturnFromPayment = async () => {
    const status = searchParams.get('status');
    if (status && isAuthenticated) {
      const payment = await checkPendingPayment();
      if (payment) {
        setPaymentResult(payment);
        if (payment.status === 'approved') setHasAccess(true);
      }
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/clases/${slug}` } });
      return;
    }

    const result = await createPayment(clase.id, { openInPopup: true });

    if (result.success) {
      if (result.status === 'approved') {
        setHasAccess(true);
        setPaymentResult({
          status: 'approved',
          title: '¡Felicitaciones!',
          message: '¡Pago aprobado! Ya tenés acceso a la clase.',
        });
        loadClaseDetail();
      } else if (result.status === 'rejected') {
        setPaymentResult({
          status: 'rejected',
          title: 'Pago rechazado',
          message: 'El pago fue rechazado. Intentá con otro medio de pago.',
        });
      } else {
        setPaymentResult({
          status: 'pending',
          title: 'Pago pendiente',
          message: 'No pudimos verificar el pago automáticamente. Revisá tu email o "Mis Clases".',
        });
      }
    } else {
      setPaymentResult({
        status: 'error',
        title: 'Error en el pago',
        message: result.error || 'Ocurrió un error. Por favor intentá nuevamente.',
      });
    }
  };

  const dismissBanner = () => {
    gsap.to(bannerRef.current, {
      y: -80, opacity: 0, duration: 0.35, ease: 'power2.in',
      onComplete: () => {
        setPaymentResult(null);
        navigate(`/clases/${slug}`, { replace: true });
      },
    });
  };

  const getBannerAction = (status) => {
    if (status === 'approved') return {
      text: 'Ver contenido',
      onClick: () => {
        dismissBanner();
        document.querySelector('.cd-content')?.scrollIntoView({ behavior: 'smooth' });
      },
    };
    if (status === 'rejected' || status === 'error') return {
      text: 'Intentar de nuevo',
      onClick: () => { dismissBanner(); handlePurchase(); },
    };
    if (status === 'pending') return {
      text: 'Ir a Mis Clases',
      onClick: () => navigate('/mis-clases'),
    };
    return null;
  };

  /* ── Render ── */
  if (loading) return <Loader fullScreen />;

  if (!clase) return <ClaseNotFound onBack={() => navigate('/clases')} />;

  return (
    <div className="cdp-page">
      {paymentResult && (
        <PaymentBanner
          result={paymentResult}
          bannerRef={bannerRef}
          onDismiss={dismissBanner}
          onAction={getBannerAction(paymentResult.status)}
        />
      )}

      <ClaseDetail
        clase={clase}
        hasAccess={hasAccess}
        onPurchase={handlePurchase}
        loading={paymentLoading}
        progress={lessonProgress}
      />
    </div>
  );
};

export default ClaseDetailPublic;