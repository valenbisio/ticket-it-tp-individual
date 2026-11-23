import { request } from './apiClient.js';
import { eventoUI } from './mappers.js';

export const eventApi = {
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
};
