import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const useChat = (purchaseId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (!purchaseId || !userId) {
      setMessages([]);
      setLoading(false);
      setError('');
      return () => { isMounted = false; };
    }

    setLoading(true);
    setError('');
    api.getChatMessages(purchaseId, userId)
      .then((data) => {
        if (isMounted) setMessages(data);
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message || 'No se pudo cargar la conversación.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [purchaseId, userId]);

  const sendMessage = async (messageData) => {
    if (!purchaseId || !userId) throw new Error('Falta identificar la compra o el usuario.');
    try {
      const sent = await api.sendChatMessage(purchaseId, userId, messageData);
      setMessages((prev) => [...prev, sent]);
      setError('');
      return sent;
    } catch (requestError) {
      setError(requestError.message || 'No se pudo enviar el mensaje.');
      throw requestError;
    }
  };

  return { messages, loading, error, sendMessage };
};
