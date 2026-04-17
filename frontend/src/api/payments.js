import api from './axios';

export const paymentsAPI = {
  /**
   * Crear preferencia de pago.
   * `claseIds` puede ser un número (una clase) o un array de números (carrito).
   */
  createPayment: async (claseIds) => {
    const ids = Array.isArray(claseIds) ? claseIds : [claseIds];
    const response = await api.post('/payments/create/', { clase_ids: ids });
    return response.data;
  },

  checkPreferenceStatus: async (preferenceId) => {
    const response = await api.get(`/payments/check-preference/${preferenceId}/`);
    return response.data;
  },

  getPaymentStatus: async (paymentId) => {
    const response = await api.get(`/payments/status/${paymentId}/`);
    return response.data;
  },

  getTransactions: async () => {
    const response = await api.get('/payments/transactions/');
    return response.data;
  },

  getMyClases: async () => {
    const response = await api.get('/payments/my-clases/');
    return response.data;
  }
};