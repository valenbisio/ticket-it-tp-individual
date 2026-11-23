const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
let token = null;
let currentUserId = 'usuario-1';

async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || `Error ${response.status}`);
  return data;
}

const fechaVisible = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-AR', {
  weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
}) : '';
const rolUI = (rol) => rol === 'organizador' || rol === 'organizer' ? 'organizer' : 'buyer';
const estadoUI = (estado) => ({ PENDIENTE: 'pendiente de pago', CONFIRMADA: 'confirmada', UTILIZADA: 'utilizada', CANCELADA: 'cancelada', REEMBOLSADA: 'reembolsada' }[estado] || String(estado || '').toLowerCase());
const promedioResenias = (reviews = []) => reviews.length
  ? reviews.reduce((total, review) => total + (review.puntuacion ?? review.rating ?? 0), 0) / reviews.length
  : null;
const eventoUI = (event) => ({
  id: event.id, name: event.nombre, description: event.descripcion,
  category: event.categoria?.nombre || event.categoria || '', date: event.fecha,
  displayDate: fechaVisible(event.fecha), imageUrl: event.portada || event.multimedia?.[0] || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',
  organizerName: event.organizador || '', organizerId: event.organizadorId,
  organizerRating: event.puntajeOrganizador, organizerReviewsCount: event.cantidadReseniasOrganizador ?? 0, eventRating: promedioResenias(event.resenias || []), eventReviewsCount: event.resenias?.length || 0, venue: event.lugar || 'Buenos Aires',
  tiers: (event.tiposEntrada || []).map((tier) => ({ id: tier.nombre, name: tier.nombre, description: tier.descripcion, price: tier.precio, totalQuota: tier.cupoTotal ?? tier.cupo, availableQuota: tier.cupoDisponible ?? tier.cupo, soldCount: tier.vendidas ?? Math.max(0, (tier.cupoTotal ?? tier.cupo) - (tier.cupoDisponible ?? tier.cupo)), revenue: tier.recaudado ?? 0 })),
  reviews: event.resenias || [], status: 'active',
});
const compraUI = (purchase) => ({
  id: purchase.id, status: estadoUI(purchase.estado), quantity: purchase.cantidad,
  totalPrice: purchase.total, tierName: purchase.tipoEntrada?.nombre,
  unitPrice: purchase.tipoEntrada?.precio, eventId: purchase.evento?.id,
  eventName: purchase.evento?.nombre, eventDate: purchase.evento?.fecha,
  eventDisplayDate: fechaVisible(purchase.evento?.fecha),
  venue: purchase.evento?.lugar || 'Buenos Aires', organizerId: purchase.evento?.organizadorId,
  organizerName: purchase.evento?.organizador || '', buyerId: purchase.comprador?.id,
  buyerName: [purchase.comprador?.nombre, purchase.comprador?.apellido].filter(Boolean).join(' '),
  daysRemaining: purchase.diasRestantesParaEvento, hasRated: Boolean(purchase.hasRated),
});

