import { randomUUID } from "node:crypto";

import { EstadoCompra } from "./EstadoCompra.js";
import { diasEntre } from "../utils/fechas.js";
import { ReglaDeNegocioError } from "../errors/ReglaDeNegocioError.js";

export class Compra {
  #estado;

  constructor({
    id = randomUUID(),
    comprador, // Usuario
    evento, // Evento
    tipoEntrada, // TipoEntrada
    cantidad,
    estado = EstadoCompra.PENDIENTE, // EstadoCompra
    mensajes = [], // Mensaje[]
    mensajesLeidosPor = {},
  }) {
    if (!Object.values(EstadoCompra).includes(estado)) {
      throw new ReglaDeNegocioError(`Estado de compra inválido: ${estado}`);
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new ReglaDeNegocioError("La cantidad de entradas debe ser un entero positivo");
    }
    if (!tipoEntrada) {
      throw new ReglaDeNegocioError("La compra debe tener un tipo de entrada");
    }
    this.id = id;
    this.comprador = comprador;
    this.evento = evento;
    this.tipoEntrada = tipoEntrada;
    this.cantidad = cantidad;
    this.total = tipoEntrada.precio * cantidad;
    this.#estado = estado;
    this.mensajes = mensajes;
    this.mensajesLeidosPor = { ...mensajesLeidosPor };
  }

  get estado() {
    return this.#estado;
  }

  confirmarPago() {
    if (this.#estado !== EstadoCompra.PENDIENTE) {
      throw new ReglaDeNegocioError("Solo se pueden confirmar compras pendientes de pago");
    }
    this.#estado = EstadoCompra.CONFIRMADA;
  }

  cancelar({ hoy = new Date() } = {}) {
    if (this.#estado === EstadoCompra.UTILIZADA) {
      throw new ReglaDeNegocioError("No se puede cancelar una compra utilizada");
    }
    if (this.#estado === EstadoCompra.CANCELADA || this.#estado === EstadoCompra.REEMBOLSADA) {
      throw new ReglaDeNegocioError("La compra ya no puede cancelarse");
    }
    if (!this.evento?.fecha || new Date(this.evento.fecha) <= new Date(hoy)) {
      throw new ReglaDeNegocioError("No se puede cancelar una compra luego de realizado el evento");
    }
    this.tipoEntrada?.liberar(this.cantidad);
    this.#estado = EstadoCompra.CANCELADA;
  }

  marcarComoUtilizada() {
    if (this.#estado !== EstadoCompra.CONFIRMADA) {
      throw new ReglaDeNegocioError("Solo se pueden validar compras confirmadas");
    }
    this.#estado = EstadoCompra.UTILIZADA;
  }

  validarPuedeCalificarse(usuarioId) {
    if (this.comprador?.id !== usuarioId) {
      throw new ReglaDeNegocioError("Solo el comprador puede calificar esta compra");
    }
    if (this.#estado !== EstadoCompra.UTILIZADA) {
      throw new ReglaDeNegocioError("Solo se puede calificar una entrada utilizada");
    }
    const yaCalifico = this.evento?.resenias?.some((resenia) => resenia.comprador?.id === usuarioId);
    if (yaCalifico) {
      throw new ReglaDeNegocioError("Ya calificaste este evento. Podés consultar tu calificación desde Mis compras.");
    }
  }

  agregarMensaje(mensaje) {
    this.mensajes.push(mensaje);
  }

  estaConfirmada() {
    return this.estado === EstadoCompra.CONFIRMADA;
  }

  /**
   * Días de calendario que faltan para el evento.
   *
   * Solo tiene sentido para compras confirmadas: si la compra está en cualquier
   * otro estado devuelve `null`, ya que el comprador todavía no tiene acceso
   * garantizado al evento.
   *
   * Devuelve 0 cuando el evento es hoy y un valor negativo si el evento ya pasó.
   */
  diasRestantesParaEvento(hoy = new Date()) {
    if (!this.estaConfirmada() || !this.evento?.fecha) {
      return null;
    }
    return diasEntre(this.evento.fecha, hoy);
  }
}
