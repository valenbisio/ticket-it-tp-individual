import { EstadoCompra } from "./EstadoCompra.js";

export class Compra {
  constructor({
    comprador, // Usuario
    evento, // Evento
    tipoEntrada, // TipoEntrada
    cantidad,
    total,
    estado = EstadoCompra.PENDIENTE, // EstadoCompra
    mensajes = [], // Mensaje[]
  }) {
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
}
