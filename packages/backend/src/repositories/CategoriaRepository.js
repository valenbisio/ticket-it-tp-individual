export class CategoriaRepository {
  constructor(categorias = []) {
    this.categorias = [...categorias];
  }
    // ── Alta ──────────────────────────────────────────────

  agregar(categoria) {
    this.categorias.push(categoria);
    return categoria;
  }

  // ── Baja ──────────────────────────────────────────────

  eliminar(id) {
    const indice = this.categorias.findIndex((c) => c.id === id);
    if (indice === -1) {
      return null;
    }
    const [eliminada] = this.categorias.splice(indice, 1);
    return eliminada;
  }

  // ── Consultas ─────────────────────────────────────────

  obtenerPorId(id) {
    return this.categorias.find((c) => c.id === id) ?? null;
  }

  obtenerTodas() {
    return [...this.categorias];
  }
}