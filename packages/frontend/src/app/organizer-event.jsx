import React from 'react';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { NativeButton, NativeCard, NativeScreen, NativeText, Status } from '../components/NativeScreen.jsx';

export default function OrganizerEventRoute() {
  const router = useRouter(); const { events, purchases, selectedEventId, markPurchaseAsUsed, setSelectedPurchaseId } = useApp(); const event = events.find(e => e.id === selectedEventId);
  if (!event) return <NativeScreen title="Evento"><NativeText>Evento no encontrado.</NativeText></NativeScreen>;
  const eventPurchases = purchases.filter(p => p.eventId === event.id);
  return <NativeScreen title={event.name}><NativeText>Ventas y cupos por tipo de entrada.</NativeText>{event.tiers.map(tier => <NativeCard key={tier.id} title={tier.name} detail={`${tier.soldCount} vendidas · ${Math.max(0, tier.totalQuota - tier.soldCount)} disponibles · $${tier.price.toLocaleString('es-AR')}`} />)}<NativeText>Compras asociadas</NativeText>{eventPurchases.map(purchase => <NativeCard key={purchase.id} title={`${purchase.buyerName} · ${purchase.tierName}`} detail={`${purchase.quantity} entradas · $${purchase.totalPrice.toLocaleString('es-AR')}`}><Status>{purchase.status.toUpperCase()}</Status>{purchase.status === 'confirmada' ? <NativeButton label="Registrar ingreso" onPress={() => markPurchaseAsUsed(purchase.id)} /> : null}<NativeButton label="Abrir chat" variant="secondary" onPress={() => { setSelectedPurchaseId(purchase.id); router.push('/chat'); }} /></NativeCard>)}</NativeScreen>;
}
