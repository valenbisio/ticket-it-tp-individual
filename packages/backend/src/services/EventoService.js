export class EventoService {
  constructor({ eventoRepository, categoriaRepository }) {
    this.eventoRepository = eventoRepository;
    this.categoriaRepository = categoriaRepository;
  }

  obtenerCategorias() {
    return this.categoriaRepository.obtenerTodas().map((c) => ({
      id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion,
    }));
  }

  buscarEventos({ texto, categoria } = {}) {
    const categoriaBuscada = this.#resolverCategoria(categoria);
    const palabras = texto ? normalizar(texto).split(/\s+/).filter(Boolean) : [];

    return this.eventoRepository
      .obtenerTodos()
      .filter((evento) => {
        if (categoriaBuscada && evento.categoria.id !== categoriaBuscada.id) {
          return false;
        }
        if (palabras.length === 0) return true;

        const contenido = normalizar(
          [
            evento.nombre,
            evento.descripcion,
            evento.categoria.nombre,
            evento.organizador.nombre,
            evento.organizador.apellido,
          ].join(" "),
        );
        // Todas las palabras buscadas deben aparecer
        return palabras.every((palabra) => contenido.includes(palabra));
      })
      .map((evento) => this.#serializar(evento));
  }

  #resolverCategoria(id) {
    if (!id) return null;

    const categorias = this.categoriaRepository.obtenerTodas();
    const encontrada = categorias.find((c) => c.id === String(id).trim().toLowerCase());
    if (!encontrada) {
      throw new CategoriaInexistenteError(id, categorias.map((c) => c.id));
    }
    return encontrada;
  }

  #serializar(evento) {
    const precios = evento.tiposEntrada.map((t) => t.precio);
    return {
      id: evento.id,
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      categoria: { id: evento.categoria.id, nombre: evento.categoria.nombre },
      fecha: evento.fecha,
      portada: evento.multimedia[0] ?? null,
      organizador: `${evento.organizador.nombre} ${evento.organizador.apellido}`,
      precioDesde: precios.length > 0 ? Math.min(...precios) : null,
    };
  }
}