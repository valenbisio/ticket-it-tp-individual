import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const useChat = (purchaseId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!purchaseId) return;
    let isMounted = true;
    api.getChatMessages(purchaseId).then((data) => {
      if (isMounted) {
        setMessages(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [purchaseId]);

  const sendMessage = async (messageData) => {
    const sent = await api.sendChatMessage(purchaseId, messageData);
    setMessages((prev) => [...prev, sent]);
    return sent;
  };

  return { messages, loading, sendMessage };
};
