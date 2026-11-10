import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';

export const PurchaseChatScreen = () => {
  const {
    chats,
    purchases,
    selectedPurchaseId,
    currentUser,
    sendChatMessage,
    goBack,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const messagesEndRef = useRef(null);

  const purchase =
    purchases.find((p) => p.id === selectedPurchaseId) || purchases[0];

  const thread = (purchase && chats[purchase.id]) || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread.length]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !purchase) return;

    sendChatMessage(purchase.id, inputText);
    setInputText('');

  };

  const handleQuickReply = (text) => {
    setInputText(text);
  };

  if (!purchase) {
    return (
      <div className="p-8 text-center text-on-surface">
        Compra no encontrada
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full bg-surface min-h-[600px] relative pb-28">
      {/* Sub-header de Contexto del Evento */}
      <section className="sticky top-0 z-30 bg-surface-container-low/95 backdrop-blur-md px-4 py-2.5 shadow-md flex items-center justify-between border-b border-surface-container-high/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={goBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high -ml-1 active:scale-90"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-headline font-bold text-sm text-on-surface truncate">
                {purchase.eventName}
              </h2>
              <span
                className="material-symbols-outlined text-[14px] text-primary shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant truncate">
              Compra #{purchase.id} • {purchase.organizerName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTicketModal(true)}
          className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-primary shrink-0 active:scale-95 transition-transform"
          title="Ver detalle del pase vinculado"
        >
          <span className="material-symbols-outlined text-[18px]">
            confirmation_number
          </span>
        </button>
      </section>

      {/* Ticket Context Pill */}
      <div className="px-4 pt-3 pb-1">
        <div className="bg-surface-container-high/60 rounded-xl p-2.5 shadow-sm flex items-center justify-between border border-surface-container-high/80 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="material-symbols-outlined text-primary text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_activity
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-on-surface truncate">
                {purchase.tierName} × {purchase.quantity}
              </span>
              <span className="text-[10px] text-on-surface-variant truncate">
                {purchase.venue}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold shrink-0 capitalize">
            {purchase.status}
          </span>
        </div>
      </div>

      {/* Mensajes del Chat */}
      <div className="flex-1 flex flex-col px-4 py-3 space-y-3 overflow-y-auto">
        <div className="flex items-center justify-center my-1">
          <span className="px-3 py-1 bg-surface-container-lowest text-on-surface-variant text-[10px] font-semibold rounded-full border border-surface-container-high/50">
            Soporte Directo de Compra #{purchase.id}
          </span>
        </div>

        {thread.length === 0 ? (
          <div className="py-8 text-center text-xs text-on-surface-variant">
            No hay mensajes aún en esta conversación. Escribe el primer mensaje a continuación.
          </div>
        ) : (
          thread.map((msg) => {
            const isMe = msg.senderId === currentUser.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 w-full ${
                  isMe ? 'items-end pl-8' : 'items-start pr-8'
                }`}
              >
                <div className="flex items-center gap-1.5 text-on-surface-variant text-[10px]">
                  <span>{isMe ? `Tú (${currentUser.name})` : msg.senderName}</span>
                  <span className="opacity-70">{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3 rounded-2xl shadow-sm text-xs leading-relaxed max-w-[85%] ${
                    isMe
                      ? 'bg-primary-container text-on-primary-container rounded-tr-xs'
                      : 'bg-surface-container-high text-on-surface rounded-tl-xs border border-surface-container-highest/60'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                {isMe && (
                  <div className="flex items-center gap-1 text-[10px] text-on-surface-variant/70 pr-1">
                    <span>Enviado</span>
                    <span
                      className="material-symbols-outlined text-[13px] text-tertiary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      done_all
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sugerencias Rápidas */}
      <div className="px-4 py-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => handleQuickReply('¿A qué hora abren las puertas?')}
          className="px-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant text-[11px] whitespace-nowrap active:scale-95 transition-all"
        >
          ¿A qué hora abren las puertas?
        </button>
        <button
          type="button"
          onClick={() => handleQuickReply('¿Se puede salir y volver a ingresar?')}
          className="px-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant text-[11px] whitespace-nowrap active:scale-95 transition-all"
        >
          ¿Reingreso permitido?
        </button>
        <button
          type="button"
          onClick={() => handleQuickReply('¿Hay guardarropas en el predio?')}
          className="px-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant text-[11px] whitespace-nowrap active:scale-95 transition-all"
        >
          ¿Guardarropas?
        </button>
      </div>

      {/* Input de Mensaje Fijo Inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl px-4 py-2.5 pb-safe border-t border-surface-container-high/60 shadow-2xl">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 max-w-lg mx-auto"
        >
          <div className="relative flex-1 flex items-center bg-surface-container-high rounded-full px-4 py-1.5 shadow-inner border border-surface-container-highest">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Escribir a ${
                currentRole === 'buyer' ? purchase.organizerName : purchase.buyerName
              }...`}
              className="w-full bg-transparent text-on-surface placeholder:text-outline text-xs outline-none pr-2"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all active:scale-90 ${
              inputText.trim()
                ? 'bg-primary-container text-on-primary-container shadow-primary/30'
                : 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">send</span>
          </button>
        </form>
      </div>

      {/* Modal Desplegable de Ticket Vinculado */}
      {showTicketModal && (
        <div
          className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-sm flex items-end justify-center p-4"
          onClick={() => setShowTicketModal(false)}
        >
          <div
            className="bg-surface-container w-full max-w-md rounded-3xl p-5 pb-safe shadow-2xl border border-surface-container-high animate-in fade-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-outline-variant/60 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  qr_code_scanner
                </span>
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Detalle del Pase
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-4 mb-3 space-y-2 border border-surface-container-high/50 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-on-surface-variant text-[11px]">
                    {purchase.eventName}
                  </p>
                  <p className="font-bold text-sm text-on-surface">
                    {purchase.tierName} × {purchase.quantity}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary/15 text-tertiary text-[10px] font-bold">
                  {purchase.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant pt-1 border-t border-surface-container-high/50">
                <span>Orden #{purchase.id}</span>
                <span>Total ${purchase.totalPrice.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTicketModal(false)}
              className="w-full h-11 bg-primary text-on-primary font-bold text-xs rounded-xl flex items-center justify-center transition-colors"
            >
              Volver a la Conversación
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
