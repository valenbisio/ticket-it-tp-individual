import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

/**
 * RoleSelector Component
 * Accessible, centered role selection component featuring two large, attractive buttons:
 * 'Soy Comprador' and 'Soy Organizador' using tokens defined in index.css.
 */
export const RoleSelector = ({ onSelect }) => {
  const {
    currentRole,
    setRole,
    currentUser,
    setUser,
    users,
    navigateTo,
    showToast,
  } = useApp();

  const handleRoleAction = (role, defaultUserId) => {
    setRole(role);
    setUser(defaultUserId);
    const targetUser = users.find((u) => u.id === defaultUserId) || currentUser;
    showToast(
      `Ingresando como ${role === 'buyer' ? 'Comprador' : 'Organizador'} (${targetUser.name})`,
      'info'
    );
    if (onSelect) {
      onSelect(role);
    } else {
      navigateTo(role === 'buyer' ? 'buyer_explore' : 'organizer_events');
    }
  };

  return (
    <section
      role="region"
      aria-label="Selección inicial de rol"
      className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center px-4 py-8 space-y-7"
    >
      {/* Brand Header */}
      <div className="flex flex-col items-center space-y-2.5">
        <div
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10"
          aria-hidden="true"
        >
          <span
            className="material-symbols-outlined text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            confirmation_number
          </span>
        </div>
        <div className="space-y-1">
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl tracking-tight text-on-surface">
            AI Ticket It
          </h1>
          <p className="text-sm text-on-surface-variant max-w-[280px] leading-relaxed">
            Plataforma de eventos en vivo y venta segura de entradas
          </p>
        </div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider">
          Selecciona cómo deseas ingresar
        </p>
      </div>

      {/* Two Large & Attractive Role Buttons */}
      <div className="w-full grid grid-cols-1 gap-4" role="group" aria-label="Opciones de perfil">
        {/* Button 1: Soy Comprador */}
        <button
          type="button"
          onClick={() => handleRoleAction('buyer', 'juan')}
          aria-label="Soy Comprador: Explorar catálogo de espectáculos y comprar entradas"
          aria-describedby="desc-buyer"
          className="group relative w-full text-left p-5 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest active:scale-[0.985] border-2 border-primary/30 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 transition-all duration-200 shadow-xl overflow-hidden cursor-pointer"
        >
          {/* Subtle gradient background accent */}
          <div
            className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-all duration-300 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4 min-w-0">
              {/* Icon Container */}
              <div
                className="w-14 h-14 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform"
                aria-hidden="true"
              >
                <span
                  className="material-symbols-outlined text-[30px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_activity
                </span>
              </div>

              {/* Texts */}
              <div className="flex flex-col min-w-0">
                <span className="font-headline font-extrabold text-lg sm:text-xl text-on-surface tracking-tight group-hover:text-primary transition-colors">
                  Soy Comprador
                </span>
                <span
                  id="desc-buyer"
                  className="text-xs sm:text-sm text-on-surface-variant mt-0.5 line-clamp-2 leading-snug"
                >
                  Explorar catálogo, reservar con QR dinámico y chatear con organizadores
                </span>
                <div className="flex items-center space-x-2 mt-2 text-[11px] font-semibold text-primary">
                  <span className="material-symbols-outlined text-[14px]">
                    qr_code_scanner
                  </span>
                  <span>Acceso seguro & Reembolsos</span>
                </div>
              </div>
            </div>

            {/* Right Arrow Action Cue */}
            <div
              className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-on-primary flex items-center justify-center flex-shrink-0 transition-colors shadow-sm"
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-xl group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </div>
          </div>
        </button>

        {/* Button 2: Soy Organizador */}
        <button
          type="button"
          onClick={() => handleRoleAction('organizer', 'salanorte')}
          aria-label="Soy Organizador: Publicar eventos, definir precios y cupos, y gestionar ventas"
          aria-describedby="desc-organizer"
          className="group relative w-full text-left p-5 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest active:scale-[0.985] border-2 border-tertiary/30 hover:border-tertiary focus-visible:border-tertiary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-tertiary/30 transition-all duration-200 shadow-xl overflow-hidden cursor-pointer"
        >
          {/* Subtle gradient background accent */}
          <div
            className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-tertiary/10 blur-2xl group-hover:bg-tertiary/20 transition-all duration-300 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4 min-w-0">
              {/* Icon Container */}
              <div
                className="w-14 h-14 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform"
                aria-hidden="true"
              >
                <span
                  className="material-symbols-outlined text-[30px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  festival
                </span>
              </div>

              {/* Texts */}
              <div className="flex flex-col min-w-0">
                <span className="font-headline font-extrabold text-lg sm:text-xl text-on-surface tracking-tight group-hover:text-tertiary transition-colors">
                  Soy Organizador
                </span>
                <span
                  id="desc-organizer"
                  className="text-xs sm:text-sm text-on-surface-variant mt-0.5 line-clamp-2 leading-snug"
                >
                  Publicar eventos, configurar tipos de entrada y controlar aforo en vivo
                </span>
                <div className="flex items-center space-x-2 mt-2 text-[11px] font-semibold text-tertiary">
                  <span className="material-symbols-outlined text-[14px]">
                    monitoring
                  </span>
                  <span>Métricas de venta & Check-in</span>
                </div>
              </div>
            </div>

            {/* Right Arrow Action Cue */}
            <div
              className="w-10 h-10 rounded-xl bg-tertiary/10 group-hover:bg-tertiary text-tertiary group-hover:text-on-tertiary flex items-center justify-center flex-shrink-0 transition-colors shadow-sm"
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-xl group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Simulated Profiles Selector (Pre-loaded in memory) */}
      <div className="w-full pt-2">
        <div className="bg-surface-container-low/90 rounded-2xl p-3 border border-surface-container-high/60 backdrop-blur-sm text-left">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
                switch_account
              </span>
              <span>Usuarios de prueba en memoria</span>
            </div>
            <span className="text-[10px] text-outline font-mono uppercase bg-surface-container-highest px-2 py-0.5 rounded-full">
              Demo Sandbox
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Usuario precargado en memoria">
            {users.slice(0, 2).map((user) => {
              const isSelected = currentUser.id === user.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setUser(user.id);
                    setRole(user.role);
                  }}
                  className={`flex items-center space-x-2 p-2 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-surface-container-highest border-primary text-on-surface shadow-sm'
                      : 'bg-surface-container border-transparent text-on-surface-variant hover:bg-surface-container-high'
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                >
                  <img
                    src={user.avatar}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate text-on-surface leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-on-surface-variant truncate">
                      {user.role === 'buyer' ? 'Comprador' : 'Organizador'}
                    </p>
                  </div>
                  {isSelected && (
                    <span
                      className="material-symbols-outlined text-primary text-[16px] flex-shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                      aria-hidden="true"
                    >
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Security & In-Memory Persistence Indicator */}
      <div className="flex items-center justify-center space-x-2 text-xs text-on-surface-variant/80">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
        <span>Persistencia en memoria activa • Acceso inmediato</span>
      </div>
    </section>
  );
};
