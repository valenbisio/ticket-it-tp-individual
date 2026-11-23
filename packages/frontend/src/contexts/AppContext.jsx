/* eslint-disable react/prop-types */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from './auth-context.jsx';
import { api } from '../services/api.js';
import { INITIAL_USERS } from '../data/initialData.js';
import { canCancelPurchase } from '../utils/purchases.js';

const AppContext = createContext(null);
const usuarioUI = (usuario, demo) => ({ ...demo, id: usuario.id, name: `${usuario.nombre} ${usuario.apellido}`.trim(), role: usuario.rol === 'organizador' ? 'organizer' : 'buyer' });

export const AppProvider = ({ children }) => {
  const router = useRouter();
  const auth = useAuth();
  const [currentRole, setRoleState] = useState('buyer');
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [activeQR, setActiveQR] = useState(null);
  const [toast, setToast] = useState(null);
  const [favorites, setFavorites] = useState(['sonora-2025']);
  const [ready, setReady] = useState(false);
  const routedUserId = useRef(null);
  const eventsRequestId = useRef(0);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const loadEvents = useCallback(async (filters = {}) => {
    const requestId = ++eventsRequestId.current;
    setEventsLoading(true);
    try {
      const list = await api.getEvents(filters);
      if (requestId === eventsRequestId.current) setEvents(list);
      return list;
    } finally {
      if (requestId === eventsRequestId.current) setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auth.estado || auth.estado === 'cargando') return;
    const session = auth.estado;
    const demo = INITIAL_USERS.find((user) => user.role === (session.usuario.rol === 'organizador' ? 'organizer' : 'buyer')) || INITIAL_USERS[0];
    const role = session.usuario.rol === 'organizador' ? 'organizer' : 'buyer';
    setRoleState(role);
    setCurrentUser(usuarioUI(session.usuario, demo));
    if (routedUserId.current === session.usuario.id) return;
    routedUserId.current = session.usuario.id;
    const destination = role === 'organizer' ? '/(organizer)/events' : '/(buyer)/explore';
    void (async () => {
      try {
        await loadEvents();
        if (role === 'buyer') {
          setPurchasesLoading(true);
          try {
            setPurchases(await api.getPurchases());
          } finally {
            setPurchasesLoading(false);
          }
        }
        else setPurchases([]);
        setReady(true);
        if (router.canDismiss?.()) router.dismissAll();
        router.replace(destination);
      } catch (error) {
        showToast(error.message || 'No se pudieron cargar tus datos', 'error');
      }
    })();
  }, [auth.estado, loadEvents, router, showToast]);

  const loadPurchases = useCallback(async () => {
    if (currentRole !== 'buyer') return [];
    setPurchasesLoading(true);
    try {
      const list = await api.getPurchases();
      setPurchases(list);
      return list;
    } finally {
      setPurchasesLoading(false);
    }
  }, [currentRole]);

  const markPurchaseRated = useCallback((purchaseId) => {
    setPurchases((actuales) => actuales.map((purchase) => (
      purchase.id === purchaseId ? { ...purchase, hasRated: true } : purchase
    )));
  }, []);

  const setUser = useCallback(async (userId) => {
    const selected = INITIAL_USERS.find((user) => user.id === userId);
    if (!selected) return;
    setRoleState(selected.role);
    try {
      await auth.iniciarSesion(selected.role === 'organizer' ? 'sala@demo.local' : 'buyer@demo.local', 'demo1234');
      return true;
    } catch (error) {
      showToast(error.message || 'No se pudo conectar con el backend', 'error');
      return false;
    }
  }, [auth, showToast]);

  const setRole = useCallback((role) => setRoleState(role), []);

  const cerrarSesion = useCallback(async () => {
    await auth.cerrarSesion();
    routedUserId.current = null;
    setReady(false);
    setPurchases([]);
    router.replace('/');
  }, [auth, router]);

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
      currentRole, setRole, currentUser, setUser, cerrarSesion, users: INITIAL_USERS,
      events, eventsLoading, loadEvents, purchases, loadPurchases, purchasesLoading, buyTicket, markPurchaseUsed,
      cancelPurchase, markPurchaseRated, activeQR, setActiveQR, toast, showToast, favorites,
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
