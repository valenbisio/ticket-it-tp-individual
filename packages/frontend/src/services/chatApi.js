import { request, getApiUrl, getCurrentUserId } from './apiClient.js';
import { rolUI } from './mappers.js';

export const chatApi = {
  async getChatMessages(id, userId) {
    const result = await request(`/api/usuarios/${encodeURIComponent(userId)}/compras/${encodeURIComponent(id)}/mensajes`);
    return result.mensajes.map((message, index) => ({ id: message.id || `${id}-${index}`, senderId: message.usuario?.id, senderName: [message.usuario?.nombre, message.usuario?.apellido].filter(Boolean).join(' '), senderRole: rolUI(message.rol), text: message.mensaje, sentAt: message.enviado, timestamp: new Date(message.enviado).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) }));
  },
  connectChat(token, { onMessage, onOpen, onClose }) {
    const socketUrl = `${getApiUrl().replace(/\/+$/, '').replace(/^http/, 'ws')}/ws/chat`;
    const socket = new WebSocket(socketUrl);
    socket.addEventListener('open', () => socket.send(JSON.stringify({ type: 'authenticate', token })));
    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'ready') onOpen?.();
        onMessage?.(message);
      } catch {
        // Ignora frames que no cumplan el contrato de eventos JSON.
      }
    });
    socket.addEventListener('close', onClose || (() => {}));
    return socket;
  },
  async getConversations(userId = getCurrentUserId()) {
    const result = await request(`/api/usuarios/${encodeURIComponent(userId)}/mensajes`);
    return result.conversaciones.map((conversation) => ({
      id: conversation.compraId,
      eventId: conversation.eventoId,
      eventName: conversation.eventoNombre,
      eventDate: conversation.eventoFecha,
      participantName: conversation.participante.nombre || 'Usuario',
      participantRole: rolUI(conversation.participante.rol),
      lastMessage: conversation.ultimoMensaje,
      lastMessageAt: conversation.ultimoMensajeEnviado,
      unreadCount: conversation.mensajesNoLeidos,
    }));
  },
  async sendChatMessage(id, userId, message) {
    const result = await request(`/api/usuarios/${encodeURIComponent(userId)}/compras/${encodeURIComponent(id)}/mensajes`, { method: 'POST', body: { mensaje: message.text } });
    const sent = result.mensaje;
    return { id: sent.id || `${id}-${Date.parse(sent.enviado)}`, senderId: sent.usuarioId, text: sent.mensaje, senderName: [sent.usuario?.nombre, sent.usuario?.apellido].filter(Boolean).join(' '), senderRole: rolUI(sent.rol), sentAt: sent.enviado, timestamp: new Date(sent.enviado).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) };
  },
};
