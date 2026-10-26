import { serializarCompras, serializarComprasDeEvento } from "../serializers/compras.js";
import { Mensaje } from "../models/Mensaje.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { EstadoCompra } from "../models/EstadoCompra.js";
import { Resenia } from "../models/Resenia.js";
import { Compra } from "../models/Compra.js";

/**
 * Service de compras.
 *
 * Contiene la lógica de negocio y se comunica con el repositorio.
 * El controller delega en este service todo lo que no sea HTTP.
 */
export class CompraService {
  constructor({ compraRepository, eventoRepository, hoy } = {}) {
    this.compraRepository = compraRepository;
    this.eventoRepository = eventoRepository;
    this.hoy = hoy;
  }

  async obtenerComprasDeUsuario(usuarioId) {
    const compras = await this.compraRepository.obtenerPorComprador(usuarioId);

    return {
      usuarioId,
      compras: serializarCompras(compras, this.hoy ?? new Date()),
    };
  }

  async obtenerComprasDeEvento(eventoId) {
    const evento = await (this.eventoRepository?.obtenerPorId(eventoId)
      ?? this.compraRepository.obtenerEventoPorId(eventoId));
    if (!evento) {
      throw new Error(`Evento no encontrado: ${eventoId}`);
    }
    const compras = await this.compraRepository.obtenerPorEvento(eventoId);

    return serializarComprasDeEvento(evento, compras, this.hoy ?? new Date());
  }

  async realizarCompra(eventoId, compradorId, tipoEntradaNombre, cantidad) {
    const evento = await this.eventoRepository.obtenerPorId(eventoId);
    if (!evento) throw new NotFoundError(`Evento no encontrado: ${eventoId}`);
    const tipoEntrada = evento.tiposEntrada.find(
      (tipo) => tipo.nombre.toLowerCase() === tipoEntradaNombre.toLowerCase(),
    );
    if (!tipoEntrada) throw new NotFoundError(`Tipo de entrada no encontrado: ${tipoEntradaNombre}`);
    if (!tipoEntrada.hayCupoPara(cantidad)) {
      throw new ConflictError("No hay suficiente cupo para este tipo de entrada");
    }

    tipoEntrada.reducirCupo(cantidad);
    const compra = new Compra({
      comprador: { id: compradorId },
      evento,
      tipoEntrada,
      cantidad,
    });
    return await this.compraRepository.agregar(compra);
  }

  async enviarMensaje(compraId, usuarioId, texto) {
    const compra = await this.compraRepository.obtenerPorId(compraId);
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

  async cancelarCompra(compraId, usuarioId) {
    const compra = await this.compraRepository.obtenerPorId(compraId);
    if (!compra) {
      throw new NotFoundError(`Compra no encontrada: ${compraId}`);
    }
    if (compra.comprador?.id !== usuarioId) {
      throw new ConflictError("Solo el comprador puede cancelar esta compra");
    }
    if (compra.estado === EstadoCompra.UTILIZADA) {
      throw new ConflictError("No se puede cancelar una compra utilizada");
    }
    if (compra.estado === EstadoCompra.CANCELADA || compra.estado === EstadoCompra.REEMBOLSADA) {
      throw new ConflictError("La compra ya no puede cancelarse");
    }
    if (!compra.evento?.fecha || new Date(compra.evento.fecha) <= new Date()) {
      throw new ConflictError("No se puede cancelar una compra luego de realizado el evento");
    }

    compra.actualizarEstado(EstadoCompra.CANCELADA);
    return compra;
  }

  async calificarEvento(compraId, usuarioId, puntuacion, detalle) {
    const compra = await this.compraRepository.obtenerPorId(compraId);
    if (!compra) throw new NotFoundError(`Compra no encontrada: ${compraId}`);
    if (compra.comprador?.id !== usuarioId) {
      throw new ConflictError("Solo el comprador puede calificar esta compra");
    }
    if (compra.estado !== EstadoCompra.UTILIZADA) {
      throw new ConflictError("Solo se puede calificar una entrada utilizada");
    }
    const resenia = new Resenia({
      comprador: compra.comprador,
      evento: compra.evento,
      puntuacion,
      detalle,
    });
    compra.evento.agregarResenia(resenia);
    return resenia;
  }
}
