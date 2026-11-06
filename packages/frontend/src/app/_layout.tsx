import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { Stack, router, useSegments, type Href } from 'expo-router';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/contexts/auth-context';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Navegacion />
      </AuthProvider>
    </ThemeProvider>
  );
}

function Navegacion() {
  const { estado } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (estado === 'cargando') return;
    const estaEnLogin = String(segments[0]) === 'login';
    if (!estado && !estaEnLogin) router.replace('/login' as Href);
    if (estado && estaEnLogin) router.replace('/' as Href);
  }, [estado, segments]);

  return (
    <>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
