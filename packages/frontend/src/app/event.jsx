import React from 'react';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { NativeCard, NativeScreen, NativeText } from '../components/NativeScreen.jsx';

export default function EventRoute() {
  const router = useRouter(); const { events, selectedEventId, createPurchase, showToast } = useApp(); const event = events.find(e => e.id === selectedEventId);
  if (!event) return <NativeScreen title="Evento no encontrado" />;
  return <NativeScreen title={event.name}><NativeText>{event.description}</NativeText><NativeText>{event.displayDate} · {event.venue}</NativeText>{event.tiers.map(tier => <NativeCard key={tier.id} title={tier.name} detail={`$${tier.price.toLocaleString('es-AR')} · ${Math.max(0,tier.totalQuota-tier.soldCount)} disponibles`} action="Comprar 1 entrada" onPress={() => { const purchase = createPurchase(event.id,tier.id,1); if (purchase) { showToast('Compra realizada'); router.push('/purchases'); } }} />)}</NativeScreen>;
}
