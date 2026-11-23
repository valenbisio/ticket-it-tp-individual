export const fechaVisible = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-AR', {
  weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
}) : '';

export const rolUI = (rol) => rol === 'organizador' || rol === 'organizer' ? 'organizer' : 'buyer';
export const estadoUI = (estado) => ({ PENDIENTE: 'pendiente de pago', CONFIRMADA: 'confirmada', UTILIZADA: 'utilizada', CANCELADA: 'cancelada', REEMBOLSADA: 'reembolsada' }[estado] || String(estado || '').toLowerCase());

const promedioResenias = (reviews = []) => reviews.length
  ? reviews.reduce((total, review) => total + (review.puntuacion ?? review.rating ?? 0), 0) / reviews.length
  : null;

export const eventoUI = (event) => ({
  id: event.id, name: event.nombre, description: event.descripcion,
  category: event.categoria?.nombre || event.categoria || '', date: event.fecha,
  displayDate: fechaVisible(event.fecha), imageUrl: event.portada || event.multimedia?.[0] || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',
  organizerName: event.organizador || '', organizerId: event.organizadorId,
  organizerRating: event.puntajeOrganizador, organizerReviewsCount: event.cantidadReseniasOrganizador ?? 0, eventRating: promedioResenias(event.resenias || []), eventReviewsCount: event.resenias?.length || 0, venue: event.lugar || 'Buenos Aires',
  tiers: (event.tiposEntrada || []).map((tier) => ({ id: tier.nombre, name: tier.nombre, description: tier.descripcion, price: tier.precio, totalQuota: tier.cupoTotal ?? tier.cupo, availableQuota: tier.cupoDisponible ?? tier.cupo, soldCount: tier.vendidas ?? Math.max(0, (tier.cupoTotal ?? tier.cupo) - (tier.cupoDisponible ?? tier.cupo)), revenue: tier.recaudado ?? 0 })),
  reviews: event.resenias || [], status: 'active',
});

export const compraUI = (purchase) => ({
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
