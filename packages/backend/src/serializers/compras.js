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