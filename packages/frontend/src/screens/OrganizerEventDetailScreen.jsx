import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const OrganizerEventDetailScreen = () => {
  const {
    events,
    selectedEventId,
    purchases,
    markPurchaseAsUsed,
    navigateTo,
    showToast,
  } = useApp();

  const event = events.find((e) => e.id === selectedEventId) || events[0];

  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [searchBuyerQuery, setSearchBuyerQuery] = useState('');
  const [showQRScannerModal, setShowQRScannerModal] = useState(false);
  const [scannedTicketId, setScannedTicketId] = useState('');

  if (!event) {
    return (
      <div className="p-8 text-center text-on-surface">
        Evento no encontrado
      </div>
    );
  }

  // Purchases for this event
  const eventPurchases = purchases.filter((p) => p.eventId === event.id);

  const filteredPurchases = eventPurchases.filter((p) => {
    const matchesStatus =
      activeStatusFilter === 'all' || p.status === activeStatusFilter;
    const matchesSearch =
      !searchBuyerQuery ||
      p.buyerName.toLowerCase().includes(searchBuyerQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchBuyerQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate totals
  const totalSold = event.tiers.reduce((s, t) => s + t.soldCount, 0);
  const totalCap = event.tiers.reduce((s, t) => s + t.totalQuota, 0);
  const totalRev = event.tiers.reduce((s, t) => s + t.soldCount * t.price, 0);
  const totalPct = totalCap > 0 ? Math.min(100, Math.round((totalSold / totalCap) * 100)) : 0;

  const handleSimulateScan = () => {
    const idToUse = scannedTicketId.trim().toUpperCase() || 'TK-8492';
    const found = purchases.find((p) => p.id === idToUse && p.eventId === event.id);

    if (!found) {
      showToast(`No se encontró ticket #${idToUse} para este evento`, 'error');
      return;
    }

    if (found.status === 'utilizada') {
      showToast(`¡Alerta! Entrada #${idToUse} ya fue utilizada previamente`, 'info');
      setShowQRScannerModal(false);
      return;
    }

    markPurchaseAsUsed(found.id);
    setShowQRScannerModal(false);
    setScannedTicketId('');
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-32 pt-2 px-4 space-y-4">
      {/* Resumen Superior Event Hero Card */}
      <section className="relative w-full rounded-2xl overflow-hidden bg-surface-container shadow-md flex flex-col border border-surface-container-high/60">
        <div className="relative w-full h-36 bg-surface-container-highest overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/60 to-transparent" />

          {/* Pill Estado Flotante */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-[10px] text-tertiary font-bold uppercase tracking-wider">
              {event.status === 'active' ? 'Publicado • En Venta' : 'Finalizado'}
            </span>
          </div>

          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-container-highest/80 backdrop-blur-md">
            <span className="text-[10px] text-on-surface-variant font-medium">
              {event.organizerName}
            </span>
          </div>
        </div>

        {/* Info del Evento */}
        <div className="p-4 flex flex-col gap-3 -mt-4 relative z-10">
          <h2 className="font-headline font-bold text-lg text-on-surface">
            {event.name}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-primary">
                calendar_month
              </span>
              <span>{event.displayDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-tertiary">
                location_on
              </span>
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          {/* Métricas Clave en Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-surface-container-low rounded-xl p-3 flex flex-col justify-between border border-surface-container-high/40">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                Recaudación Total
              </span>
              <span className="font-headline text-base font-bold text-on-surface tracking-tight mt-1 truncate">
                ${totalRev.toLocaleString('es-AR')}{' '}
                <span className="text-[10px] text-on-surface-variant font-normal">
                  ARS
                </span>
              </span>
              <span className="text-[10px] text-emerald-400 mt-0.5">
                +18% vs meta base
              </span>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3 flex flex-col justify-between border border-surface-container-high/40">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                Aforo Vendido
              </span>
              <span className="font-headline text-base font-bold text-on-surface tracking-tight mt-1">
                {totalSold}{' '}
                <span className="text-xs text-on-surface-variant font-normal">
                  / {totalCap}
                </span>
              </span>
              <div className="w-full bg-surface-variant rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${totalPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desglose Analítico de Cupos por Tipo de Entrada */}
      <section className="flex flex-col space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-on-surface">
            <span className="material-symbols-outlined text-primary text-[18px]">
              analytics
            </span>
            <h3 className="font-headline text-sm">Capacidad y Cupos</h3>
          </div>
          <span className="text-on-surface-variant">
            {totalPct}% ocupación total
          </span>
        </div>

        <div className="space-y-2.5">
          {event.tiers.map((tier) => {
            const available = Math.max(0, tier.totalQuota - tier.soldCount);
            const tierPct =
              tier.totalQuota > 0
                ? Math.min(100, Math.round((tier.soldCount / tier.totalQuota) * 100))
                : 0;
            const isSoldOut = available === 0;

            return (
              <div
                key={tier.id}
                className="bg-surface-container rounded-2xl p-3.5 shadow-sm flex flex-col space-y-2 border border-surface-container-high/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-xs sm:text-sm text-on-surface">
                        {tier.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-mono">
                        ${tier.price.toLocaleString('es-AR')} ARS
                      </span>
                    </div>
                    {tier.description && (
                      <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                        {tier.description}
                      </p>
                    )}
                  </div>

                  <div>
                    {isSoldOut ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-bold">
                        Agotado
                      </span>
                    ) : available <= 10 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 font-bold">
                        Últimos cupos
                      </span>
                    ) : (
                      <span className="text-xs text-primary font-bold">
                        {tierPct}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSoldOut
                        ? 'bg-secondary'
                        : available <= 10
                        ? 'bg-amber-400'
                        : 'bg-primary-container'
                    }`}
                    style={{ width: `${tierPct}%` }}
                  />
                </div>

                {/* Grid 3 métricas */}
                <div className="grid grid-cols-3 gap-1 pt-1 text-center bg-surface-container-low rounded-xl py-1.5 border border-surface-container-high/40">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">
                      Vendidas
                    </span>
                    <span className="font-bold text-xs text-on-surface">
                      {tier.soldCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">
                      Disponibles
                    </span>
                    <span
                      className={`font-bold text-xs ${
                        isSoldOut ? 'text-error' : 'text-tertiary'
                      }`}
                    >
                      {available}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">
                      Total
                    </span>
                    <span className="font-bold text-xs text-on-surface-variant">
                      {tier.totalQuota}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Gestión y Lista de Compras de Asistentes */}
      <section className="flex flex-col space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-sm sm:text-base text-on-surface">
              Compras de Asistentes
            </h3>
            <p className="text-[11px] text-on-surface-variant">
              {eventPurchases.length} órdenes registradas
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowQRScannerModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold active:scale-95 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[16px]">
              qr_code_scanner
            </span>
            <span>Check-in</span>
          </button>
        </div>

        {/* Filter Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveStatusFilter('all')}
            className={`shrink-0 h-8 px-3 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              activeStatusFilter === 'all'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Todas ({eventPurchases.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveStatusFilter('confirmada')}
            className={`shrink-0 h-8 px-3 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              activeStatusFilter === 'confirmada'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Confirmadas ({eventPurchases.filter((p) => p.status === 'confirmada').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveStatusFilter('pendiente')}
            className={`shrink-0 h-8 px-3 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              activeStatusFilter === 'pendiente'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Pendientes ({eventPurchases.filter((p) => p.status === 'pendiente').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveStatusFilter('utilizada')}
            className={`shrink-0 h-8 px-3 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              activeStatusFilter === 'utilizada'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Utilizadas ({eventPurchases.filter((p) => p.status === 'utilizada').length})
          </button>
        </div>

        {/* Lista de tarjetas de compras */}
        <div className="space-y-3">
          {filteredPurchases.length === 0 ? (
            <div className="p-6 text-center text-xs text-on-surface-variant bg-surface-container rounded-2xl border border-surface-container-high/40">
              No hay órdenes en esta categoría.
            </div>
          ) : (
            filteredPurchases.map((purchase) => {
              const isUsed = purchase.status === 'utilizada';
              const isPending = purchase.status === 'pendiente';

              return (
                <article
                  key={purchase.id}
                  className="bg-surface-container rounded-2xl p-4 shadow-sm space-y-3 border border-surface-container-high/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center shrink-0 text-primary font-bold text-xs border border-outline-variant/30">
                        {purchase.buyerAvatar ? (
                          <img
                            src={purchase.buyerAvatar}
                            alt={purchase.buyerName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          purchase.buyerName.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-headline font-bold text-xs sm:text-sm text-on-surface truncate">
                            {purchase.buyerName}
                          </h4>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            #{purchase.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant truncate">
                          {purchase.quantity}x {purchase.tierName} • ${purchase.totalPrice.toLocaleString('es-AR')} ARS
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isUsed
                          ? 'bg-surface-variant text-on-surface-variant'
                          : isPending
                          ? 'bg-amber-400/15 text-amber-300'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {isUsed
                        ? 'Utilizada'
                        : isPending
                        ? 'Pendiente'
                        : 'Confirmada'}
                    </span>
                  </div>

                  {/* Checked-in detail if used */}
                  {isUsed && (
                    <div className="flex items-center gap-1 text-[11px] text-on-surface-variant pt-1 border-t border-surface-container-high/40">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">
                        check_circle
                      </span>
                      <span>
                        {purchase.checkedInAt || 'Ingreso registrado en molinete'}
                      </span>
                    </div>
                  )}

                  {/* Actions for this purchase */}
                  <div className="flex items-center gap-2 pt-1">
                    {/* Open direct chat with this buyer */}
                    <button
                      type="button"
                      onClick={() =>
                        navigateTo('purchase_chat', { purchaseId: purchase.id })
                      }
                      className="flex-1 h-9 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px] text-tertiary">
                        chat
                      </span>
                      <span>Chat</span>
                    </button>

                    {/* Check-in / mark as used button if confirmed */}
                    {!isUsed && purchase.status === 'confirmada' && (
                      <button
                        type="button"
                        onClick={() => markPurchaseAsUsed(purchase.id)}
                        className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          how_to_reg
                        </span>
                        <span>Check-in</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* Modal Simulador de Escáner QR */}
      {showQRScannerModal && (
        <div
          className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowQRScannerModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-surface-container p-6 flex flex-col items-center text-center gap-4 shadow-2xl border border-surface-container-high animate-in fade-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">
                qr_code_scanner
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-headline font-bold text-base text-on-surface">
                Simulador de Escáner de Molinete
              </h3>
              <p className="text-xs text-on-surface-variant">
                Ingresa o selecciona un número de orden para validar el acceso en vivo:
              </p>
            </div>

            <div className="w-full flex flex-col gap-2">
              <input
                type="text"
                value={scannedTicketId}
                onChange={(e) => setScannedTicketId(e.target.value)}
                placeholder="Ej. TK-8492"
                className="w-full h-11 px-3 bg-surface-container-high rounded-xl text-center font-mono text-sm uppercase text-on-surface outline-none border border-surface-container-highest"
              />

              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-on-surface-variant">Prueba rápida:</span>
                <button
                  type="button"
                  onClick={() => setScannedTicketId('TK-8492')}
                  className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[11px]"
                >
                  TK-8492
                </button>
                <button
                  type="button"
                  onClick={() => setScannedTicketId('TK-8450')}
                  className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[11px]"
                >
                  TK-8450
                </button>
              </div>
            </div>

            <div className="flex flex-col w-full gap-2 pt-1">
              <button
                type="button"
                onClick={handleSimulateScan}
                className="w-full h-11 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center transition-colors active:scale-95"
              >
                Validar e Ingresar
              </button>
              <button
                type="button"
                onClick={() => setShowQRScannerModal(false)}
                className="w-full h-10 rounded-xl bg-transparent text-on-surface-variant font-semibold text-xs hover:text-on-surface"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