export const api = {
  async authenticateDemo(role) {
    const credentials = role === 'organizer'
      ? { email: 'sala@demo.local', password: 'demo1234' }
      : { email: 'buyer@demo.local', password: 'demo1234' };
    const session = await request('/auth/login', { method: 'POST', body: credentials });
    token = session.token;
    currentUserId = session.usuario.id;
    return session.usuario;
  },
  async login(email, password) {
    const session = await request('/auth/login', { method: 'POST', body: { email, password } });
    token = session.token;
    currentUserId = session.usuario.id;
    return session;
  },
  async register(datos) {
    const session = await request('/auth/registro', { method: 'POST', body: datos });
    token = session.token;
    currentUserId = session.usuario.id;
    return session;
  },
  async restoreSession(savedToken) {
    token = savedToken;
    const data = await request('/auth/me');
    currentUserId = data.usuario.id;
    return { token: savedToken, usuario: data.usuario };
  },
  async updateProfile(datos) {
    const result = await request('/auth/perfil', { method: 'PATCH', body: datos });
    return result.usuario;
  },
  setToken(value, userId) { token = value; if (userId) currentUserId = userId; },
  getCurrentUserId() { return currentUserId; },
  async getEvents(filters = {}) {
    const query = new URLSearchParams();
    if (filters.q) query.set('q', filters.q);
    if (filters.categoria) {
      const categories = await this.getCategories();
      const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const category = categories.find((item) => item.id === filters.categoria)
        || categories.find((item) => normalize(item.nombre) === normalize(filters.categoria));
      if (category) query.set('categoria', category.id);
    }
    const orderField = filters.ordenarPor === 'puntaje' ? 'puntajeOrganizador' : filters.ordenarPor;
    if (orderField) query.set('ordenarPor', orderField);
    if (filters.orden) query.set('orden', filters.orden);
    const queryString = query.toString();
    const result = await request(`/api/eventos${queryString ? `?${queryString}` : ''}`);
    return result.eventos.map(eventoUI);
  },
  async getCategories() { return (await request('/api/eventos/categorias')).categorias; },
  async getEventById(id) { return eventoUI((await this.getEvents()).find((event) => event.id === id) || {}); },
  async createEvent(event) {
    const categories = await this.getCategories();
    const normalizedCategory = event.category.toLowerCase();
    const category = categories.find((item) => item.nombre.toLowerCase() === normalizedCategory)
      || categories.find((item) => normalizedCategory.includes('recital') && item.nombre.toLowerCase().includes('música'))
      || categories[0];
    if (!category) throw new Error('El backend no tiene categorías cargadas');
    const data = await request('/api/eventos', { method: 'POST', body: {
      nombre: event.name, descripcion: event.description, categoriaId: category.id,
      lugar: event.venue, direccion: event.venueAddress,
      fecha: new Date(`${event.date}T${event.showTime || '21:00'}:00`).toISOString(),
      multimedia: event.imageUrl ? [event.imageUrl] : [],
      tiposEntrada: event.tiers.map((tier) => ({ nombre: tier.name, descripcion: tier.description, precio: tier.price, cupo: tier.totalQuota })),
    } });
    return data.evento;
  },
  async getPurchases() {
    const purchases = (await request(`/api/usuarios/${encodeURIComponent(currentUserId)}/compras`)).compras.map(compraUI);
    const eventIds = [...new Set(purchases.filter((purchase) => purchase.status === 'utilizada' && !purchase.hasRated).map((purchase) => purchase.eventId).filter(Boolean))];
    if (!eventIds.length) return purchases;
    const reviewsByEvent = new Map(await Promise.all(eventIds.map(async (eventId) => {
      try { return [eventId, await this.getReviews(eventId)]; }
      catch { return [eventId, []]; }
    })));
    return purchases.map((purchase) => ({
      ...purchase,
      hasRated: purchase.hasRated || Boolean(reviewsByEvent.get(purchase.eventId)?.some((review) => review.usuarioId === currentUserId)),
    }));
  },
  async getEventPurchases(eventId) {
    const result = await request(`/api/eventos/${encodeURIComponent(eventId)}/compras`);
    return {
      tiers: (result.evento?.tiposEntrada || []).map((tier) => ({ id: tier.nombre, name: tier.nombre, price: tier.precio, totalQuota: tier.cupoTotal, availableQuota: tier.cupoDisponible, soldCount: tier.vendidas ?? 0, revenue: tier.recaudado ?? 0 })),
      purchases: result.compras.map((purchase) => ({ ...compraUI(purchase), buyerId: purchase.comprador?.id, buyerName: [purchase.comprador?.nombre, purchase.comprador?.apellido].filter(Boolean).join(' '), status: estadoUI(purchase.estado) })),
    };
  },
  async createPurchase({ eventId, tierId, quantity }) {
    const result = await request(`/api/eventos/${encodeURIComponent(eventId)}/compras`, { method: 'POST', body: { tipoEntrada: tierId, cantidad: quantity } });
    return compraUI(result.compra);
  },
  async cancelPurchase(id) { return compraUI((await request(`/api/usuarios/${encodeURIComponent(currentUserId)}/compras/${encodeURIComponent(id)}`, { method: 'PATCH' })).compra); },
  async markPurchaseUsed(id) { return compraUI((await request(`/api/usuarios/compras/${encodeURIComponent(id)}/uso`, { method: 'PATCH' })).compra); },
  async getChatMessages(id, userId) {
    const result = await request(`/api/usuarios/${encodeURIComponent(userId)}/compras/${encodeURIComponent(id)}/mensajes`);
    return result.mensajes.map((message, index) => ({ id: message.id || `${id}-${index}`, senderId: message.usuario?.id, senderName: [message.usuario?.nombre, message.usuario?.apellido].filter(Boolean).join(' '), senderRole: rolUI(message.rol), text: message.mensaje, sentAt: message.enviado, timestamp: new Date(message.enviado).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) }));
  },
  connectChat(token, { onMessage, onOpen, onClose }) {
    const socketUrl = `${API_URL.replace(/\/+$/, '').replace(/^http/, 'ws')}/ws/chat`;
    const socket = new WebSocket(socketUrl);
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ type: 'authenticate', token }));
    });
    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'ready') onOpen?.();
        onMessage?.(message);
      } catch {
        // Ignora frames que no cumplan el contrato de eventos JSON.
      }
    });
    socket.addEventListener('close', onClose || (() => {}));
    return socket;
  },
  async getConversations(userId = currentUserId) {
    const result = await request(`/api/usuarios/${encodeURIComponent(userId)}/mensajes`);
    return result.conversaciones.map((conversation) => ({
      id: conversation.compraId,
      eventId: conversation.eventoId,
      eventName: conversation.eventoNombre,
      eventDate: conversation.eventoFecha,
      participantName: conversation.participante.nombre || 'Usuario',
      participantRole: rolUI(conversation.participante.rol),
      lastMessage: conversation.ultimoMensaje,
      lastMessageAt: conversation.ultimoMensajeEnviado,
      unreadCount: conversation.mensajesNoLeidos,
    }));
  },
  async sendChatMessage(id, userId, message) {
    const result = await request(`/api/usuarios/${encodeURIComponent(userId)}/compras/${encodeURIComponent(id)}/mensajes`, { method: 'POST', body: { mensaje: message.text } });
    const sent = result.mensaje;
    return { id: sent.id || `${id}-${Date.parse(sent.enviado)}`, senderId: sent.usuarioId, text: sent.mensaje, senderName: [sent.usuario?.nombre, sent.usuario?.apellido].filter(Boolean).join(' '), senderRole: rolUI(sent.rol), sentAt: sent.enviado, timestamp: new Date(sent.enviado).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) };
  },
  async createReview({ purchaseId, rating, comment }) {
    return request(`/api/usuarios/${encodeURIComponent(currentUserId)}/compras/${encodeURIComponent(purchaseId)}/resenias`, { method: 'POST', body: { puntuacion: rating, ...(comment?.trim() ? { detalle: comment.trim() } : {}) } });
  },
  async getReviews(eventId) {
    return (await request(`/api/eventos/${encodeURIComponent(eventId)}/resenias`)).resenias.map((review) => ({ ...review, buyerName: review.nombre || 'Comprador', rating: review.puntuacion, comment: review.detalle }));
  },
};

export { eventoUI, compraUI };
