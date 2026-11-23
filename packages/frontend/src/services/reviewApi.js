import { request, getCurrentUserId } from './apiClient.js';

export const reviewApi = {
  async createReview({ purchaseId, rating, comment }) {
    return request(`/api/usuarios/${encodeURIComponent(getCurrentUserId())}/compras/${encodeURIComponent(purchaseId)}/resenias`, { method: 'POST', body: { puntuacion: rating, ...(comment?.trim() ? { detalle: comment.trim() } : {}) } });
  },
  async getReviews(eventId) {
    return (await request(`/api/eventos/${encodeURIComponent(eventId)}/resenias`)).resenias.map((review) => ({ ...review, buyerName: review.nombre || 'Comprador', rating: review.puntuacion, comment: review.detalle }));
  },
};
