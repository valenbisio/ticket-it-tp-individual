import { useApp } from '../contexts/AppContext.jsx';

export const useEvents = () => {
  const { events, loadEvents, favorites, toggleFavorite } = useApp();
  return { events, loadEvents, favorites, toggleFavorite };
};
