/**
 * Reglas de negocio de compras que se resuelven en el front:
 * días restantes para el evento y posibilidad de cancelación.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const parseLocalDate = (isoDate) => {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Días que faltan para el evento (0 = hoy, negativo = ya se realizó)
export const getDaysUntilEvent = (eventDate) => {
  if (!eventDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((parseLocalDate(eventDate).getTime() - today.getTime()) / MS_PER_DAY);
};

export const getDaysLabel = (days) => {
  if (days === null || days < 0) return null;
  if (days === 0) return '¡El evento es hoy!';
  if (days === 1) return 'Falta 1 día';
  return `Faltan ${days} días`;
};

// Se puede cancelar mientras no esté utilizada/cancelada/reembolsada y el evento no se haya realizado
export const canCancelPurchase = (purchase) => {
  if (!purchase) return false;
  if (purchase.status !== 'confirmada' && purchase.status !== 'pendiente de pago') return false;
  const days = getDaysUntilEvent(purchase.eventDate);
  return days !== null && days >= 0;
};

// Una compra confirmada (ya paga) se reembolsa; una pendiente de pago simplemente se cancela
export const getCancelTargetStatus = (purchase) =>
  purchase.status === 'confirmada' ? 'reembolsada' : 'cancelada';
