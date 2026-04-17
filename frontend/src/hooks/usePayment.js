import { useState, useRef } from 'react';
import { paymentsAPI } from '../api/payments';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);

  /**
   * Hacer polling del estado de pago consultando el backend
   * que a su vez consulta a Mercado Pago
   */
  const pollPaymentStatus = async (preferenceId, maxAttempts = 40) => {
    return new Promise((resolve) => {
      let attempts = 0;

      pollingIntervalRef.current = setInterval(async () => {
        attempts++;

        console.log(`[Polling ${attempts}/${maxAttempts}] Consultando estado del pago...`);

        try {
          const data = await paymentsAPI.checkPreferenceStatus(preferenceId);

          console.log('[Polling] Estado actual:', data.status);

          if (data.status === 'approved') {
            clearInterval(pollingIntervalRef.current);
            resolve({ success: true, status: 'approved', data });
          } else if (data.status === 'rejected') {
            clearInterval(pollingIntervalRef.current);
            resolve({ success: false, status: 'rejected', data });
          } else if (data.status === 'cancelled') {
            clearInterval(pollingIntervalRef.current);
            resolve({ success: false, status: 'cancelled', data });
          }

          if (attempts >= maxAttempts) {
            console.log('[Polling] Timeout alcanzado');
            clearInterval(pollingIntervalRef.current);
            resolve({ success: false, status: 'timeout' });
          }
        } catch (err) {
          console.error('[Polling] Error:', err);
        }
      }, 3000); // Cada 3 segundos
    });
  };

  /**
   * Utilidad interna para abrir popup de MP y esperar resultado.
   * Usada tanto por createPayment como createCartPayment.
   */
  const _openMPFlow = async (paymentDataPromise, options = {}) => {
    let paymentWindow = null;
    if (options.openInPopup) {
      paymentWindow = window.open('about:blank', 'MercadoPago', 'width=800,height=600,scrollbars=yes');
    }

    try {
      setLoading(true);
      setError(null);

      const paymentData = await paymentDataPromise;

      console.log('[Payment] Preferencia creada:', paymentData);

      const paymentUrl = paymentData.sandbox
        ? (paymentData.sandbox_init_point || paymentData.init_point)
        : (paymentData.init_point || paymentData.sandbox_init_point);

      if (options.openInPopup) {
        if (paymentWindow && !paymentWindow.closed) {
          paymentWindow.location.href = paymentUrl;
        } else {
          console.warn('[Payment] El popup fue bloqueado. Redirigiendo en la misma pestaña...');
          localStorage.setItem('pending_payment_preference_id', paymentData.preference_id);
          window.location.href = paymentUrl;
          return { success: true, data: paymentData };
        }

        const result = await pollPaymentStatus(paymentData.preference_id);

        if (paymentWindow && !paymentWindow.closed) {
          paymentWindow.close();
        }

        return {
          success: result.success,
          status: result.status,
          data: result.data || paymentData
        };
      } else {
        localStorage.setItem('pending_payment_preference_id', paymentData.preference_id);
        window.location.href = paymentUrl;
        return { success: true, data: paymentData };
      }

    } catch (err) {
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }
      const message = err.response?.data?.error || err.message || 'Error al crear el pago';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear pago para una sola clase (mantiene compatibilidad)
   */
  const createPayment = async (claseId, options = {}) => {
    return _openMPFlow(
      paymentsAPI.createPayment([claseId]),
      options
    );
  };

  /**
   * Crear pago del carrito con múltiples clases
   */
  const createCartPayment = async (claseIds, options = {}) => {
    return _openMPFlow(
      paymentsAPI.createPayment(claseIds),
      options
    );
  };

  /**
   * Verificar si hay un pago pendiente (útil después de volver de MP)
   */
  const checkPendingPayment = async () => {
    const preferenceId = localStorage.getItem('pending_payment_preference_id');

    if (!preferenceId) {
      return null;
    }

    try {
      const data = await paymentsAPI.checkPreferenceStatus(preferenceId);

      if (data.status !== 'pending') {
        localStorage.removeItem('pending_payment_preference_id');
      }

      return data;
    } catch (err) {
      console.error('[Payment] Error checking pending payment:', err);
      return null;
    }
  };

  /**
   * Cancelar el polling en caso de que el usuario cierre el componente
   */
  const cancelPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  return {
    createPayment,
    createCartPayment,
    checkPendingPayment,
    cancelPolling,
    loading,
    error
  };
};