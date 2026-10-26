export class CompraRepository {
  constructor({ compras = [] } = {}) {
    this.compras = [...compras];
  }

  // ── Alta ──────────────────────────────────────────────

  agregar(compra) {
    this.compras.push(compra);
    return compra;
  }

  // ── Baja ──────────────────────────────────────────────

  eliminar(id) {
    const indice = this.compras.findIndex((c) => c.id === id);
    if (indice === -1) {
      return null;
    }
    const [eliminada] = this.compras.splice(indice, 1);
    return eliminada;
  }

  // ── Consultas ─────────────────────────────────────────

  obtenerPorId(id) {
    return this.compras.find((c) => c.id === id) ?? null;
  }

  obtenerTodas() {
    return [...this.compras];
  }

  obtenerPorComprador(usuarioId) {
    return this.compras.filter((c) => c.comprador?.id === usuarioId);
  }

  obtenerPorEvento(eventoId) {
    return this.compras.filter((c) => c.evento?.id === eventoId);
  }

  obtenerEventoPorId(eventoId) {
    const compra = this.compras.find((c) => c.evento?.id === eventoId);
    return compra ? compra.evento : null;
  }
}
