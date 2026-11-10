import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';

const CATEGORIES = [
  'Todas',
  'Recitales',
  'Teatro',
  'Festivales',
  'Conferencias',
  'Deportes',
];

export const ExploreEventsScreen = () => {
  const { events, favorites, toggleFavorite, navigateTo, currentUser, purchases } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState('date');

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        if (ev.status === 'draft') return false;

        const matchesCat =
          selectedCategory === 'Todas' || ev.category === selectedCategory;

        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          ev.name.toLowerCase().includes(q) ||
          ev.venue.toLowerCase().includes(q) ||
          ev.organizerName.toLowerCase().includes(q) ||
          (ev.lineup && ev.lineup.some((art) => art.name.toLowerCase().includes(q)));

        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price') {
          const minA = Math.min(...a.tiers.map((t) => t.price));
          const minB = Math.min(...b.tiers.map((t) => t.price));
          return minA - minB;
        }
        if (sortBy === 'rating') {
          return b.organizerRating - a.organizerRating;
        }
        // date ascending
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [events, selectedCategory, searchQuery, sortBy]);

  const hasPurchases = purchases.some((p) => p.buyerId === currentUser.id);

  return (
    <div className="flex-1 flex flex-col w-full pb-28 pt-2 px-4 space-y-4">
      {/* Saludo Personalizado y Localidad */}
      <section className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-surface-container-high shadow-md border border-outline-variant/30">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-tertiary shadow-[0_0_8px_rgba(76,215,246,0.8)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
              ¡Hola de nuevo!
            </span>
            <h1 className="font-headline font-bold text-lg text-on-surface tracking-tight">
              ¡Hola {currentUser.name.split(' ')[0]}! 👋
            </h1>
          </div>
        </div>

        {/* City Selector Pill */}
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors shadow-sm text-left border border-outline-variant/30"
        >
          <span
            className="material-symbols-outlined text-[15px] text-tertiary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            location_on
          </span>
          <span className="text-xs font-semibold text-on-surface">
            Buenos Aires
          </span>
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
            expand_more
          </span>
        </button>
      </section>

      {/* AI Smart Match Banner */}
      <section className="p-3.5 rounded-2xl bg-gradient-to-r from-surface-container-high via-surface-container-highest to-surface-container-high relative overflow-hidden shadow-md border border-outline-variant/20">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-primary-container/20 blur-xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary shadow-[0_0_10px_rgba(76,215,246,0.3)]">
              <span className="material-symbols-outlined text-[18px]">
                auto_awesome
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-on-surface font-bold">
                Smart Match IA
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Cartelera personalizada para tus gustos musicales
              </span>
            </div>
          </div>
          <span className="text-[10px] text-tertiary font-bold bg-surface-container-lowest/60 px-2 py-1 rounded-full uppercase tracking-wider">
            Activo
          </span>
        </div>
      </section>

      {/* Barra de Búsqueda */}
      <section className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, artista o sala..."
          className="w-full h-12 pl-11 pr-10 rounded-xl bg-surface-container-high text-on-surface placeholder:text-outline text-sm focus:outline-none focus:bg-surface-container-highest transition-all shadow-inner border border-surface-container-highest"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </section>

      {/* Horizontal Category Chips */}
      <section className="w-full -mx-4 px-4 overflow-x-auto flex items-center gap-2 no-scrollbar py-0.5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
                isSelected
                  ? 'bg-primary-container text-on-primary-container shadow-md shadow-primary-container/20 ring-1 ring-primary/40'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </section>

      {/* Ordenar por Controles */}
      <section className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">
            <span className="material-symbols-outlined text-[15px]">sort</span>
            <span>Ordenar por</span>
          </div>
          <span className="text-tertiary font-medium">
            {filteredEvents.length} evento{filteredEvents.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSortBy('price')}
            className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors active:scale-95 ${
              sortBy === 'price'
                ? 'bg-primary-container/20 text-primary font-bold border border-primary/40'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              payments
            </span>
            <span className="truncate">Precio ($)</span>
          </button>

          <button
            type="button"
            onClick={() => setSortBy('date')}
            className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors active:scale-95 ${
              sortBy === 'date'
                ? 'bg-primary-container/20 text-primary font-bold border border-primary/40'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              event
            </span>
            <span className="truncate">Fecha</span>
          </button>

          <button
            type="button"
            onClick={() => setSortBy('rating')}
            className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors active:scale-95 ${
              sortBy === 'rating'
                ? 'bg-primary-container/20 text-primary font-bold border border-primary/40'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span
              className="material-symbols-outlined text-[14px] text-tertiary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="truncate">Puntaje</span>
          </button>
        </div>
      </section>

      {/* Lista Vertical de Eventos */}
      <section className="flex flex-col gap-4 mt-2">
        {filteredEvents.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-surface-container-low rounded-2xl border border-surface-container-high/40">
            <span className="material-symbols-outlined text-[44px] text-on-surface-variant mb-2">
              event_busy
            </span>
            <h3 className="font-headline font-bold text-base text-on-surface">
              No se encontraron eventos
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
              Intenta con otra categoría o término de búsqueda.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todas');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-primary hover:bg-surface-container-highest"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const isFav = favorites.includes(ev.id);
            const minPrice = Math.min(...ev.tiers.map((t) => t.price));
            const totalRemaining = ev.tiers.reduce(
              (acc, t) => acc + Math.max(0, t.totalQuota - t.soldCount),
              0
            );

            return (
              <article
                key={ev.id}
                onClick={() => navigateTo('buyer_event_detail', { eventId: ev.id })}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-surface-container-low shadow-xl border border-surface-container-high/60 cursor-pointer active:scale-[0.99] transition-all hover:border-primary/40"
              >
                {/* Media Header con Gradiente y Badges */}
                <div className="relative w-full h-48 overflow-hidden bg-surface-container-high">
                  <img
                    src={ev.imageUrl}
                    alt={ev.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent" />

                  {/* Badges Superiores */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-tertiary shadow-sm">
                        {ev.category}
                      </span>
                      {totalRemaining <= 20 && totalRemaining > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-secondary-container/90 text-on-secondary-container backdrop-blur-md text-[10px] font-bold flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                          Últimas {totalRemaining} entradas
                        </span>
                      )}
                      {totalRemaining === 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container backdrop-blur-md text-[10px] font-bold shadow-sm">
                          Agotado
                        </span>
                      )}
                    </div>

                    {/* Botón Favorito */}
                    <button
                      type="button"
                      aria-label="Guardar en favoritos"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(ev.id);
                      }}
                      className="w-9 h-9 rounded-full bg-surface-container-lowest/70 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-secondary active:scale-90 transition-all shadow-md"
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] transition-colors ${
                          isFav ? 'text-secondary' : 'text-on-surface'
                        }`}
                        style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                    </button>
                  </div>

                  {/* Fecha Flotante */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high/90 backdrop-blur-md shadow text-xs">
                    <span className="material-symbols-outlined text-[15px] text-tertiary">
                      calendar_today
                    </span>
                    <span className="font-semibold text-on-surface">
                      {ev.displayDate}
                    </span>
                  </div>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-headline font-bold text-base text-on-surface tracking-tight group-hover:text-primary transition-colors">
                      {ev.name}
                    </h2>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 truncate">
                      <span className="material-symbols-outlined text-[14px]">
                        location_on
                      </span>
                      <span className="truncate">{ev.venue}</span>
                    </p>
                  </div>

                  {/* Meta Puntaje y Precio Desde */}
                  <div className="flex items-center justify-between pt-1 border-t border-surface-container-high/50">
                    {/* Organizador y Rating */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-container-high/60">
                      <span
                        className="material-symbols-outlined text-[15px] text-tertiary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="text-xs font-bold text-on-surface">
                        {ev.organizerRating.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        ({ev.organizerReviewsCount})
                      </span>
                    </div>

                    {/* Precio Desde */}
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        Desde
                      </span>
                      <span className="font-headline text-base text-tertiary font-extrabold tracking-tight">
                        ${minPrice.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="pt-1 flex items-center justify-between text-primary text-xs font-bold uppercase tracking-wider">
                    <span>Ver sectores disponibles</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Banner Acceso Rápido a Mis Compras */}
      {hasPurchases && (
        <section className="mt-4 p-4 rounded-2xl bg-surface-container flex items-center justify-between shadow-md border border-surface-container-high/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">
                confirmation_number
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">
                ¿Ya tienes tickets?
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Accede al código dinámico sin conexión
              </span>
            </div>
          </div>
          <button
            onClick={() => navigateTo('buyer_purchases')}
            className="px-3.5 py-2 rounded-xl bg-surface-container-highest active:bg-surface-bright text-primary text-xs font-bold transition-colors"
          >
            Mis Compras
          </button>
        </section>
      )}
    </div>
  );
};
