import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const useReviews = (organizerId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizerId) return;
    let isMounted = true;
    api.getReviews(organizerId).then((data) => {
      if (isMounted) {
        setReviews(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [organizerId]);

  return { reviews, loading };
};
