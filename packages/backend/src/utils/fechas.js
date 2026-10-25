const MILISEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;

function aMedianocheUTC(fecha) {
  const date = fecha instanceof Date ? fecha : new Date(fecha);
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Cantidad de días de calendario entre la fecha objetivo y la fecha de referencia
 * (fechaObjetivo - fechaReferencia). Se normalizan ambas fechas a su medianoche
 * local para evitar diferencias por horario o cambio de huso horario.
 *
 * Devuelve 0 si ambas fechas son el mismo día y un número negativo si la fecha
 * objetivo ya pasó.
 */
export function diasEntre(fechaObjetivo, fechaReferencia = new Date()) {
  return Math.round(
    (aMedianocheUTC(fechaObjetivo) - aMedianocheUTC(fechaReferencia)) / MILISEGUNDOS_POR_DIA,
  );
}