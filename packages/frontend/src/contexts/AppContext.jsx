/* eslint-disable react/prop-types */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { INITIAL_USERS } from '../data/initialData.js';
import { canCancelPurchase } from '../utils/purchases.js';

const AppContext = createContext(null);
const demoForRole = (role) => INITIAL_USERS.find((user) => user.role === role);
const usuarioUI = (usuario, demo) => ({ ...demo, id: usuario.id, name: `${usuario.nombre} ${usuario.apellido}`.trim(), role: usuario.rol === 'organizador' ? 'organizer' : 'buyer' });

export const AppProvider = ({ children }) => {
  const [currentRole, setRoleState] = useState('buyer');
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]);
  const [events, setEvents] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [activeQR, setActiveQR] = useState(null);
  const [toast, setToast] = useState(null);
  const [favorites, setFavorites] = useState(['sonora-2025']);
  const [ready, setReady] = useState(false);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const loadEvents = useCallback(async (filters = {}) => {
    const list = await api.getEvents(filters);
    setEvents(list);
    return list;
  }, []);

  const loadPurchases = useCallback(async () => {
    if (currentRole !== 'buyer') return [];
    const list = await api.getPurchases();
    setPurchases(list);
    return list;
  }, [currentRole]);

  const setUser = useCallback(async (userId) => {
    const selected = INITIAL_USERS.find((user) => user.id === userId);
    if (!selected) return;
    setRoleState(selected.role);
    try {
      const backendUser = await api.authenticateDemo(selected.role);
      setCurrentUser(usuarioUI(backendUser, selected));
      setReady(true);
      await loadEvents();
      if (selected.role === 'buyer') await api.getPurchases().then(setPurchases);
      else setPurchases([]);
      return true;
    } catch (error) {
      showToast(error.message || 'No se pudo conectar con el backend', 'error');
      return false;
    }
  }, [loadEvents, showToast]);

  const setRole = useCallback((role) => setRoleState(role), []);

  useEffect(() => { void setUser(INITIAL_USERS[0].id); }, [setUser]);

  const toggleFavorite = useCallback((eventId) => {
    setFavorites((prev) => prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]);
  }, []);

  const buyTicket = useCallback(async ({ eventId, tierId, quantity }) => {
    const purchase = await api.createPurchase({ eventId, tierId, quantity });
    await Promise.all([loadPurchases(), loadEvents()]);
    showToast('¡Compra realizada correctamente!', 'success');
    return purchase;
  }, [loadEvents, loadPurchases, showToast]);

  const cancelPurchase = useCallback(async (purchaseId) => {
    const target = purchases.find((purchase) => purchase.id === purchaseId);
    if (!canCancelPurchase(target)) {
      showToast('Esta compra ya no puede cancelarse', 'warning');
      return null;
    }
    try {
      const purchase = await api.cancelPurchase(purchaseId);
      await Promise.all([loadPurchases(), loadEvents()]);
      showToast('Compra cancelada correctamente', 'success');
      return purchase;
    } catch (error) {
      showToast(error.message || 'No se pudo cancelar la compra', 'error');
      return null;
    }
  }, [purchases, loadPurchases, loadEvents, showToast]);

  const markPurchaseUsed = useCallback(async (purchaseId) => {
    const result = await api.markPurchaseUsed(purchaseId);
    await loadEvents();
    showToast('Entrada validada como utilizada', 'success');
    return result;
  }, [loadEvents, showToast]);

  return (
    <AppContext.Provider value={{
      currentRole, setRole, currentUser, setUser, users: INITIAL_USERS,
      events, loadEvents, purchases, loadPurchases, buyTicket, markPurchaseUsed,
      cancelPurchase, activeQR, setActiveQR, toast, showToast, favorites,
      toggleFavorite, ready,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
