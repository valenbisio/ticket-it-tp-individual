import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, StatusBar } from 'react-native';
import { AppProvider } from '../contexts/AppContext.jsx';
import { AuthProvider } from '../contexts/auth-context.jsx';
import { DynamicQRModal } from '../components/common/DynamicQRModal.jsx';
import { colors } from '../data/theme.js';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={colors.surface} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface }, animation: 'slide_from_right' }} />
          <DynamicQRModal />
        </View>
      </AppProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});
