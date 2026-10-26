import { serializarCompras, serializarComprasDeEvento } from "../serializers/compras.js";
import { Mensaje } from "../models/Mensaje.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";

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

  enviarMensaje(compraId, usuarioId, texto) {
    const compra = this.compraRepository.obtenerPorId(compraId);
    if (!compra) {
      throw new NotFoundError(`Compra no encontrada: ${compraId}`);
    }
    const esComprador = compra.comprador?.id === usuarioId;
    const esOrganizador = compra.evento?.organizador?.id === usuarioId;
    if (!esComprador && !esOrganizador) {
      throw new ConflictError("El usuario no puede enviar mensajes en esta compra");
    }

    const mensaje = new Mensaje({
      usuario: esComprador ? compra.comprador : compra.evento.organizador,
      mensaje: texto,
    });
    compra.agregarMensaje(mensaje);
    return mensaje;
  }
}
