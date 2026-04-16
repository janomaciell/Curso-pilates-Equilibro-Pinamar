import { useState, useEffect } from 'react';
import { clasesAPI } from '../api/clases';

export const useClases = (filters = {}) => {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClases();
  }, [JSON.stringify(filters)]);

  const fetchClases = async () => {
    try {
      setLoading(true);
      const data = await clasesAPI.getAllClases(filters);
      setClases(data.results || data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { clases, loading, error, refetch: fetchClases };
};