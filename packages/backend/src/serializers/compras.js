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
      nombre: compra.evento?.nombre ?? null,
      descripcion: compra.evento?.descripcion ?? null,
      fecha: compra.evento?.fecha ? compra.evento.fecha.toISOString() : null,
      categoria: compra.evento?.categoria?.nombre ?? null,
      multimedia: compra.evento?.multimedia ?? [],
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
      tiposEntrada: evento.tiposEntrada.map((tipo) => ({
        nombre: tipo.nombre,
        descripcion: tipo.descripcion,
        precio: tipo.precio,
        cupoDisponible: tipo.cupo,
      })),
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