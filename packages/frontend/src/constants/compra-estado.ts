export type EstadoCompra =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'UTILIZADA'
  | 'CANCELADA'
  | 'REEMBOLSADA';

export type EstiloEstadoCompra = {
  label: string;
  /** Color del texto sobre el fondo del badge. */
  color: string;
  background: string;
};

/**
 * Etiqueta y colores de cada estado de compra.
 *
 * Los colores son autónomos (fondo pastel + texto oscuro) para que el estado se
 * lea con claridad tanto en modo claro como en modo oscuro.
 */
export const ESTADOS_COMPRA: Record<EstadoCompra, EstiloEstadoCompra> = {
  PENDIENTE: { label: 'Pendiente', color: '#8A5300', background: '#FFE7C2' },
  CONFIRMADA: { label: 'Confirmada', color: '#0F5132', background: '#C9F7D9' },
  UTILIZADA: { label: 'Utilizada', color: '#1B4965', background: '#CFE8FF' },
  CANCELADA: { label: 'Cancelada', color: '#8C1D1D', background: '#FBD5D5' },
  REEMBOLSADA: { label: 'Reembolsada', color: '#4A1D96', background: '#E7DAFB' },
};

const ESTADO_DESCONOCIDO: EstiloEstadoCompra = {
  label: 'Estado desconocido',
  color: '#3F3F46',
  background: '#E4E4E7',
};

/** Estilo para el estado informado, con un fallback si llega uno inesperado. */
export function estiloDeEstado(estado: string): EstiloEstadoCompra {
  return ESTADOS_COMPRA[estado as EstadoCompra] ?? ESTADO_DESCONOCIDO;
}

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** Formatea una fecha ISO como "20 de marzo de 2026". */
export function formatearFecha(iso: string | null): string {
  if (!iso) {
    return 'Fecha a confirmar';
  }

  const fecha = new Date(iso);

  if (Number.isNaN(fecha.getTime())) {
    return 'Fecha a confirmar';
  }

  return `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

/** Formatea un importe como "$ 30.000". */
export function formatearPrecio(valor: number): string {
  const entero = Math.round(valor).toString();

  return `$ ${entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

/**
 * Texto con los días que faltan para el evento.
 *
 * Devuelve `null` cuando no hay que mostrar nada: la compra no está confirmada,
 * así que el backend no informa días restantes.
 */
export function textoDiasRestantes(dias: number | null): string | null {
  if (dias === null) {
    return null;
  }

  if (dias > 1) {
    return `Faltan ${dias} días para el evento`;
  }

  if (dias === 1) {
    return 'Falta 1 día para el evento';
  }

  if (dias === 0) {
    return '¡El evento es hoy!';
  }

  return 'El evento ya pasó';
}