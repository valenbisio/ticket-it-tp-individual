import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const EventDetailScreen = () => {
  const {
    events,
    selectedEventId,
    reviews,
    favorites,
    toggleFavorite,
    createPurchase,
    navigateTo,
    showToast,
  } = useApp();

  const event = events.find((e) => e.id === selectedEventId) || events[0];

  // Quantities per tier
  const [selectedQuantities, setSelectedQuantities] = useState(() => {
    const initial = {};
    event?.tiers.forEach((tier, index) => {
      const remaining = Math.max(0, tier.totalQuota - tier.soldCount);
      initial[tier.id] = index === 0 && remaining > 0 ? 1 : 0;
    });
    return initial;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [purchaseSuccessModal, setPurchaseSuccessModal] = useState(null);

  if (!event) {
    return (
      <div className="p-8 text-center text-on-surface">
        Evento no encontrado
      </div>
    );
  }

  const isFav = favorites.includes(event.id);
  const eventReviews = reviews.filter((r) => r.organizerId === event.organizerId);

  // Calculate totals
  const totalTicketsCount = Object.values(selectedQuantities).reduce((a, b) => a + b, 0);
  const totalPrice = event.tiers.reduce((sum, tier) => {
    const qty = selectedQuantities[tier.id] || 0;
    return sum + qty * tier.price;
  }, 0);

  const handleUpdateQuantity = (tierId, delta) => {
    const tier = event.tiers.find((t) => t.id === tierId);
    if (!tier) return;

    const remaining = Math.max(0, tier.totalQuota - tier.soldCount);
    const currentQty = selectedQuantities[tierId] || 0;
    const nextQty = currentQty + delta;

    if (nextQty < 0) return;
    if (nextQty > remaining) {
      showToast(`Cupo máximo disponible: ${remaining} entradas`, 'info');
      return;
    }
    if (nextQty > 6) {
      showToast('Límite de 6 entradas por usuario', 'info');
      return;
    }

    setSelectedQuantities((prev) => ({
      ...prev,
      [tierId]: nextQty,
    }));
  };

  const handlePurchase = () => {
    if (totalTicketsCount === 0) {
      showToast('Selecciona al menos 1 entrada para comprar', 'info');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      let lastPurchaseId = '';
      const summaryItems = [];

      event.tiers.forEach((tier) => {
        const qty = selectedQuantities[tier.id];
        if (qty > 0) {
          const res = createPurchase(event.id, tier.id, qty, 'confirmada');
          if (res) {
            lastPurchaseId = res.id;
            summaryItems.push(`${qty}x ${tier.name}`);
          }
        }
      });

      setIsProcessing(false);

      if (lastPurchaseId) {
        setPurchaseSuccessModal({
          purchaseId: lastPurchaseId,
          totalQty: totalTicketsCount,
          totalAmount: totalPrice,
          summary: summaryItems.join(' + '),
        });
      }
    }, 800);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: `¡Mira este evento en AI Ticket It: ${event.name}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      showToast('Enlace del evento copiado al portapapeles', 'info');
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-36 relative">
      {/* Hero Inmersivo con Imagen y Gradientes */}
      <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-surface-container-lowest">
        <img
          src={event.imageUrl}
          alt={event.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/60 via-transparent to-transparent" />

        {/* Floating Top Action Buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
          <span className="px-3 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-tertiary">
            {event.category}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleFavorite(event.id)}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-90 shadow-md ${
                isFav
                  ? 'bg-secondary-container/90 text-on-secondary-container'
                  : 'bg-surface-container/70 text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-surface-container/70 backdrop-blur-md flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-transform active:scale-95 shadow-md"
            >
              <span className="material-symbols-outlined text-[19px]">share</span>
            </button>
          </div>
        </div>

        {/* Floating Status Badges at Bottom of Hero */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-surface-container-highest/80 backdrop-blur-md text-tertiary text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
            Edición Oficial
          </span>
          <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-[11px] text-on-surface-variant font-mono">
            {event.displayDate}
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="px-4 flex flex-col gap-6 -mt-2 relative z-10">
        {/* Titular del Evento */}
        <div className="flex flex-col gap-2">
          <h1 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">
            {event.name}
          </h1>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Bento de Fecha, Horarios y Ubicación */}
        <div className="grid grid-cols-1 gap-3">
          {/* Fecha y Horarios */}
          <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-start gap-3.5 shadow-sm border border-surface-container-high/40">
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex flex-col items-center justify-center text-primary flex-shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                HORA
              </span>
              <span className="font-headline font-bold text-sm leading-none">
                {event.showTime || '20:00'}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-on-surface truncate">
                {event.displayDate}
              </span>
              <span className="text-[11px] text-on-surface-variant mt-0.5">
                Apertura {event.doorTime || '18:00'} hs • Inicio Show {event.showTime || '20:00'} hs
              </span>
            </div>
          </div>

          {/* Ubicación y Mapa Preview */}
          <div className="rounded-2xl bg-surface-container-low overflow-hidden shadow-sm flex flex-col border border-surface-container-high/40">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-tertiary-container/30 text-tertiary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px]">
                    location_on
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-on-surface truncate">
                    {event.venue}
                  </span>
                  <span className="text-[11px] text-on-surface-variant truncate">
                    {event.venueAddress}
                  </span>
                </div>
              </div>
            </div>

            {/* Styled Map Preview Strip */}
            <div className="w-full h-20 bg-surface-container-high relative flex items-center justify-center overflow-hidden border-t border-surface-container-high/60">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#4cd7f6_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="px-3 py-1.5 rounded-full bg-surface/90 text-on-surface shadow-md flex items-center gap-1.5 text-xs font-semibold z-10 border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-[15px]">
                  near_me
                </span>
                <span>Ver plano y accesos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Organizador y Reputación */}
        <div className="p-4 rounded-2xl bg-surface-container flex flex-col gap-3 shadow-sm border border-surface-container-high/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  verified_user
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant font-medium">
                  Organizador oficial
                </span>
                <span className="font-headline font-bold text-sm text-on-surface">
                  {event.organizerName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest text-tertiary text-xs font-bold">
              <span
                className="material-symbols-outlined text-[15px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span>{event.organizerRating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-surface-container-high/40">
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-tertiary">
                thumb_up
              </span>
              {event.organizerReviewsCount} reseñas verificadas
            </span>
            <button
              type="button"
              onClick={() => setShowReviewsModal(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 active:opacity-75"
            >
              <span>Ver reseñas</span>
              <span className="material-symbols-outlined text-[15px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>

        {/* Lineup / Artistas si existen */}
        {event.lineup && event.lineup.length > 0 && (
          <div className="flex flex-col gap-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Lineup Confirmado
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Escenario 360°
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {event.lineup.map((art, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-surface-container-low p-2.5 flex flex-col items-center gap-1.5 text-center border border-surface-container-high/40"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container-high shadow-inner">
                    <img
                      src={art.image}
                      alt={art.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-on-surface truncate w-full">
                    {art.name}
                  </span>
                  <span className="text-[10px] text-tertiary font-semibold truncate w-full">
                    {art.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SELECCIÓN DE ENTRADAS (DYNAMIC TIERS) */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-bold text-base text-on-surface">
              Selecciona tus entradas
            </h2>
            <span className="text-[11px] text-on-surface-variant">
              Máx. 6 por usuario
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {event.tiers.map((tier) => {
              const remaining = Math.max(0, tier.totalQuota - tier.soldCount);
              const isSoldOut = remaining === 0;
              const currentQty = selectedQuantities[tier.id] || 0;

              return (
                <div
                  key={tier.id}
                  className={`p-4 rounded-2xl flex flex-col gap-3 transition-colors border ${
                    isSoldOut
                      ? 'bg-surface-container-lowest/50 opacity-60 border-surface-container-high/30'
                      : currentQty > 0
                      ? 'bg-surface-container border-primary/40 shadow-md ring-1 ring-primary/20'
                      : 'bg-surface-container-low border-surface-container-high/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-bold text-sm text-on-surface">
                          {tier.name}
                        </span>
                        {isSoldOut ? (
                          <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">
                            Agotado
                          </span>
                        ) : remaining <= 10 ? (
                          <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                            Últimos cupos
                          </span>
                        ) : null}
                      </div>
                      {tier.description && (
                        <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                          {tier.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="font-headline font-bold text-sm text-on-surface">
                        ${tier.price.toLocaleString('es-AR')}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          isSoldOut ? 'text-outline' : 'text-tertiary'
                        }`}
                      >
                        {isSoldOut ? 'Sin cupos' : `${remaining} disponibles`}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Counter Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/50">
                    <span className="text-xs text-on-surface-variant font-medium">
                      Cantidad
                    </span>

                    {isSoldOut ? (
                      <span className="text-xs text-outline font-semibold">
                        Agotado para esta fecha
                      </span>
                    ) : (
                      <div className="flex items-center gap-3 bg-surface-container-high rounded-xl p-1 border border-outline-variant/30">
                        <button
                          type="button"
                          aria-label={`Restar ${tier.name}`}
                          disabled={currentQty === 0}
                          onClick={() => handleUpdateQuantity(tier.id, -1)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors active:scale-90 ${
                            currentQty === 0
                              ? 'text-on-surface-variant/30 cursor-not-allowed'
                              : 'bg-surface-container text-on-surface hover:bg-surface-bright'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            remove
                          </span>
                        </button>

                        <span className="font-headline font-bold text-sm text-on-surface w-6 text-center tabular-nums">
                          {currentQty}
                        </span>

                        <button
                          type="button"
                          aria-label={`Sumar ${tier.name}`}
                          disabled={currentQty >= remaining || currentQty >= 6}
                          onClick={() => handleUpdateQuantity(tier.id, 1)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors active:scale-90 ${
                            currentQty >= remaining || currentQty >= 6
                              ? 'bg-surface-container text-on-surface-variant/30 cursor-not-allowed'
                              : 'bg-primary text-on-primary hover:bg-primary-container'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            add
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Garantías de Seguridad */}
        <div className="p-3.5 rounded-2xl bg-surface-container-high/40 flex items-center justify-between text-on-surface-variant border border-surface-container-high/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">
              enhanced_encryption
            </span>
            <span className="text-xs">Ticket encriptado con QR dinámico</span>
          </div>
          <span className="text-xs text-tertiary font-semibold">
            Garantía AI Ticket It
          </span>
        </div>
      </div>

      {/* STICKY CHECKOUT BAR INFERIOR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-low/95 backdrop-blur-xl border-t border-surface-container-high/70 shadow-2xl pb-safe">
        <div className="px-4 py-3 flex items-center justify-between gap-4 max-w-lg mx-auto">
          {/* Summary */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-primary">
                {totalTicketsCount} entrada{totalTicketsCount === 1 ? '' : 's'}
              </span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-on-surface-variant">Total</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-lg sm:text-xl font-extrabold text-on-surface tracking-tight">
                ${totalPrice.toLocaleString('es-AR')}
              </span>
              <span className="text-[10px] text-on-surface-variant uppercase">
                ARS
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex-1 max-w-[200px]">
            <button
              type="button"
              disabled={totalTicketsCount === 0 || isProcessing}
              onClick={handlePurchase}
              className={`w-full h-12 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                totalTicketsCount === 0 || isProcessing
                  ? 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-container text-on-primary shadow-primary/25'
              }`}
            >
              {isProcessing ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    refresh
                  </span>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    shopping_bag
                  </span>
                  <span>Comprar Ahora</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Éxito de Compra */}
      {purchaseSuccessModal && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-surface-container p-6 flex flex-col items-center text-center gap-4 shadow-2xl border border-surface-container-high animate-in fade-in slide-in-from-bottom-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">
                check_circle
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-tertiary">
                Compra Confirmada
              </span>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                ¡Nos vemos en {event.name}!
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Tus {purchaseSuccessModal.totalQty} entradas ya están disponibles en tu billetera digital con código anti-fraude.
              </p>
            </div>

            <div className="w-full p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between text-left border border-surface-container-high/50">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface truncate">
                  {event.name}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {purchaseSuccessModal.summary}
                </span>
              </div>
              <span className="text-xs font-mono text-tertiary font-bold">
                ${purchaseSuccessModal.totalAmount.toLocaleString('es-AR')}
              </span>
            </div>

            <div className="flex flex-col w-full gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPurchaseSuccessModal(null);
                  navigateTo('buyer_purchases');
                }}
                className="w-full h-11 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center transition-colors active:scale-95"
              >
                Ver Mis Compras
              </button>
              <button
                type="button"
                onClick={() => setPurchaseSuccessModal(null)}
                className="w-full h-11 rounded-xl bg-transparent text-on-surface-variant font-semibold text-xs hover:text-on-surface"
              >
                Seguir Explorando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reseñas del Organizador */}
      {showReviewsModal && (
        <div
          className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowReviewsModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-surface-container p-5 flex flex-col gap-4 shadow-2xl border border-surface-container-high max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/60">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-tertiary text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Reputación del Organizador
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewsModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-surface-container-high/40">
              <div className="flex flex-col items-center justify-center pr-3 border-r border-surface-container-high/60">
                <span className="font-headline font-extrabold text-2xl text-on-surface">
                  {event.organizerRating.toFixed(1)}
                </span>
                <div className="flex items-center text-tertiary">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className="material-symbols-outlined text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface">
                  {event.organizerName}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {eventReviews.length} reseñas registradas en AI Ticket It
                </span>
              </div>
            </div>

            {/* List of reviews */}
            <div className="flex flex-col gap-3">
              {eventReviews.length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-4">
                  Aún no hay reseñas registradas para este organizador.
                </p>
              ) : (
                eventReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-surface-container-low flex flex-col gap-2 border border-surface-container-high/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-surface-container-high">
                          {rev.buyerAvatar ? (
                            <img
                              src={rev.buyerAvatar}
                              alt={rev.buyerName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">
                              {rev.buyerName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-on-surface">
                          {rev.buyerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined text-[13px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      "{rev.comment}"
                    </p>

                    {rev.criteria && rev.criteria.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {rev.criteria.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-surface-container-high text-[10px] text-on-surface-variant"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowReviewsModal(false)}
              className="w-full h-11 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface mt-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
