import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

const CRITERIA_OPTIONS = [
  { id: 'qr', label: 'Ingreso con QR ágil', icon: 'speed' },
  { id: 'sound', label: 'Sonido y Acústica', icon: 'volume_up' },
  { id: 'punctual', label: 'Puntualidad', icon: 'schedule' },
  { id: 'staff', label: 'Atención del staff', icon: 'support_agent' },
  { id: 'venue', label: 'Predio y Comodidad', icon: 'chair' },
];

const RATING_LABELS = {
  1: 'Muy mala experiencia (1/5)',
  2: 'Regular, puede mejorar (2/5)',
  3: 'Buena experiencia (3/5)',
  4: '¡Muy buen evento! (4/5)',
  5: '¡Excelente experiencia! (5/5)',
};

export const RateEventScreen = () => {
  const {
    purchases,
    selectedPurchaseId,
    currentUser,
    submitReview,
    goBack,
  } = useApp();

  const purchase =
    purchases.find((p) => p.id === selectedPurchaseId) || purchases[0];

  const [rating, setRating] = useState(5);
  const [selectedCriteria, setSelectedCriteria] = useState([
    'Ingreso con QR ágil',
    'Sonido y Acústica',
  ]);
  const [comment, setComment] = useState(
    'Increíble evento, el ingreso con el QR dinámico fue súper veloz y la organización impecable.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!purchase) {
    return (
      <div className="p-8 text-center text-on-surface">
        Compra no encontrada para calificar
      </div>
    );
  }

  const toggleCriterion = (label) => {
    setSelectedCriteria((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitReview(
        purchase.id,
        purchase.eventId,
        rating,
        selectedCriteria,
        comment.trim()
      );
      setIsSubmitting(false);
      goBack();
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col w-full bg-surface pb-12 pt-3 px-4 space-y-5">
      {/* Verification Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
          <span className="inline-flex p-1 rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[16px]">
              verified_user
            </span>
          </span>
          <span>Asistencia Verificada</span>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface-container-highest text-tertiary font-mono font-bold">
          Orden #{purchase.id}
        </span>
      </div>

      {/* Event Mini-Card */}
      <div className="rounded-2xl bg-surface-container p-4 shadow-md border border-surface-container-high/60 flex gap-3">
        <div className="w-16 h-20 rounded-xl overflow-hidden bg-surface-container-high shrink-0 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80"
            alt={purchase.eventName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-2 py-0.2 rounded-full bg-surface-variant text-on-surface-variant font-semibold">
              Entrada utilizada
            </span>
            <span className="text-[10px] text-primary font-bold">
              {purchase.tierName}
            </span>
          </div>
          <h2 className="font-headline font-bold text-sm text-on-surface truncate">
            {purchase.eventName}
          </h2>
          <p className="text-[11px] text-on-surface-variant truncate">
            {purchase.organizerName}
          </p>
        </div>
      </div>

      {/* Star Rating Section */}
      <div className="flex flex-col items-center text-center space-y-2 pt-1">
        <p className="font-headline font-bold text-base text-on-surface">
          ¿Qué tal estuvo tu experiencia general?
        </p>
        <p className="text-xs text-on-surface-variant">
          Toca las estrellas para calificar el show y los accesos
        </p>

        {/* 5 Stars */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setRating(val)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high transition-transform active:scale-95"
            >
              <span
                className={`material-symbols-outlined text-[30px] transition-colors ${
                  val <= rating ? 'text-amber-400' : 'text-outline-variant'
                }`}
                style={{ fontVariationSettings: val <= rating ? "'FILL' 1" : "'FILL' 0" }}
              >
                star
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic Rating Feedback Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <span
            className="material-symbols-outlined text-[15px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span>{RATING_LABELS[rating]}</span>
        </div>
      </div>

      {/* Aspectos Destacados (Criteria Chips) */}
      <div className="flex flex-col space-y-2">
        <label className="text-xs font-bold text-on-surface">
          Aspectos destacados
        </label>
        <div className="flex flex-wrap gap-2">
          {CRITERIA_OPTIONS.map((opt) => {
            const isSelected = selectedCriteria.includes(opt.label);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleCriterion(opt.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {opt.icon}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comentario de Texto */}
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-on-surface">
            Tu reseña sobre la organización
          </label>
          <span className="text-tertiary">Comprador: {currentUser.name}</span>
        </div>
        <div className="relative rounded-2xl bg-surface-container p-3 border border-surface-container-high/60">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            rows={4}
            placeholder="Comparte cómo fue tu experiencia, sonido, logística y accesos..."
            className="w-full bg-transparent text-on-surface placeholder:text-outline text-xs outline-none resize-none leading-relaxed"
          />
          <div className="flex justify-between items-center pt-2 text-[11px] text-on-surface-variant border-t border-surface-container-high/40">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">
                verified
              </span>
              Reseña pública verificada
            </span>
            <span>{comment.length}/500</span>
          </div>
        </div>
      </div>

      {/* Public Notice */}
      <div className="rounded-xl bg-surface-container-low p-3 flex items-start gap-2.5 border border-surface-container-high/40 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-tertiary text-[17px] shrink-0 mt-0.5">
          shield
        </span>
        <p className="leading-relaxed">
          Tu reseña se mostrará en el perfil del organizador para orientar a futuros compradores.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          disabled={isSubmitting || !comment.trim()}
          onClick={handleSubmit}
          className={`w-full h-12 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
            isSubmitting || !comment.trim()
              ? 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-container text-on-primary shadow-primary/20'
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">
                refresh
              </span>
              <span>Publicando...</span>
            </>
          ) : (
            <>
              <span>Publicar Reseña</span>
              <span className="material-symbols-outlined text-[18px]">send</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={goBack}
          className="w-full h-11 rounded-xl bg-transparent text-on-surface-variant hover:text-on-surface font-semibold text-xs transition-colors"
        >
          Ahora no / Volver
        </button>
      </div>
    </div>
  );
};
