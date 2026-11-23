import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const useReviews = (organizerId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!organizerId) return;
    let isMounted = true;
    setLoading(true);
    setError('');
    api.getReviews(organizerId).then((data) => {
      if (isMounted) setReviews(data);
    }).catch((requestError) => {
      if (isMounted) setError(requestError.message || 'No se pudieron cargar las reseñas.');
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [organizerId]);

  return { reviews, loading, error };
};
