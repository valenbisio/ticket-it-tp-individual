import React from 'react';
import { useRouter } from 'expo-router';
import { NativeCard, NativeScreen, NativeText } from '../components/NativeScreen.jsx';
import { useApp } from '../contexts/AppContext.jsx';

export default function HomeRoute() {
  const router = useRouter(); const { setUser } = useApp();
  return <NativeScreen title="AI Ticket It"><NativeText>Eventos y entradas, en un solo lugar.</NativeText><NativeCard title="Soy comprador" detail="Explora eventos y gestiona tus entradas" action="Continuar →" onPress={() => { setUser('juan'); router.push('/explore'); }} /><NativeCard title="Soy organizador" detail="Publica eventos y gestiona las ventas" action="Continuar →" onPress={() => { setUser('salanorte'); router.push('/organizer'); }} /></NativeScreen>;
}
