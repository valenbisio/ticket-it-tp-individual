const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
let token = null;

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
const estadoUI = (estado) => ({ PENDIENTE: 'pendiente de pago', CONFIRMADA: 'confirmada', UTILIZADA: 'utilizada', CANCELADA: 'cancelada', REEMBOLSADA: 'reembolsada' }[estado] || String(estado || '').toLowerCase());
const eventoUI = (event) => ({
  id: event.id, name: event.nombre, description: event.descripcion,
  category: event.categoria?.nombre || event.categoria || '', date: event.fecha,
  displayDate: fechaVisible(event.fecha), imageUrl: event.portada || event.multimedia?.[0] || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',
  organizerName: event.organizador || '', organizerId: event.organizadorId,
  organizerRating: event.puntajeOrganizador, venue: event.lugar || 'Buenos Aires',
  tiers: (event.tiposEntrada || []).map((tier) => ({ id: tier.nombre, name: tier.nombre, description: tier.descripcion, price: tier.precio, totalQuota: tier.cupoTotal ?? tier.cupoDisponible ?? tier.cupo, soldCount: Math.max(0, (tier.cupoTotal ?? tier.cupoDisponible ?? tier.cupo) - (tier.cupoDisponible ?? tier.cupo)) })),
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
  daysRemaining: purchase.diasRestantesParaEvento,
});

export const api = {
  async authenticateDemo(role) {
    const credentials = role === 'organizer'
      ? { email: 'organizador@ticketit.local', password: 'demo1234' }
      : { email: 'comprador@ticketit.local', password: 'demo1234' };
    const session = await request('/auth/login', { method: 'POST', body: credentials });
    token = session.token;
    return session.usuario;
  },
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
  async getPurchases() { return (await request('/api/usuarios/usuario-1/compras')).compras.map(compraUI); },
  async getEventPurchases(eventId) {
    const result = await request(`/api/eventos/${encodeURIComponent(eventId)}/compras`);
    return result.compras.map((purchase) => ({ ...compraUI(purchase), buyerId: purchase.comprador?.id, buyerName: [purchase.comprador?.nombre, purchase.comprador?.apellido].filter(Boolean).join(' '), status: estadoUI(purchase.estado) }));
  },
  async createPurchase({ eventId, tierId, quantity }) {
    const result = await request(`/api/eventos/${encodeURIComponent(eventId)}/compras`, { method: 'POST', body: { tipoEntrada: tierId, cantidad: quantity } });
    return compraUI(result.compra);
  },
  async cancelPurchase(id) { return compraUI((await request(`/api/usuarios/usuario-1/compras/${encodeURIComponent(id)}`, { method: 'PATCH' })).compra); },
  async markPurchaseUsed(id) { return compraUI((await request(`/api/usuarios/compras/${encodeURIComponent(id)}/uso`, { method: 'PATCH' })).compra); },
  async getChatMessages(id, userId) {
    const result = await request(`/api/usuarios/${encodeURIComponent(userId)}/compras/${encodeURIComponent(id)}/mensajes`);
    return result.mensajes.map((message, index) => ({ id: `${id}-${index}`, senderId: message.usuario?.id, senderName: [message.usuario?.nombre, message.usuario?.apellido].filter(Boolean).join(' '), senderRole: message.rol, text: message.mensaje, timestamp: new Date(message.enviado).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) }));
  },
  async sendChatMessage(id, userId, message) {
    const result = await request(`/api/usuarios/${encodeURIComponent(userId)}/compras/${encodeURIComponent(id)}/mensajes`, { method: 'POST', body: { mensaje: message.text } });
    const sent = result.mensaje;
    return { id: `${id}-${sent.enviado}`, senderId: sent.usuarioId, text: sent.mensaje, senderName: [sent.usuario?.nombre, sent.usuario?.apellido].filter(Boolean).join(' '), senderRole: sent.rol, timestamp: new Date(sent.enviado).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) };
  },
  async createReview({ purchaseId, rating, comment }) {
    return request(`/api/usuarios/usuario-1/compras/${encodeURIComponent(purchaseId)}/resenias`, { method: 'POST', body: { puntuacion: rating, detalle: comment } });
  },
  async getReviews(eventId) {
    return (await request(`/api/eventos/${encodeURIComponent(eventId)}/resenias`)).resenias.map((review) => ({ ...review, rating: review.puntuacion, comment: review.detalle }));
  },
};

export { eventoUI, compraUI };
