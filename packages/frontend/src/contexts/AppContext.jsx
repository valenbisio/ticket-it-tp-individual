/* eslint-disable react/prop-types */
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_USERS,
  INITIAL_EVENTS,
  INITIAL_PURCHASES,
  INITIAL_CHATS,
  INITIAL_REVIEWS,
} from '../data/initialData.js';

const AppContext = createContext(null);

const STORAGE_KEY = 'ai_ticket_it_state_v2';

const eventoYaRealizado = (fecha) => {
  if (!fecha) return true;
  const [year, month, day] = fecha.split('-').map(Number);
  if (!year || !month || !day) return true;
  const fechaEvento = new Date(year, month - 1, day);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fechaEvento < hoy;
};

export const AppProvider = ({ children }) => {
  const [users] = useState(INITIAL_USERS);
  const [currentRole, setCurrentRole] = useState('buyer');
  const [currentUserId, setCurrentUserId] = useState('juan');

  const [currentScreen, setCurrentScreen] = useState('role_select');
  const [history, setHistory] = useState(['role_select']);
  const [selectedEventId, setSelectedEventId] = useState('sonora-2025');
  const [selectedPurchaseId, setSelectedPurchaseId] = useState('TK-8492');

  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_events');
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [purchases, setPurchases] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_purchases');
      return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
    } catch {
      return INITIAL_PURCHASES;
    }
  });

  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_chats');
      return saved ? JSON.parse(saved) : INITIAL_CHATS;
    } catch {
      return INITIAL_CHATS;
    }
  });

  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [favorites, setFavorites] = useState(['sonora-2025']);
  const [toast, setToast] = useState(null);
  const [qrModalPurchase, setQrModalPurchase] = useState(null);
  const [deviceFrameMode, setDeviceFrameMode] = useState(true);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_events', JSON.stringify(events));
    } catch {}
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_purchases', JSON.stringify(purchases));
    } catch {}
  }, [purchases]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_chats', JSON.stringify(chats));
    } catch {}
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_reviews', JSON.stringify(reviews));
    } catch {}
  }, [reviews]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, visible: false } : null));
    }, 2800);
  };

  const setRole = (role) => {
    setCurrentRole(role);
    if (role === 'organizer' && currentUserId !== 'salanorte') {
      setCurrentUserId('salanorte');
    } else if (role === 'buyer' && currentUserId === 'salanorte') {
      setCurrentUserId('juan');
    }
  };

  const setUser = (userId) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
      setCurrentRole(found.role);
    }
  };

  const navigateTo = (screen, params = {}) => {
    if (params.eventId) setSelectedEventId(params.eventId);
    if (params.purchaseId) setSelectedPurchaseId(params.purchaseId);
    setHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (history.length > 1) {
      const nextHistory = [...history];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1];
      setHistory(nextHistory);
      setCurrentScreen(prevScreen);
    } else {
      if (currentRole === 'buyer') {
        setCurrentScreen('buyer_explore');
      } else {
        setCurrentScreen('organizer_events');
      }
    }
  };

  const toggleFavorite = (eventId) => {
    setFavorites((prev) => {
      const isFav = prev.includes(eventId);
      if (isFav) {
        showToast('Eliminado de favoritos', 'info');
        return prev.filter((id) => id !== eventId);
      } else {
        showToast('Guardado en favoritos ❤️', 'success');
        return [...prev, eventId];
      }
    });
  };

  const createPurchase = (
    eventId,
    tierId,
    quantity,
    paymentStatus = 'confirmada'
  ) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return null;

    if (!Number.isInteger(quantity) || quantity < 1) {
      showToast('La cantidad de entradas debe ser un número válido', 'error');
      return null;
    }

    if (ev.status !== 'active' || eventoYaRealizado(ev.date)) {
      showToast('Este evento ya no está disponible para la compra', 'error');
      return null;
    }

    const tier = ev.tiers.find((t) => t.id === tierId);
    if (!tier) return null;

    if (tier.soldCount + quantity > tier.totalQuota) {
      showToast('No hay suficiente cupo disponible', 'error');
      return null;
    }

    // Update tier sold quota
    setEvents((prev) => prev.map((e) => {
      if (e.id !== eventId) return e;
      return {
        ...e,
        tiers: e.tiers.map((t) =>
          t.id === tierId ? { ...t, soldCount: t.soldCount + quantity } : t
        ),
      };
    }));

    const newPurchaseId = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPurchase = {
      id: newPurchaseId,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerAvatar: currentUser.avatar,
      eventId: ev.id,
      eventName: ev.name,
      eventDate: ev.date,
      eventDisplayDate: ev.displayDate,
      venue: ev.venue,
      organizerId: ev.organizerId,
      organizerName: ev.organizerName,
      tierId: tier.id,
      tierName: tier.name,
      quantity,
      unitPrice: tier.price,
      totalPrice: tier.price * quantity,
      status: paymentStatus,
      purchaseDate: new Date().toISOString().split('T')[0],
      qrCodeToken: `AIT-${ev.name.replace(/\s+/g, '').toUpperCase().slice(0, 6)}-${newPurchaseId}-SECURE`,
      hasRated: false,
      expiresIn: paymentStatus === 'pendiente' ? '2h 00m' : undefined,
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    // Initialize chat thread for this purchase
    if (!chats[newPurchaseId]) {
      const initialThread = [
        {
          id: `sys-${Date.now()}`,
          purchaseId: newPurchaseId,
          senderId: ev.organizerId,
          senderName: ev.organizerName,
          senderRole: 'organizer',
          text: `¡Hola ${currentUser.name}! Gracias por tu compra para ${ev.name}. Si tenés dudas sobre accesos o estacionamiento podés consultarnos directamente por acá.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
        },
      ];
      setChats((prev) => ({ ...prev, [newPurchaseId]: initialThread }));
    }

    showToast(
      paymentStatus === 'confirmada'
        ? `¡Compra confirmada! Orden #${newPurchaseId}`
        : `Orden #${newPurchaseId} registrada como pendiente de pago`,
      'success'
    );

    return newPurchase;
  };

  const cancelAndRefundPurchase = (purchaseId) => {
    const item = purchases.find((p) => p.id === purchaseId);
    if (!item) return false;

    const event = events.find((ev) => ev.id === item.eventId);
    if (!event || eventoYaRealizado(event.date)) {
      showToast('No es posible cancelar después de la fecha del evento', 'error');
      return false;
    }

    if (item.status === 'utilizada') {
      showToast('No es posible cancelar una entrada ya utilizada', 'error');
      return false;
    }

    if (item.status === 'reembolsada' || item.status === 'cancelada') {
      showToast('Esta compra ya fue cancelada', 'info');
      return false;
    }

    // Restore quota on event
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === item.eventId) {
          return {
            ...ev,
            tiers: ev.tiers.map((t) =>
              t.id === item.tierId
                ? { ...t, soldCount: Math.max(0, t.soldCount - item.quantity) }
                : t
            ),
          };
        }
        return ev;
      })
    );

    // Update purchase status
    setPurchases((prev) =>
      prev.map((p) => (p.id === purchaseId ? { ...p, status: 'reembolsada' } : p))
    );

    showToast(`Reembolso procesado exitosamente por $${item.totalPrice.toLocaleString('es-AR')}`, 'success');
    return true;
  };

  const markPurchaseAsUsed = (purchaseId) => {
    const item = purchases.find((p) => p.id === purchaseId);
    if (!item) return false;

    if (item.status !== 'confirmada') {
      showToast('Solo se pueden validar entradas confirmadas', 'error');
      return false;
    }

    const nowStr = `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs • Molinete Control`;

    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId ? { ...p, status: 'utilizada', checkedInAt: nowStr } : p
      )
    );

    showToast(`Ingreso registrado: ${item.buyerName} (#${purchaseId})`, 'success');
    return true;
  };

  const payPendingPurchase = (purchaseId) => {
    const item = purchases.find((p) => p.id === purchaseId);
    if (!item || item.status !== 'pendiente') {
      showToast('Esta compra no está pendiente de pago', 'error');
      return false;
    }

    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId ? { ...p, status: 'confirmada', expiresIn: undefined } : p
      )
    );
    showToast(`Pago acreditado con éxito para #${purchaseId}`, 'success');
    return true;
  };

  const sendChatMessage = (purchaseId, text) => {
    if (!text.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      purchaseId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentRole,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setChats((prev) => {
      const thread = prev[purchaseId] || [];
      return {
        ...prev,
        [purchaseId]: [...thread, newMessage],
      };
    });
  };

  const submitReview = (purchaseId, eventId, rating, criteria, comment) => {
    const purchase = purchases.find((p) => p.id === purchaseId);
    if (
      !purchase ||
      purchase.buyerId !== currentUser.id ||
      purchase.eventId !== eventId ||
      purchase.status !== 'utilizada' ||
      purchase.hasRated
    ) {
      showToast('Solo puedes calificar una vez una entrada utilizada', 'error');
      return false;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment.trim()) {
      showToast('Ingresa un puntaje y un comentario para publicar la reseña', 'error');
      return false;
    }

    const ev = events.find((e) => e.id === eventId);
    const newRev = {
      id: `rev-${Date.now()}`,
      eventId,
      eventName: ev ? ev.name : 'Evento en vivo',
      organizerId: ev ? ev.organizerId : 'salanorte',
      buyerName: currentUser.name,
      buyerAvatar: currentUser.avatar,
      rating,
      criteria,
      comment,
      date: new Date().toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };

    const nextReviews = [newRev, ...reviews];
    setReviews(nextReviews);

    // Mark purchase as rated
    setPurchases((prev) =>
      prev.map((p) => (p.id === purchaseId ? { ...p, hasRated: true } : p))
    );

    // Recalculate organizer rating
    const orgReviews = nextReviews.filter(
      (r) => r.organizerId === (ev?.organizerId || 'salanorte')
    );
    const avgScore =
      orgReviews.reduce((sum, r) => sum + r.rating, 0) / (orgReviews.length || 1);
    const roundedRating = Math.round(avgScore * 10) / 10;

    setEvents((prev) =>
      prev.map((e) =>
        e.organizerId === (ev?.organizerId || 'salanorte')
          ? {
              ...e,
              organizerRating: roundedRating,
              organizerReviewsCount: orgReviews.length,
            }
          : e
      )
    );

    showToast('¡Gracias por tu reseña! Calificación publicada.', 'success');
    return true;
  };

  const createEvent = (newEventData) => {
    const newId = `ev-${Date.now()}`;
    const fullEvent = {
      ...newEventData,
      id: newId,
      organizerId: currentUser.id,
      organizerName: currentUser.name,
      organizerRating: currentUser.rating || 4.9,
      organizerReviewsCount: currentUser.reviewsCount || 128,
      status: 'active',
    };

    setEvents([fullEvent, ...events]);
    showToast(`¡Evento "${fullEvent.name}" publicado exitosamente!`, 'success');
    return fullEvent;
  };

  const openQRModal = (purchase) => {
    setQrModalPurchase(purchase);
  };

  const closeQRModal = () => {
    setQrModalPurchase(null);
  };

  const toggleDeviceFrameMode = () => {
    setDeviceFrameMode((prev) => !prev);
  };

  const resetData = () => {
    setEvents(INITIAL_EVENTS);
    setPurchases(INITIAL_PURCHASES);
    setChats(INITIAL_CHATS);
    setReviews(INITIAL_REVIEWS);
    setFavorites(['sonora-2025']);
    try {
      localStorage.removeItem(STORAGE_KEY + '_events');
      localStorage.removeItem(STORAGE_KEY + '_purchases');
      localStorage.removeItem(STORAGE_KEY + '_chats');
      localStorage.removeItem(STORAGE_KEY + '_reviews');
    } catch {}
    showToast('Base de datos en memoria reiniciada', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        currentUser,
        users,
        currentScreen,
        selectedEventId,
        selectedPurchaseId,
        events,
        purchases,
        chats,
        reviews,
        favorites,
        toast,
        qrModalPurchase,
        deviceFrameMode,
        setRole,
        setUser,
        navigateTo,
        goBack,
        toggleFavorite,
        createPurchase,
        cancelAndRefundPurchase,
        markPurchaseAsUsed,
        payPendingPurchase,
        sendChatMessage,
        submitReview,
        createEvent,
        showToast,
        openQRModal,
        closeQRModal,
        toggleDeviceFrameMode,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
