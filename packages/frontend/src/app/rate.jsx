import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { NativeButton, NativeCard, NativeInput, NativeScreen, NativeText } from '../components/NativeScreen.jsx';

export default function RateRoute() {
  const router = useRouter(); const { purchases, selectedPurchaseId, submitReview } = useApp(); const [rating, setRating] = useState(5); const [comment, setComment] = useState('');
  const purchase = purchases.find(p => p.id === selectedPurchaseId);
  if (!purchase) return <NativeScreen title="Calificar"><NativeText>Compra no encontrada.</NativeText></NativeScreen>;
  return <NativeScreen title="Calificar evento"><NativeText>{purchase.eventName}</NativeText><NativeCard title={`Puntaje: ${rating}/5`} detail="Elegí un puntaje"><NativeButton label="−" variant="secondary" onPress={() => setRating(value => Math.max(1, value - 1))} /><NativeButton label="+" variant="secondary" onPress={() => setRating(value => Math.min(5, value + 1))} /></NativeCard><NativeInput value={comment} onChangeText={setComment} placeholder="Contá tu experiencia" multiline /><NativeButton label="Publicar reseña" onPress={() => { if (submitReview(purchase.id, purchase.eventId, rating, [], comment)) router.back(); }} /></NativeScreen>;
}
