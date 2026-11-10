import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const DynamicQRModal = () => {
  const { qrModalPurchase, closeQRModal } = useApp();
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [nonce, setNonce] = useState('8492-A');

  useEffect(() => {
    if (!qrModalPurchase) return;

    setSecondsLeft(15);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setNonce(`${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [qrModalPurchase]);

  if (!qrModalPurchase) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl flex flex-col justify-end sm:justify-center p-4 transition-opacity animate-in fade-in duration-200"
      onClick={closeQRModal}
    >
      <div
        className="bg-surface-container rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center max-w-sm mx-auto w-full relative border border-surface-container-high"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeQRModal}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors active:scale-90"
          aria-label="Cerrar modal"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Security Badge */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping" />
          <span className="text-xs uppercase tracking-wider text-tertiary font-bold">
            Código Dinámico Anti-Fraude
          </span>
        </div>

        {/* Scannable Surface with Animated Laser */}
        <div className="relative w-56 h-56 bg-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border-2 border-primary/20">
          <svg className="w-full h-full text-[#0b1326]" viewBox="0 0 100 100">
            {/* Corner Marker Top Left */}
            <rect fill="currentColor" height="26" rx="4" width="26" x="5" y="5" />
            <rect fill="white" height="18" rx="2" width="18" x="9" y="9" />
            <rect fill="currentColor" height="10" width="10" x="13" y="13" />

            {/* Corner Marker Top Right */}
            <rect fill="currentColor" height="26" rx="4" width="26" x="69" y="5" />
            <rect fill="white" height="18" rx="2" width="18" x="73" y="9" />
            <rect fill="currentColor" height="10" width="10" x="77" y="13" />

            {/* Corner Marker Bottom Left */}
            <rect fill="currentColor" height="26" rx="4" width="26" x="5" y="69" />
            <rect fill="white" height="18" rx="2" width="18" x="9" y="73" />
            <rect fill="currentColor" height="10" width="10" x="13" y="77" />

            {/* Simulated Data Pattern with dynamic variations */}
            <rect fill="currentColor" height="6" width="6" x="38" y="8" />
            <rect fill="currentColor" height="6" width="10" x="48" y="12" />
            <rect fill="currentColor" height="8" width="8" x="38" y="24" />
            <rect fill="currentColor" height="4" width="8" x="50" y="24" />
            <rect fill="currentColor" height="6" width="14" x="12" y="38" />
            <rect fill="currentColor" height="14" width="14" x="30" y="38" />
            <rect fill="currentColor" height="8" width="8" x="48" y="38" />
            <rect fill="currentColor" height="6" width="14" x="60" y="38" />
            <rect fill="currentColor" height="14" width="14" x="78" y="38" />
            <rect fill="currentColor" height="8" width="8" x="8" y="48" />
            <rect fill="currentColor" height="14" width="6" x="20" y="48" />
            <rect fill="currentColor" height="6" width="12" x="48" y="50" />
            <rect fill="currentColor" height="14" width="8" x="64" y="48" />
            <rect fill="currentColor" height="8" width="10" x="38" y="68" />
            <rect fill="currentColor" height="8" width="16" x="52" y="68" />
            <rect fill="currentColor" height="8" width="8" x="72" y="68" />
            <rect fill="currentColor" height="10" width="20" x="40" y="80" />
            <rect fill="currentColor" height="12" width="14" x="64" y="80" />
          </svg>

          {/* Animated Cyan Laser Bar */}
          <div className="absolute inset-x-0 h-1 bg-tertiary shadow-[0_0_14px_#4cd7f6] animate-scanline pointer-events-none" />
        </div>

        {/* Ticket Details */}
        <div className="flex flex-col gap-1 w-full">
          <span className="font-headline font-bold text-lg text-on-surface truncate">
            {qrModalPurchase.eventName}
          </span>
          <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant font-mono">
            <span>#{qrModalPurchase.id}</span>
            <span>•</span>
            <span>{qrModalPurchase.tierName} × {qrModalPurchase.quantity}</span>
            <span>•</span>
            <span className="text-tertiary font-bold">{nonce}</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Actualiza en{' '}
            <span className="text-tertiary font-bold">{secondsLeft}s</span> • Presentar con brillo al máximo
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={closeQRModal}
          className="w-full h-11 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-sm transition-colors active:scale-98"
        >
          Cerrar Pase
        </button>
      </div>
    </div>
  );
};
