import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const MyPurchasesScreen = () => {
  const {
    purchases,
    currentUser,
    navigateTo,
    openQRModal,
    cancelAndRefundPurchase,
    payPendingPurchase,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('all');

  // Filter purchases for current buyer
  const userPurchases = purchases.filter((p) => p.buyerId === currentUser.id);

  const filteredPurchases = userPurchases.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'confirmada') return p.status === 'confirmada';
    if (activeFilter === 'pendiente') return p.status === 'pendiente';
    if (activeFilter === 'historial')
      return p.status === 'utilizada' || p.status === 'reembolsada' || p.status === 'cancelada';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Confirmada
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Pendiente de pago
          </span>
        );
      case 'utilizada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-variant text-on-surface-variant text-[10px] font-bold">
            <span className="material-symbols-outlined text-[12px]">check_circle</span>
            Entrada utilizada
          </span>
        );
      case 'reembolsada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-secondary text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Reembolsada
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container/40 text-error text-[10px] font-bold">
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  const calculateDaysRemaining = (eventDateStr) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const evDate = new Date(eventDateStr);
      evDate.setHours(0, 0, 0, 0);
      const diffTime = evDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 14;
    }
  };

  const handleCancelClick = (purchase) => {
    if (
      window.confirm(
        `¿Deseas cancelar la orden #${purchase.id} de "${purchase.eventName}" y solicitar el reembolso total de $${purchase.totalPrice.toLocaleString(
          'es-AR'
        )}?`
      )
    ) {
      cancelAndRefundPurchase(purchase.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-28 pt-2 px-4 space-y-4">
      {/* Header Titular */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-extrabold text-2xl text-on-surface">
              Mis Compras
            </h1>
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
          </div>
          <span className="text-xs font-mono text-tertiary">
            {userPurchases.length} ticket{userPurchases.length === 1 ? '' : 's'}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Gestiona tus entradas, accede al QR dinámico anti-fraude y chatea con los organizadores.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
            activeFilter === 'all'
              ? 'bg-primary text-on-primary shadow-md'
              : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Todas ({userPurchases.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('confirmada')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
            activeFilter === 'confirmada'
              ? 'bg-primary text-on-primary shadow-md'
              : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Confirmadas ({userPurchases.filter((p) => p.status === 'confirmada').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('pendiente')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
            activeFilter === 'pendiente'
              ? 'bg-primary text-on-primary shadow-md'
              : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Pendientes ({userPurchases.filter((p) => p.status === 'pendiente').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('historial')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
            activeFilter === 'historial'
              ? 'bg-primary text-on-primary shadow-md'
              : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Historial (
          {
            userPurchases.filter(
              (p) =>
                p.status === 'utilizada' ||
                p.status === 'reembolsada' ||
                p.status === 'cancelada'
            ).length
          }
          )
        </button>
      </div>

      {/* Lista de Compras */}
      <div className="flex flex-col gap-4 mt-1">
        {filteredPurchases.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-surface-container-low rounded-2xl border border-surface-container-high/40">
            <span className="material-symbols-outlined text-[42px] text-on-surface-variant mb-2">
              receipt_long
            </span>
            <h3 className="font-headline font-bold text-base text-on-surface">
              No tienes compras en esta categoría
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
              Explora la cartelera para adquirir entradas seguras.
            </p>
            <button
              onClick={() => navigateTo('buyer_explore')}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-xs font-bold text-on-primary hover:bg-primary-container"
            >
              Explorar Eventos
            </button>
          </div>
        ) : (
          filteredPurchases.map((purchase) => {
            const daysLeft = calculateDaysRemaining(purchase.eventDate);

            return (
              <article
                key={purchase.id}
                className={`ticket-card relative rounded-2xl overflow-hidden shadow-xl border transition-all ${
                  purchase.status === 'confirmada'
                    ? 'bg-surface-container border-primary/30'
                    : purchase.status === 'pendiente'
                    ? 'bg-surface-container border-amber-500/30'
                    : 'bg-surface-container-low border-surface-container-high/50 opacity-90'
                }`}
              >
                {/* Header Strip with Status and ID */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(purchase.status)}
                    <span className="text-xs font-mono font-bold text-primary">
                      #{purchase.id}
                    </span>
                  </div>

                  {/* Event Info and Price */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <h2
                        className={`font-headline font-bold text-base text-on-surface truncate ${
                          purchase.status === 'reembolsada' ? 'line-through opacity-70' : ''
                        }`}
                      >
                        {purchase.eventName}
                      </h2>
                      <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                        {purchase.venue}
                      </p>
                      <p className="text-[11px] text-tertiary font-semibold mt-0.5">
                        {purchase.eventDisplayDate}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-headline text-base font-bold ${
                          purchase.status === 'reembolsada'
                            ? 'line-through text-on-surface-variant'
                            : 'text-primary'
                        }`}
                      >
                        ${purchase.totalPrice.toLocaleString('es-AR')}
                      </span>
                      <p className="text-[10px] text-on-surface-variant uppercase font-semibold">
                        {purchase.tierName} × {purchase.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Notice: Days Remaining on Confirmed Tickets */}
                  {purchase.status === 'confirmada' && (
                    <div className="flex items-center justify-between p-2.5 bg-tertiary-container/15 rounded-xl text-tertiary border border-tertiary/20">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">
                          hourglass_top
                        </span>
                        <span className="text-xs font-bold">
                          Faltan {daysLeft} días para el evento
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-tertiary/20 font-bold">
                        Pase Listo
                      </span>
                    </div>
                  )}

                  {/* Notice: Pending Payment Alert */}
                  {purchase.status === 'pendiente' && (
                    <div className="flex items-center justify-between p-2.5 bg-amber-400/15 rounded-xl text-amber-300 border border-amber-400/20">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">
                          alarm
                        </span>
                        <span className="text-xs font-bold">
                          Vence en {purchase.expiresIn || '2 horas'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => payPendingPurchase(purchase.id)}
                        className="text-xs font-bold text-on-primary bg-primary px-3 py-1 rounded-lg hover:bg-primary-container"
                      >
                        Pagar Ahora
                      </button>
                    </div>
                  )}

                  {/* Perforated Stub Line */}
                  <div className="relative my-1 flex items-center justify-center">
                    <div className="w-full border-t border-dashed border-outline-variant/50" />
                    <div className="absolute -left-6 w-4 h-4 bg-surface rounded-full shadow-inner" />
                    <div className="absolute -right-6 w-4 h-4 bg-surface rounded-full shadow-inner" />
                  </div>

                  {/* Action CTAs */}
                  <div className="flex flex-col gap-2 pt-1">
                    {/* Primary QR Button for Confirmed Tickets */}
                    {purchase.status === 'confirmada' && (
                      <button
                        type="button"
                        onClick={() => openQRModal(purchase)}
                        className="w-full h-11 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all hover:bg-primary-container"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          qr_code_scanner
                        </span>
                        <span>Ver Código QR Dinámico</span>
                      </button>
                    )}

                    {/* Secondary Actions Row */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Chat always available */}
                      <button
                        type="button"
                        onClick={() =>
                          navigateTo('purchase_chat', { purchaseId: purchase.id })
                        }
                        className="h-10 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[16px] text-tertiary">
                          chat
                        </span>
                        <span>Chat Soporte</span>
                      </button>

                      {/* Cancel / Refund only if not used and confirmed */}
                      {purchase.status === 'confirmada' && (
                        <button
                          type="button"
                          onClick={() => handleCancelClick(purchase)}
                          className="h-10 rounded-xl bg-secondary-container/20 hover:bg-secondary-container/30 text-secondary font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            currency_exchange
                          </span>
                          <span>Reembolsar</span>
                        </button>
                      )}

                      {/* Rate action if used and not yet rated */}
                      {purchase.status === 'utilizada' && (
                        <button
                          type="button"
                          disabled={purchase.hasRated}
                          onClick={() =>
                            navigateTo('rate_event', {
                              purchaseId: purchase.id,
                              eventId: purchase.eventId,
                            })
                          }
                          className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 ${
                            purchase.hasRated
                              ? 'bg-surface-variant text-on-surface-variant/40 cursor-not-allowed'
                              : 'bg-primary-container text-on-primary-container shadow-sm hover:brightness-110'
                          }`}
                        >
                          <span
                            className="material-symbols-outlined text-[16px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          <span>{purchase.hasRated ? 'Calificado' : '★ Calificar'}</span>
                        </button>
                      )}

                      {purchase.status === 'reembolsada' && (
                        <div className="h-10 rounded-xl bg-surface-container-high/40 text-on-surface-variant text-xs flex items-center justify-center font-mono">
                          Reembolso OK
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
