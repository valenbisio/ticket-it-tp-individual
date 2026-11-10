import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';

const CATEGORIES = ['Recitales', 'Festivales', 'Teatro', 'Conferencias', 'Deportes'];

export const CreateEventScreen = () => {
  const { createEvent, navigateTo, showToast, goBack } = useApp();

  // Tomorrow's date ISO
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [name, setName] = useState('Sunset Sessions & Live Beats');
  const [category, setCategory] = useState('Festivales');
  const [description, setDescription] = useState(
    'Una experiencia sensorial con los mejores exponentes del indie y synth-pop bajo el atardecer en el corazón de la ciudad. Gastronomía, visuales y acústica 360°.'
  );
  const [date, setDate] = useState(tomorrowStr);
  const [doorTime, setDoorTime] = useState('17:00');
  const [showTime, setShowTime] = useState('19:30');
  const [venue, setVenue] = useState('Hipódromo de Palermo, CABA');
  const [venueAddress, setVenueAddress] = useState('Av. del Libertador 4101, CABA');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80'
  );

  // Dynamic Tiers
  const [tiers, setTiers] = useState([
    {
      id: 'tier-1',
      name: 'Entrada General - Campo',
      description: 'Acceso a campo general y sector gastronómico',
      price: 15000,
      totalQuota: 200,
      soldCount: 0,
    },
    {
      id: 'tier-2',
      name: 'VIP Early Access',
      description: 'Acceso prioritario y consumición de cortesía',
      price: 25000,
      totalQuota: 50,
      soldCount: 0,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add tier
  const handleAddTier = () => {
    const newTierId = `tier-${Date.now()}`;
    setTiers((prev) => [
      ...prev,
      {
        id: newTierId,
        name: `Sector Especial #${prev.length + 1}`,
        description: 'Ubicación preferencial',
        price: 18000,
        totalQuota: 100,
        soldCount: 0,
      },
    ]);
  };

  // Remove tier
  const handleRemoveTier = (tierId) => {
    if (tiers.length === 1) {
      showToast('Se requiere al menos 1 tipo de entrada', 'error');
      return;
    }
    setTiers((prev) => prev.filter((t) => t.id !== tierId));
  };

  // Update tier field
  const handleUpdateTier = (tierId, field, value) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, [field]: value } : t))
    );
  };

  // Calculations
  const totalCapacity = tiers.reduce((sum, t) => sum + (Number(t.totalQuota) || 0), 0);
  const totalPotentialRevenue = tiers.reduce(
    (sum, t) => sum + (Number(t.price) || 0) * (Number(t.totalQuota) || 0),
    0
  );

  // Live Validations
  const ruleMinTiers = tiers.length >= 1;
  const rulePositiveValues =
    tiers.length > 0 &&
    tiers.every((t) => Number(t.price) > 0 && Number(t.totalQuota) > 0);
  const ruleFutureDate = !!date && new Date(date) >= new Date(tomorrowStr);
  const ruleValidName = name.trim().length > 3;

  const isFormValid =
    ruleMinTiers && rulePositiveValues && ruleFutureDate && ruleValidName;

  const handlePublish = (e) => {
    e.preventDefault();

    if (!isFormValid) {
      showToast('Por favor verifica los requisitos antes de publicar', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Format display date
      const parts = date.split('-');
      const dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const displayDateStr = dObj.toLocaleDateString('es-AR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      createEvent({
        name: name.trim(),
        category,
        description: description.trim(),
        date,
        displayDate: displayDateStr,
        doorTime,
        showTime,
        venue: venue.trim(),
        venueAddress: venueAddress.trim(),
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        tiers: tiers.map((t) => ({
          ...t,
          price: Number(t.price),
          totalQuota: Number(t.totalQuota),
          soldCount: 0,
        })),
      });

      setIsSubmitting(false);
      navigateTo('organizer_events');
    }, 700);
  };

  const handleSaveDraft = () => {
    showToast('Borrador guardado localmente en memoria', 'info');
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-36 pt-2 px-4 space-y-5">
      {/* Dynamic Glow Ambient Banner */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-surface-container-low p-4 shadow-md border border-surface-container-high/60">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-1">
          <span className="material-symbols-outlined text-[13px]">bolt</span>
          Consola de Producción
        </div>
        <h2 className="font-headline font-bold text-lg text-on-surface">
          Crear Nuevo Evento
        </h2>
        <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
          Publica tu show, configura tipos de entrada y cupos en tiempo real con auditoría de aforo instantánea.
        </p>
      </div>

      <form onSubmit={handlePublish} className="flex flex-col gap-5">
        {/* SECTION 1: DATOS GENERALES */}
        <section className="flex flex-col gap-3.5 bg-surface-container-low rounded-2xl p-4 shadow-sm border border-surface-container-high/50">
          <div className="flex items-center justify-between pb-1 border-b border-surface-container-high/40">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[16px]">
                  edit_note
                </span>
              </span>
              <h3 className="font-headline font-bold text-xs sm:text-sm text-on-surface">
                1. Datos Generales
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
              Requerido
            </span>
          </div>

          {/* Event Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">
              Nombre del Evento *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Sunset Sessions & Live Beats"
              className="w-full h-11 px-3 bg-surface-container rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">
              Categoría
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                    category === cat
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-on-surface-variant">
                Descripción
              </label>
              <span className="text-[10px] text-outline">
                {description.length}/500
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la experiencia, normas de ingreso y beneficios..."
              className="w-full p-2.5 bg-surface-container rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary/50 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Date & Times Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">
                Fecha del Evento *
              </label>
              <input
                type="date"
                required
                min={tomorrowStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-3 bg-surface-container rounded-xl text-xs text-on-surface outline-none border border-surface-container-high"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Apertura
                </label>
                <input
                  type="time"
                  value={doorTime}
                  onChange={(e) => setDoorTime(e.target.value)}
                  className="w-full h-11 px-2.5 bg-surface-container rounded-xl text-xs text-on-surface outline-none border border-surface-container-high text-center"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Inicio Show
                </label>
                <input
                  type="time"
                  value={showTime}
                  onChange={(e) => setShowTime(e.target.value)}
                  className="w-full h-11 px-2.5 bg-surface-container rounded-xl text-xs text-on-surface outline-none border border-surface-container-high text-center"
                />
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">
              Lugar / Predio *
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Ej. Hipódromo de Palermo, CABA"
              className="w-full h-11 px-3 bg-surface-container rounded-xl text-xs text-on-surface outline-none border border-surface-container-high"
            />
          </div>

          {/* Venue Address */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">
              Dirección exacta
            </label>
            <input
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Av. del Libertador 4101"
              className="w-full h-11 px-3 bg-surface-container rounded-xl text-xs text-on-surface outline-none border border-surface-container-high"
            />
          </div>

          {/* Flyer Preview */}
          <div className="flex flex-col gap-1.5 pt-1">
            <label className="text-xs font-semibold text-on-surface-variant">
              Portada Promocional
            </label>
            <div className="relative w-full h-28 rounded-xl overflow-hidden bg-surface-container border border-surface-container-high">
              <img
                src={imageUrl}
                alt="Portada"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent flex items-end p-2.5 justify-between">
                <span className="text-[11px] text-on-surface font-semibold truncate max-w-[200px]">
                  sunset_keyart_2025.webp
                </span>
                <span className="text-[10px] text-tertiary bg-surface/80 px-2 py-0.5 rounded-full font-bold">
                  Listo
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: DYNAMIC TICKET TIERS */}
        <section className="flex flex-col gap-3.5 bg-surface-container-low rounded-2xl p-4 shadow-sm border border-surface-container-high/50">
          <div className="flex items-center justify-between pb-1 border-b border-surface-container-high/40">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[16px]">
                  confirmation_number
                </span>
              </span>
              <h3 className="font-headline font-bold text-xs sm:text-sm text-on-surface">
                2. Tipos de Entrada
              </h3>
            </div>
            <span className="text-[10px] text-tertiary font-bold bg-tertiary/10 px-2 py-0.5 rounded-full">
              ({tiers.length} configurados)
            </span>
          </div>

          <p className="text-[11px] text-on-surface-variant">
            Configura los sectores para venta directa. Los cupos descontarán aforo automáticamente.
          </p>

          {/* Tiers List */}
          <div className="flex flex-col gap-3">
            {tiers.map((tier, index) => (
              <div
                key={tier.id}
                className="p-3.5 rounded-2xl bg-surface-container flex flex-col gap-3 border border-surface-container-high/60 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-bold text-on-surface">
                      Sector {index + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveTier(tier.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error-container/20 transition-colors"
                    title="Eliminar este tipo de entrada"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      delete
                    </span>
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                    Nombre del tipo
                  </label>
                  <input
                    type="text"
                    required
                    value={tier.name}
                    onChange={(e) =>
                      handleUpdateTier(tier.id, 'name', e.target.value)
                    }
                    placeholder="Ej. Campo General"
                    className="w-full h-10 px-3 bg-surface-container-high rounded-lg text-xs text-on-surface outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                      Precio ($ ARS)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={tier.price}
                      onChange={(e) =>
                        handleUpdateTier(tier.id, 'price', e.target.value)
                      }
                      className="w-full h-10 px-3 bg-surface-container-high rounded-lg text-xs text-on-surface outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                      Cupo total
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={tier.totalQuota}
                      onChange={(e) =>
                        handleUpdateTier(tier.id, 'totalQuota', e.target.value)
                      }
                      className="w-full h-10 px-3 bg-surface-container-high rounded-lg text-xs text-on-surface outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddTier}
            className="w-full h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 border border-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">
              add_circle
            </span>
            <span>+ Agregar Tipo de Entrada</span>
          </button>
        </section>

        {/* SECTION 3: BALANCE PROYECTADO Y AFORO */}
        <section className="flex flex-col gap-2.5 bg-gradient-to-br from-surface-container-high via-surface-container-low to-surface-container-lowest p-4 rounded-2xl shadow-lg border border-surface-container-high/60 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <h4 className="font-bold text-on-surface">Balance Proyectado</h4>
            </div>
            <span className="text-[10px] text-tertiary font-bold uppercase tracking-wider">
              Cálculo Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-surface-container/80 p-3 rounded-xl flex flex-col gap-0.5 border border-surface-container-high/40">
              <span className="text-[10px] text-on-surface-variant">
                Aforo Total
              </span>
              <span className="font-headline font-extrabold text-base text-on-surface">
                {totalCapacity}{' '}
                <span className="text-[10px] text-on-surface-variant font-normal">
                  pers.
                </span>
              </span>
            </div>

            <div className="bg-surface-container/80 p-3 rounded-xl flex flex-col gap-0.5 border border-surface-container-high/40">
              <span className="text-[10px] text-on-surface-variant">
                Recaudación Máx
              </span>
              <span className="font-headline font-extrabold text-base text-tertiary truncate">
                ${totalPotentialRevenue.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 4: VALIDATION STATUS CHECKLIST */}
        <section className="flex flex-col gap-2 bg-surface-container-lowest/60 p-3.5 rounded-2xl border border-surface-container-high/40 text-xs">
          <span className="text-[10px] text-outline uppercase font-bold tracking-wider">
            Requisitos de Publicación
          </span>
          <div className="flex flex-col gap-1.5">
            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg ${
                ruleMinTiers
                  ? 'text-tertiary bg-tertiary/10'
                  : 'text-error bg-error-container/20'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {ruleMinTiers ? 'check_circle' : 'cancel'}
              </span>
              <span>Al menos 1 tipo de entrada configurado</span>
            </div>

            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg ${
                rulePositiveValues
                  ? 'text-tertiary bg-tertiary/10'
                  : 'text-error bg-error-container/20'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {rulePositiveValues ? 'check_circle' : 'cancel'}
              </span>
              <span>Precios y cupos mayores a 0</span>
            </div>

            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg ${
                ruleFutureDate
                  ? 'text-tertiary bg-tertiary/10'
                  : 'text-error bg-error-container/20'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {ruleFutureDate ? 'check_circle' : 'cancel'}
              </span>
              <span>Fecha futura validada</span>
            </div>
          </div>
        </section>

        {/* FIXED BOTTOM ACTION DECK */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl p-4 pb-safe border-t border-surface-container-high/60 shadow-2xl">
          <div className="flex items-center gap-2.5 max-w-lg mx-auto w-full">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="h-12 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[17px]">save</span>
              <span>Borrador</span>
            </button>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`h-12 flex-1 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                !isFormValid || isSubmitting
                  ? 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-container text-on-primary shadow-primary/25'
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
                  <span className="material-symbols-outlined text-[18px]">
                    rocket_launch
                  </span>
                  <span>Publicar Evento</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
