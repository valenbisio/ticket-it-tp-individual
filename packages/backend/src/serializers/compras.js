/**
 * Convierte una Compra de dominio en un objeto plano listo para responder por HTTP.
 *
 * `diasRestantesParaEvento` viene de la propia compra: es un número solo cuando la
 * compra está CONFIRMADA, y `null` en cualquier otro estado.
 */
export function serializarCompra(compra, hoy = new Date()) {
  return {
    id: compra.id,
    estado: compra.estado,
    cantidad: compra.cantidad,
    total: compra.total,
    tipoEntrada: {
      nombre: compra.tipoEntrada?.nombre ?? null,
      precio: compra.tipoEntrada?.precio ?? null,
    },
    evento: {
      id: compra.evento?.id ?? null,
      nombre: compra.evento?.nombre ?? null,
      descripcion: compra.evento?.descripcion ?? null,
      fecha: compra.evento?.fecha ? compra.evento.fecha.toISOString() : null,
      categoria: compra.evento?.categoria?.nombre ?? null,
      multimedia: compra.evento?.multimedia ?? [],
      organizadorId: compra.evento?.organizador?.id ?? null,
      organizador: compra.evento?.organizador
        ? `${compra.evento.organizador.nombre} ${compra.evento.organizador.apellido}`.trim()
        : "",
      lugar: compra.evento?.lugar ?? null,
      direccion: compra.evento?.direccion ?? null,
    },
    comprador: {
      id: compra.comprador?.id ?? null,
      nombre: compra.comprador?.nombre ?? null,
      apellido: compra.comprador?.apellido ?? null,
    },
    diasRestantesParaEvento: compra.diasRestantesParaEvento(hoy),
  };
}

export function serializarCompras(compras, hoy = new Date()) {
  return compras.map((compra) => serializarCompra(compra, hoy));
}

export function serializarComprasDeEvento(evento, compras, hoy = new Date()) {
  return {
    evento: {
      id: evento.id,
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      fecha: evento.fecha ? evento.fecha.toISOString() : null,
      categoria: evento.categoria?.nombre ?? null,
      multimedia: evento.multimedia ?? [],
      lugar: evento.lugar ?? null,
      direccion: evento.direccion ?? null,
      tiposEntrada: evento.tiposEntrada.map((tipo) => {
        const comprometidas = compras
          .filter((compra) => compra.tipoEntrada === tipo
            && compra.estado !== EstadoCompra.CANCELADA
            && compra.estado !== EstadoCompra.REEMBOLSADA)
          .reduce((total, compra) => total + compra.cantidad, 0);
        return {
          nombre: tipo.nombre,
          descripcion: tipo.descripcion,
          precio: tipo.precio,
          cupoDisponible: Math.max(0, Math.min(tipo.cupo, tipo.cupoTotal - comprometidas)),
        };
      }),
    },
    compras: compras.map((compra) => ({
      id: compra.id,
      estado: compra.estado,
      cantidad: compra.cantidad,
      total: compra.total,
      comprador: {
        id: compra.comprador?.id ?? null,
        nombre: compra.comprador?.nombre ?? null,
        apellido: compra.comprador?.apellido ?? null,
      },
      tipoEntrada: {
        nombre: compra.tipoEntrada?.nombre ?? null,
        precio: compra.tipoEntrada?.precio ?? null,
      },
      diasRestantesParaEvento: compra.diasRestantesParaEvento(hoy),
    })),
  };
}
import { EstadoCompra } from "../models/EstadoCompra.js";

