import { randomUUID } from "node:crypto";

import { EstadoCompra } from "./EstadoCompra.js";
import { diasEntre } from "../utils/fechas.js";

export class Compra {
  constructor({
    id = randomUUID(),
    comprador, // Usuario
    evento, // Evento
    tipoEntrada, // TipoEntrada
    cantidad,
    estado = EstadoCompra.PENDIENTE, // EstadoCompra
    mensajes = [], // Mensaje[]
  }) {
    this.id = id;
    this.comprador = comprador;
    this.evento = evento;
    this.tipoEntrada = tipoEntrada;
    this.cantidad = cantidad;
    this.total = tipoEntrada.precio * cantidad;
    this.estado = estado;
    this.mensajes = mensajes;
  }

  actualizarEstado(nuevoEstado) {
    if (!Object.values(EstadoCompra).includes(nuevoEstado)) {
      throw new Error(`Estado de compra inválido: ${nuevoEstado}`);
    }
    this.estado = nuevoEstado;
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
