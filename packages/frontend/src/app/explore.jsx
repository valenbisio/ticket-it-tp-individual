import React from 'react';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { NativeCard, NativeScreen } from '../components/NativeScreen.jsx';

export default function ExploreRoute() {
  const router = useRouter(); const { events, setSelectedEventId } = useApp();
  return <NativeScreen title="Explorar eventos">{events.filter(e => e.status !== 'draft').map(event => <NativeCard key={event.id} title={event.name} detail={`${event.category} · ${event.displayDate} · ${event.venue}`} action={`Desde $${Math.min(...event.tiers.map(t => t.price)).toLocaleString('es-AR')} · Ver evento`} onPress={() => { setSelectedEventId(event.id); router.push('/event'); }} />)}</NativeScreen>;
}
