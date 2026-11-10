import React from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { NativeButton, NativeCard, NativeScreen, Status } from '../components/NativeScreen.jsx';
import { useRouter } from 'expo-router';

export default function PurchasesRoute() {
  const router = useRouter(); const { purchases, currentUser, cancelAndRefundPurchase, payPendingPurchase, setSelectedPurchaseId } = useApp();
  return <NativeScreen title="Mis compras">{purchases.filter(p => p.buyerId === currentUser.id).map(p => <NativeCard key={p.id} title={p.eventName} detail={`${p.quantity} × ${p.tierName} · $${p.totalPrice.toLocaleString('es-AR')}`}><Status>{p.status.toUpperCase()}</Status>{p.status === 'confirmada' ? <NativeButton label="Cancelar y reembolsar" variant="danger" onPress={() => cancelAndRefundPurchase(p.id)} /> : null}{p.status === 'pendiente' ? <NativeButton label="Simular pago" onPress={() => payPendingPurchase(p.id)} /> : null}<NativeButton label="Abrir chat" variant="secondary" onPress={() => { setSelectedPurchaseId(p.id); router.push('/chat'); }} />{p.status === 'utilizada' ? <NativeButton label={p.hasRated ? 'Reseña enviada' : 'Calificar evento'} variant="secondary" disabled={p.hasRated} onPress={() => { setSelectedPurchaseId(p.id); router.push('/rate'); }} /> : null}</NativeCard>)}</NativeScreen>;
}
