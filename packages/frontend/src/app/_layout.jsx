import React from 'react';
import { Stack } from 'expo-router';
import { AppProvider } from '../contexts/AppContext.jsx';

export default function RootLayout() {
  return <AppProvider><Stack screenOptions={{ headerShown: false }} /></AppProvider>;
}
