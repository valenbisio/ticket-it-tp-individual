import { Redirect, type Href } from 'expo-router';
import AppTabs from '@/components/app-tabs';
import { useAuth } from '@/contexts/auth-context';

export default function TabsLayout() {
  const { estado } = useAuth();
  if (estado === 'cargando') return null;
  if (!estado) return <Redirect href={'/login' as Href} />;
  return <AppTabs />;
}
