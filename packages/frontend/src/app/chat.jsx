import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { NativeButton, NativeCard, NativeInput, NativeScreen, NativeText } from '../components/NativeScreen.jsx';

export default function ChatRoute() {
  const { chats, purchases, selectedPurchaseId, currentUser, sendChatMessage } = useApp(); const [text, setText] = useState('');
  const purchase = purchases.find(p => p.id === selectedPurchaseId); const messages = purchase ? chats[purchase.id] || [] : [];
  if (!purchase) return <NativeScreen title="Chat"><NativeText>Compra no encontrada.</NativeText></NativeScreen>;
  return <NativeScreen title="Chat de compra"><NativeText>{purchase.eventName} · Orden #{purchase.id}</NativeText>{messages.map(message => <NativeCard key={message.id} title={message.senderId === currentUser.id ? 'Vos' : message.senderName} detail={`${message.text}\n${message.timestamp}`} />)}<NativeInput value={text} onChangeText={setText} placeholder="Escribí tu mensaje" multiline /><NativeButton label="Enviar mensaje" onPress={() => { if (text.trim()) { sendChatMessage(purchase.id, text); setText(''); } }} /></NativeScreen>;
}
