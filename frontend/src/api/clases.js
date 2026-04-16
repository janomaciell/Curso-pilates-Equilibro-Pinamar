import api from './axios';

export const clasesAPI = {
  getAllClases: async (params = {}) => {
    const response = await api.get('/clases/', { params });
    return response.data;
  },

  getClaseBySlug: async (slug) => {
    const response = await api.get(`/clases/${slug}/`);
    return response.data;
  },

  getFeaturedClases: async () => {
    const response = await api.get('/clases/featured/');
    return response.data;
  },

  checkClaseAccess: async (claseId) => {
    const response = await api.get(`/clases/${claseId}/check_access/`);
    return response.data;
  },

  getClaseModules: async (claseId) => {
    const response = await api.get(`/clases/${claseId}/modules/`);
    return response.data;
  },

  getLessonDetail: async (lessonId) => {
    const response = await api.get(`/clases/lessons/${lessonId}/`);
    return response.data;
  },

  getLessonProgress: async (claseId) => {
    const response = await api.get(`/clases/progress/by_clase/`, {
      params: { clase_id: claseId }
    });
    return response.data;
  },

  updateLessonProgress: async (progressData) => {
    const response = await api.post('/clases/progress/', progressData);
    return response.data;
  },

  getLessonDocuments: async (lessonId) => {
    const response = await api.get(`/clases/lessons/${lessonId}/documents/`);
    return response.data;
  },

  getCategoryStats: async () => {
    const response = await api.get('/clases/category-stats/');
    return response.data;
  },
};