import React from 'react';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { NativeCard, NativeScreen } from '../components/NativeScreen.jsx';

export default function OrganizerRoute() {
  const router = useRouter(); const { events, currentUser, setSelectedEventId } = useApp();
  return <NativeScreen title="Mis eventos">{events.filter(e => e.organizerId === currentUser.id).map(e => <NativeCard key={e.id} title={e.name} detail={e.tiers.map(t => `${t.name}: ${Math.max(0,t.totalQuota-t.soldCount)} disponibles`).join(' · ')} action="Ver compras" onPress={() => { setSelectedEventId(e.id); router.push('/organizer-event'); }} />)}<NativeCard title="Crear evento" action="Continuar →" onPress={() => router.push('/create-event')} /></NativeScreen>;
}
