import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const DeviceShell = ({ children }) => {
  const {
    deviceFrameMode,
    toggleDeviceFrameMode,
    currentUser,
    currentRole,
    resetData,
    toast,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#070c17] text-on-surface flex flex-col items-center justify-start antialiased py-0 sm:py-6 selection:bg-primary-container/30 selection:text-white">
      {/* Top Testing Utility Ribbon */}
      <div className="w-full max-w-5xl px-4 py-2 flex items-center justify-between text-xs text-on-surface-variant border-b border-surface-container-high/40 mb-2 sm:mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-on-surface hidden sm:inline">
              AI Ticket It • Native Simulator
            </span>
            <span className="font-semibold text-on-surface sm:hidden">
              AI Ticket It
            </span>
          </div>
          <span className="text-outline-variant hidden md:inline">|</span>
          <span className="hidden md:inline">
            Rol:{' '}
            <strong className="text-tertiary capitalize">{currentRole}</strong> (
            {currentUser.name})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset in-memory database */}
          <button
            onClick={resetData}
            title="Reiniciar datos en memoria"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            <span className="hidden sm:inline">Reiniciar Datos</span>
          </button>

          {/* Toggle Phone Frame vs Full View */}
          <button
            onClick={toggleDeviceFrameMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">
              {deviceFrameMode ? 'fullscreen' : 'smartphone'}
            </span>
            <span className="hidden sm:inline">
              {deviceFrameMode ? 'Vista Expandida' : 'Marco Mobile'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceFrameMode
            ? 'max-w-[430px] sm:my-3 sm:rounded-[48px] sm:border-[8px] sm:border-[#1e2638] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden bg-surface relative min-h-[844px]'
            : 'max-w-md md:max-w-lg lg:max-w-2xl bg-surface sm:rounded-2xl sm:shadow-2xl overflow-hidden min-h-screen'
        }`}
      >
        {/* Mobile Device Status Bar (When in Phone Frame) */}
        {deviceFrameMode && (
          <div className="sticky top-0 z-50 h-10 bg-surface/90 backdrop-blur-md px-6 flex items-center justify-between text-[13px] font-semibold text-on-surface select-none pointer-events-none">
            <span className="tracking-tight">9:41</span>
            {/* Dynamic Island pill */}
            <div className="w-24 h-4 bg-black rounded-full shadow-inner flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#171f33] mr-1" />
              <span className="w-2 h-2 rounded-full bg-[#0b1326]" />
            </div>
            <div className="flex items-center gap-1.5 text-[14px]">
              <span className="material-symbols-outlined text-[15px]">signal_cellular_4_bar</span>
              <span className="material-symbols-outlined text-[15px]">wifi</span>
              <span className="material-symbols-outlined text-[17px]">battery_charging_full</span>
            </div>
          </div>
        )}

        {/* Child Screen Content */}
        <div className="flex flex-col min-h-[calc(100vh-120px)] sm:min-h-[800px] relative">
          {children}
        </div>

        {/* Floating Toast Notification */}
        {toast && toast.visible && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div
              className={`px-4 py-2.5 rounded-full backdrop-blur-md shadow-2xl flex items-center gap-2 text-xs font-semibold border ${
                toast.type === 'error'
                  ? 'bg-error-container text-on-error-container border-error/30'
                  : toast.type === 'info'
                  ? 'bg-surface-container-highest text-on-surface border-tertiary/30'
                  : 'bg-primary-container text-on-primary-container border-primary/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {toast.type === 'error'
                  ? 'cancel'
                  : toast.type === 'info'
                  ? 'info'
                  : 'check_circle'}
              </span>
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Device Home Indicator Bar */}
        {deviceFrameMode && (
          <div className="w-full flex items-center justify-center py-2 pointer-events-none bg-surface pb-safe">
            <div className="w-32 h-1 bg-outline-variant/60 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
