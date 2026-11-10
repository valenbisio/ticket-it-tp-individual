import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const BottomTabBar = () => {
  const { currentScreen, navigateTo, purchases } = useApp();

  // Count active purchases for badge
  const activeCount = purchases.filter(
    (p) => p.status === 'confirmada' || p.status === 'pendiente'
  ).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl border-t border-surface-container-high/60 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="h-16 px-4 flex items-center justify-around max-w-lg mx-auto">
        {/* Tab 1: Explorar */}
        <button
          onClick={() => navigateTo('buyer_explore')}
          className={`flex flex-col items-center justify-center min-w-[68px] min-h-[48px] gap-1 transition-all active:scale-95 ${
            currentScreen === 'buyer_explore'
              ? 'text-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span
              className={`material-symbols-outlined text-[24px] transition-transform ${
                currentScreen === 'buyer_explore' ? 'scale-110' : ''
              }`}
              style={{
                fontVariationSettings: currentScreen === 'buyer_explore' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              explore
            </span>
            {currentScreen === 'buyer_explore' && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-tertiary" />
            )}
          </div>
          <span className="text-[11px] font-semibold tracking-wide">
            Explorar
          </span>
        </button>

        {/* Tab 2: Mis Compras */}
        <button
          onClick={() => navigateTo('buyer_purchases')}
          className={`flex flex-col items-center justify-center min-w-[68px] min-h-[48px] gap-1 transition-all active:scale-95 relative ${
            currentScreen === 'buyer_purchases'
              ? 'text-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span
              className={`material-symbols-outlined text-[24px] transition-transform ${
                currentScreen === 'buyer_purchases' ? 'scale-110' : ''
              }`}
              style={{
                fontVariationSettings: currentScreen === 'buyer_purchases' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              receipt_long
            </span>
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-secondary text-[10px] text-on-secondary font-bold leading-none">
                {activeCount}
              </span>
            )}
            {currentScreen === 'buyer_purchases' && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-tertiary" />
            )}
          </div>
          <span className="text-[11px] font-semibold tracking-wide">
            Mis Compras
          </span>
        </button>

        {/* Tab 3: Mis Eventos (Organizador) */}
        <button
          onClick={() => navigateTo('organizer_events')}
          className={`flex flex-col items-center justify-center min-w-[68px] min-h-[48px] gap-1 transition-all active:scale-95 ${
            currentScreen === 'organizer_events' ||
            currentScreen === 'organizer_event_detail' ||
            currentScreen === 'organizer_create_event'
              ? 'text-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span
              className={`material-symbols-outlined text-[24px] transition-transform ${
                currentScreen === 'organizer_events' ? 'scale-110' : ''
              }`}
              style={{
                fontVariationSettings:
                  currentScreen === 'organizer_events' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              event_seat
            </span>
            {(currentScreen === 'organizer_events' ||
              currentScreen === 'organizer_event_detail' ||
              currentScreen === 'organizer_create_event') && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-tertiary" />
            )}
          </div>
          <span className="text-[11px] font-semibold tracking-wide">
            Mis Eventos
          </span>
        </button>
      </div>
    </nav>
  );
};
