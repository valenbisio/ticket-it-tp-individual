import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export default function AppTabs() {
  const scheme = useColorScheme();
  const { estado } = useAuth();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{estado && estado !== 'cargando' && estado.usuario.rol === 'organizador' ? 'Organizador' : 'Inicio'}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      
      {estado && estado !== 'cargando' && estado.usuario.rol === 'comprador' && <NativeTabs.Trigger name="compras">
        <NativeTabs.Trigger.Label>Mis compras</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="ticket" md="confirmation_number" />
      </NativeTabs.Trigger>}

      {estado && estado !== 'cargando' && estado.usuario.rol === 'comprador' && <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>}
    </NativeTabs>
  );
}
