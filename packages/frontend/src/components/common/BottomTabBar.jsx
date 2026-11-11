import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useApp } from '../../contexts/AppContext.jsx';
import { colors, spacing, borderRadius } from '../../data/theme.js';

export const BottomTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentRole, purchases } = useApp();

  const buyerActivePurchasesCount = purchases.filter(
    (p) => p.status === 'confirmada' || p.status === 'pendiente de pago'
  ).length;

  if (currentRole === 'buyer') {
    const isExplore = pathname.includes('explore') || pathname === '/' || pathname === '';
    const isPurchases = pathname.includes('purchases');

    return (
      <View style={styles.tabBarContainer}>
        {/* Tab 1: Explorar */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Explorar catálogo de eventos"
          onPress={() => router.push('/(buyer)/explore')}
          style={styles.tabItem}
        >
          <View style={[styles.iconBox, isExplore && styles.activeIconBox]}>
            <Text style={[styles.iconText, isExplore && styles.activeIconText]}>🔍</Text>
          </View>
          <Text style={[styles.tabLabel, isExplore && styles.activeTabLabel]}>
            Explorar
          </Text>
        </Pressable>

        {/* Tab 2: Mis Compras */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Mis compras y tickets adquiridos"
          onPress={() => router.push('/(buyer)/purchases')}
          style={styles.tabItem}
        >
          <View style={[styles.iconBox, isPurchases && styles.activeIconBox]}>
            <Text style={[styles.iconText, isPurchases && styles.activeIconText]}>🎟️</Text>
            {buyerActivePurchasesCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{buyerActivePurchasesCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, isPurchases && styles.activeTabLabel]}>
            Mis compras
          </Text>
        </Pressable>

        {/* Tab 3: Cambiar Rol */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cambiar de rol o usuario"
          onPress={() => router.push('/')}
          style={styles.tabItem}
        >
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>👤</Text>
          </View>
          <Text style={styles.tabLabel}>Roles</Text>
        </Pressable>
      </View>
    );
  }

  // Organizer bottom tabs
  const isEvents = pathname.includes('events');
  const isCreate = pathname.includes('create');

  return (
    <View style={styles.tabBarContainer}>
      {/* Tab 1: Mis Eventos */}
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel="Lista de mis eventos publicados"
        onPress={() => router.push('/(organizer)/events')}
        style={styles.tabItem}
      >
        <View style={[styles.iconBox, isEvents && styles.activeIconBox]}>
          <Text style={[styles.iconText, isEvents && styles.activeIconText]}>🎪</Text>
        </View>
        <Text style={[styles.tabLabel, isEvents && styles.activeTabLabel]}>
          Mis Eventos
        </Text>
      </Pressable>

      {/* Tab 2: Crear Evento */}
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel="Publicar nuevo evento"
        onPress={() => router.push('/(organizer)/create')}
        style={styles.tabItem}
      >
        <View style={[styles.iconBox, isCreate && styles.activeIconBox, styles.createIconBox]}>
          <Text style={[styles.iconText, styles.createIconText]}>＋</Text>
        </View>
        <Text style={[styles.tabLabel, isCreate && styles.activeTabLabel]}>
          Crear Evento
        </Text>
      </Pressable>

      {/* Tab 3: Cambiar Rol */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cambiar de rol o usuario"
        onPress={() => router.push('/')}
        style={styles.tabItem}
      >
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>👤</Text>
        </View>
        <Text style={styles.tabLabel}>Roles</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeIconBox: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  createIconBox: {
    backgroundColor: colors.tertiaryContainer,
  },
  iconText: {
    fontSize: 18,
    color: colors.onSurfaceVariant,
  },
  activeIconText: {
    color: colors.primary,
  },
  createIconText: {
    color: colors.onTertiary,
    fontWeight: 'bold',
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '800',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.onPrimaryContainer,
    fontSize: 9,
    fontWeight: 'bold',
  },
});
