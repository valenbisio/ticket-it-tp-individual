import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const OrganizerEventsScreen = () => {
  const { events, currentUser, navigateTo } = useApp();

  const [filterTab, setFilterTab] = useState('all');

  // Filter events created by this organizer (or all organizer demo events)
  const organizerEvents = events.filter(
    (ev) => ev.organizerId === currentUser.id || ev.organizerId === 'salanorte'
  );

  const filteredEvents = organizerEvents.filter((ev) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'active') return ev.status === 'active';
    if (filterTab === 'closed') return ev.status === 'closed' || ev.status === 'draft';
    return true;
  });

  // Calculate overall metrics
  const totalRevenue = organizerEvents.reduce((sum, ev) => {
    return (
      sum +
      ev.tiers.reduce((tSum, t) => tSum + t.soldCount * t.price, 0)
    );
  }, 0);

  const totalSold = organizerEvents.reduce((sum, ev) => {
    return sum + ev.tiers.reduce((tSum, t) => tSum + t.soldCount, 0);
  }, 0);

  const totalCapacity = organizerEvents.reduce((sum, ev) => {
    return sum + ev.tiers.reduce((tSum, t) => tSum + t.totalQuota, 0);
  }, 0);

  const capacityPct = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
  const activeCount = organizerEvents.filter((e) => e.status === 'active').length;
  const closedCount = organizerEvents.filter((e) => e.status !== 'active').length;

  return (
    <div className="flex-1 flex flex-col w-full pb-28 pt-2 px-4 space-y-4">
      {/* Profile & Reputation Header */}
      <div className="flex flex-col bg-surface-container rounded-2xl p-4 shadow-md border border-surface-container-high/60 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high overflow-hidden shrink-0 shadow-sm border border-outline-variant/30 flex items-center justify-center">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-primary text-[24px]">
                festival
              </span>
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-headline font-bold text-sm sm:text-base text-on-surface truncate">
                {currentUser.name}
              </span>
              <span
                className="material-symbols-outlined text-[16px] text-tertiary"
                style={{ fontVariationSettings: "'FILL' 1" }}
                title="Organizador Verificado"
              >
                verified
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <div className="flex items-center gap-0.5 text-amber-400">
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="font-bold text-on-surface">
                  {currentUser.rating || 4.9}
                </span>
              </div>
              <span>•</span>
              <span className="truncate">
                {currentUser.reviewsCount || 128} reseñas verificadas
              </span>
            </div>
          </div>
        </div>

        {/* Quick KPIs Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* KPI 1 */}
          <div className="flex flex-col p-2.5 rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/40">
            <div className="flex items-center gap-1 text-tertiary mb-1">
              <span className="material-symbols-outlined text-[14px]">
                payments
              </span>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold truncate">
                Recaudación
              </span>
            </div>
            <span className="font-headline font-extrabold text-xs sm:text-sm text-on-surface tracking-tight truncate">
              ${(totalRevenue / 1000000).toFixed(2)}M
            </span>
            <span className="text-[10px] text-outline truncate">ARS neto</span>
          </div>

          {/* KPI 2 */}
          <div className="flex flex-col p-2.5 rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/40">
            <div className="flex items-center gap-1 text-primary mb-1">
              <span className="material-symbols-outlined text-[14px]">
                confirmation_number
              </span>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold truncate">
                Entradas
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline font-extrabold text-xs sm:text-sm text-on-surface">
                {totalSold}
              </span>
              <span className="text-[10px] text-outline">/{totalCapacity}</span>
            </div>
            <span className="text-[10px] font-bold text-tertiary truncate">
              {capacityPct}% aforo
            </span>
          </div>

          {/* KPI 3 */}
          <div className="flex flex-col p-2.5 rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/40">
            <div className="flex items-center gap-1 text-secondary mb-1">
              <span className="material-symbols-outlined text-[14px]">podium</span>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold truncate">
                Cartelera
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline font-extrabold text-xs sm:text-sm text-on-surface">
                {activeCount}
              </span>
              <span className="text-[10px] text-outline">activos</span>
            </div>
            <span className="text-[10px] text-on-surface-variant truncate">
              {closedCount} finalizado
            </span>
          </div>
        </div>
      </div>

      {/* Primary CTA Action: Crear Nuevo Evento */}
      <button
        type="button"
        onClick={() => navigateTo('organizer_create_event')}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-container via-inverse-primary to-primary text-on-primary-container flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20 active:scale-[0.98] transition-transform font-headline font-bold text-xs sm:text-sm border border-primary/30"
      >
        <span className="material-symbols-outlined text-[20px]">
          add_circle
        </span>
        <span>Crear Nuevo Evento</span>
      </button>

      {/* Segmented Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
            filterTab === 'all'
              ? 'bg-primary-container text-on-primary-container shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Todos</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-container-highest text-[10px]">
            {organizerEvents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('active')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
            filterTab === 'active'
              ? 'bg-primary-container text-on-primary-container shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Publicados</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-container-highest text-[10px]">
            {activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('closed')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
            filterTab === 'closed'
              ? 'bg-primary-container text-on-primary-container shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Borradores / Finalizados</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-container-highest text-[10px]">
            {closedCount}
          </span>
        </button>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-4">
        {filteredEvents.map((ev) => {
          const evSold = ev.tiers.reduce((s, t) => s + t.soldCount, 0);
          const evCap = ev.tiers.reduce((s, t) => s + t.totalQuota, 0);
          const pct = evCap > 0 ? Math.min(100, Math.round((evSold / evCap) * 100)) : 0;
          const evRev = ev.tiers.reduce((s, t) => s + t.soldCount * t.price, 0);
          const remaining = Math.max(0, evCap - evSold);
          const isClosed = ev.status === 'closed';

          return (
            <div
              key={ev.id}
              className={`group flex flex-col bg-surface-container rounded-2xl overflow-hidden shadow-md border transition-all ${
                isClosed
                  ? 'border-surface-container-high/40 opacity-85'
                  : 'border-surface-container-high/60 hover:border-primary/40'
              }`}
            >
              {/* Media Banner with Scrim */}
              <div className="relative w-full h-36 bg-surface-container-high overflow-hidden">
                <img
                  src={ev.imageUrl}
                  alt={ev.name}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                    isClosed ? 'grayscale-[25%]' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/40 to-transparent" />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isClosed ? 'bg-outline' : 'bg-tertiary animate-pulse'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isClosed ? 'text-on-surface-variant' : 'text-tertiary'
                    }`}
                  >
                    {isClosed ? 'Finalizado' : `En Venta • ${pct}%`}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container shadow-sm text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[13px]">
                      chat
                    </span>
                    <span>Consultas</span>
                  </div>
                </div>
              </div>

              {/* Content Details */}
              <div className="p-4 flex flex-col gap-3 -mt-2 relative z-10">
                <div>
                  <h2 className="font-headline font-bold text-base text-on-surface">
                    {ev.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant text-xs">
                    <span className="material-symbols-outlined text-[15px] text-tertiary">
                      calendar_today
                    </span>
                    <span>{ev.displayDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-on-surface-variant text-xs">
                    <span className="material-symbols-outlined text-[15px] text-outline">
                      location_on
                    </span>
                    <span className="truncate">{ev.venue}</span>
                  </div>
                </div>

                {/* Metrics Box */}
                <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-surface-container-high/40">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-primary">
                        groups
                      </span>
                      <span className="font-bold text-on-surface">{evSold}</span>
                      <span className="text-on-surface-variant">/ {evCap} vendidas</span>
                    </div>
                    <div className="font-headline font-bold text-tertiary">
                      ${evRev.toLocaleString('es-AR')}{' '}
                      <span className="text-[10px] text-outline font-normal">ARS</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-on-surface-variant text-[11px]">
                    <span>Aforo completado {pct}%</span>
                    <span className="text-primary font-semibold">
                      {isClosed ? 'Edición cerrada' : `${remaining} restantes`}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      navigateTo('organizer_event_detail', { eventId: ev.id })
                    }
                    className="flex-1 h-10 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[17px] text-primary">
                      tune
                    </span>
                    <span>Administrar Evento</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigateTo('organizer_event_detail', { eventId: ev.id })
                    }
                    title="Escanear ingresos de este evento"
                    className="h-10 px-3 rounded-xl bg-primary-container/20 hover:bg-primary-container/30 text-primary text-xs font-bold flex items-center justify-center gap-1 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      qr_code_scanner
                    </span>
                    <span>Accesos</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
