import { serializarCompras, serializarComprasDeEvento } from "../serializers/compras.js";

/**
 * Service de compras.
 *
 * Contiene la lógica de negocio y se comunica con el repositorio.
 * El controller delega en este service todo lo que no sea HTTP.
 */
export class CompraService {
  constructor({ compraRepository, hoy } = {}) {
    this.compraRepository = compraRepository;
    this.hoy = hoy;
  }

  obtenerComprasDeUsuario(usuarioId) {
    const compras = this.compraRepository.obtenerPorComprador(usuarioId);

    return {
      usuarioId,
      compras: serializarCompras(compras, this.hoy ?? new Date()),
    };
  }

  obtenerComprasDeEvento(eventoId) {
    const evento = this.compraRepository.obtenerEventoPorId(eventoId);
    if (!evento) {
      throw new Error(`Evento no encontrado: ${eventoId}`);
    }
    const compras = this.compraRepository.obtenerPorEvento(eventoId);

    return serializarComprasDeEvento(evento, compras, this.hoy ?? new Date());
  }
}
