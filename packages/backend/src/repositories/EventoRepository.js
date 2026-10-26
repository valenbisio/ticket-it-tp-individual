export class EventoRepository  {
  constructor({ eventos = [] } = {}) {
    this.eventos = [...eventos];
  }

  // ── Alta ──────────────────────────────────────────────

  agregar(evento) {
    this.eventos.push(evento);
    return evento;
  }

  // ── Baja ──────────────────────────────────────────────

  eliminar(id) {
    const indice = this.eventos.findIndex((c) => c.id === id);
    if (indice === -1) {
      return null;
    }
    const [eliminada] = this.eventos.splice(indice, 1);
    return eliminada;
  }

  // ── Consultas ─────────────────────────────────────────

  obtenerPorId(id) {
    return this.eventos.find((c) => c.id === id) ?? null;
  }

  obtenerTodas() {
    return [...this.eventos];
  }

}