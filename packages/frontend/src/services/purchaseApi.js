import { request, getCurrentUserId } from './apiClient.js';
import { compraUI, estadoUI } from './mappers.js';
import { reviewApi } from './reviewApi.js';

export const purchaseApi = {
  async getPurchases() {
    const currentUserId = getCurrentUserId();
    const purchases = (await request(`/api/usuarios/${encodeURIComponent(currentUserId)}/compras`)).compras.map(compraUI);
    const eventIds = [...new Set(purchases.filter((purchase) => purchase.status === 'utilizada' && !purchase.hasRated).map((purchase) => purchase.eventId).filter(Boolean))];
    if (!eventIds.length) return purchases;
    const reviewsByEvent = new Map(await Promise.all(eventIds.map(async (eventId) => {
      try { return [eventId, await reviewApi.getReviews(eventId)]; }
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
  async cancelPurchase(id) { return compraUI((await request(`/api/usuarios/${encodeURIComponent(getCurrentUserId())}/compras/${encodeURIComponent(id)}`, { method: 'PATCH' })).compra); },
  async confirmPurchase(id) { return compraUI((await request(`/api/usuarios/compras/${encodeURIComponent(id)}/confirmacion`, { method: 'PATCH' })).compra); },
  async markPurchaseUsed(id) { return compraUI((await request(`/api/usuarios/compras/${encodeURIComponent(id)}/uso`, { method: 'PATCH' })).compra); },
};
