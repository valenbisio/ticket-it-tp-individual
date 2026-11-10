/* eslint-disable react/prop-types */
import React from 'react';
import { useApp } from '../contexts/AppContext.jsx';

export const Header = ({
  showBack = false,
  title,
  subtitle,
  rightAction,
}) => {
  const { currentRole, currentUser, setRole, navigateTo, goBack } = useApp();

  const handleToggleRole = () => {
    const nextRole = currentRole === 'buyer' ? 'organizer' : 'buyer';
    setRole(nextRole);
    if (nextRole === 'buyer') {
      navigateTo('buyer_explore');
    } else {
      navigateTo('organizer_events');
    }
  };

  return (
    <header className="sticky top-0 w-full z-40 pt-safe bg-surface/85 backdrop-blur-xl border-b border-surface-container-high/50 shadow-sm transition-colors">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Left Slot: Back Button or Logo Lockup */}
        <div className="flex items-center gap-2 min-w-0">
          {showBack ? (
            <button
              onClick={goBack}
              aria-label="Volver atrás"
              className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors active:scale-90"
            >
              <span className="material-symbols-outlined text-[22px]">
                arrow_back_ios_new
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigateTo(currentRole === 'buyer' ? 'buyer_explore' : 'organizer_events')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-[0_0_12px_rgba(128,131,255,0.35)] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">
                  confirmation_number
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline font-extrabold text-sm sm:text-base tracking-tight text-on-surface">
                    AI Ticket It
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-tertiary-container/30 text-tertiary text-[10px] font-bold tracking-wider">
                    AI
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant font-medium truncate max-w-[120px]">
                  {subtitle || (currentRole === 'buyer' ? 'Explorar' : 'Mis Eventos')}
                </span>
              </div>
            </button>
          )}

          {showBack && title && (
            <h1 className="font-headline font-bold text-base text-on-surface truncate ml-1">
              {title}
            </h1>
          )}
        </div>

        {/* Right Slot: Role Quick-Toggle & User Profile Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {rightAction}

          {/* Quick role changer button */}
          <button
            onClick={handleToggleRole}
            title={`Cambiar a rol ${currentRole === 'buyer' ? 'Organizador' : 'Comprador'}`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-all text-xs font-semibold active:scale-95 border border-outline-variant/30"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                currentRole === 'buyer' ? 'bg-primary' : 'bg-tertiary'
              } animate-pulse`}
            />
            <span className="text-on-surface capitalize">
              {currentRole === 'buyer' ? 'Comprador' : 'Organizador'}
            </span>
            <span className="material-symbols-outlined text-[15px] text-on-surface-variant">
              swap_horiz
            </span>
          </button>

          {/* User Profile avatar to jump to role / user selector */}
          <button
            onClick={() => navigateTo('role_select')}
            title={`Perfil actual: ${currentUser.name}. Toca para cambiar usuario o rol`}
            className="w-8 h-8 rounded-full ring-2 ring-primary/40 overflow-hidden bg-primary flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-sm"
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
